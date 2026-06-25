/* =====================================================================
   BOLÃO COPA 2026 — WRAPPED
   Retrospectiva animada estilo Spotify Wrapped.
   Modos: geral (bolão inteiro) + por jogador.
   Construído sobre window.BolaoCore (core.js).
   ===================================================================== */
(function () {
    'use strict';

    var CORE = window.BolaoCore;
    var JOGADORES = CORE.JOGADORES;
    var getBandeira = CORE.getBandeira;
    var calcularPontos = CORE.calcularPontos;

    // Cores vivas por jogador (alinhadas às vars em wrapped.css)
    var COLORS = ['#ff2e6c', '#ffd23f', '#2ce5a0', '#9b6cff', '#38b6ff', '#ff7a1a'];
    var EMOJIS = { 'Alan': '🧠', 'Fernanda': '🌸', 'Jorge': '⚽', 'Lia': '💜', 'Raquel': '💙', 'Sueli': '🔥' };

    function colorOf(jogador) {
        var i = JOGADORES.indexOf(jogador);
        return i >= 0 ? COLORS[i] : '#ffffff';
    }

    var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var state = {
        dados: null,
        mode: 'geral',
        jogador: null,
        index: 0,
        slides: []
    };

    var hintHidden = false;

    // ------------------------------ Helpers ------------------------------
    function $(sel) { return document.querySelector(sel); }

    function fmtData(iso) {
        try {
            return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        } catch (e) { return ''; }
    }

    function esc(s) {
        return String(s).replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    }

    // ------------------------------ Cálculo ------------------------------
    function jogados() {
        return state.dados.jogos.filter(function (j) { return j.jogado && j.placar; });
    }

    function palpitesDe(jogador) {
        return state.dados.palpites[jogador] || {};
    }

    function pts(jogador, jogo) {
        return calcularPontos(palpitesDe(jogador)[String(jogo.id)], jogo);
    }

    // Ranking com posições (empate = mesma posição)
    function ranking() {
        var arr = JOGADORES.map(function (j) {
            var total = 0;
            jogados().forEach(function (g) { var p = pts(j, g); if (p != null) total += p; });
            return { jogador: j, pontos: total };
        });
        arr.sort(function (a, b) { return b.pontos - a.pontos; });
        var pos = 0, last = null;
        arr.forEach(function (r, i) {
            if (last === null || r.pontos !== last) { pos = i + 1; last = r.pontos; }
            r.pos = pos;
        });
        return arr;
    }

    // Rodadas = dias com jogos (ordenados asc)
    function rodadas() {
        var map = {};
        jogados().forEach(function (g) {
            var dia = String(g.dataHora).slice(0, 10);
            (map[dia] = map[dia] || []).push(g);
        });
        return Object.keys(map).sort().map(function (dia) { return { dia: dia, jogos: map[dia] }; });
    }

    // Série de pontos acumulados por jogador a cada rodada
    function seriesPorRodada() {
        var rds = rodadas();
        var series = {};
        JOGADORES.forEach(function (j) { series[j] = []; });
        rds.forEach(function (rd, ri) {
            JOGADORES.forEach(function (j) {
                var prev = ri === 0 ? 0 : series[j][ri - 1];
                var add = 0;
                rd.jogos.forEach(function (g) { var p = pts(j, g); if (p != null) add += p; });
                series[j].push(prev + add);
            });
        });
        return { rds: rds, series: series };
    }

    function cenario() {
        var j = jogados();
        var palpites = 0;
        j.forEach(function (g) {
            JOGADORES.forEach(function (p) { if (palpitesDe(p)[String(g.id)]) palpites++; });
        });
        return {
            jogos: j.length,
            palpites: palpites,
            jogadores: JOGADORES.length,
            rodadas: rodadas().length
        };
    }

    // 👑 O Profeta: mais placares exatos
    function profeta() {
        var arr = JOGADORES.map(function (j) {
            var ex = 0;
            jogados().forEach(function (g) { if (pts(j, g) === 3) ex++; });
            return { jogador: j, exatos: ex };
        }).sort(function (a, b) { return b.exatos - a.exatos; });
        var top = arr[0].exatos;
        var tied = arr.filter(function (x) { return x.exatos === top && top > 0; }).map(function (x) { return x.jogador; });
        return { tied: tied, exatos: top };
    }

    // 🤯 A Zebra: vitória de azarão — jogo COM VENCEDOR cujo resultado foi o menos
    // previsto (distinto do "Jogo Impossível", que mede pontos e costuma cair em empates).
    function zebra() {
        var best = null;
        jogados().forEach(function (g) {
            var temVencedor = g.placar.timeA !== g.placar.timeB;
            var votos = { A: 0, B: 0, E: 0 }, tot = 0, acertaram = 0;
            JOGADORES.forEach(function (j) {
                var p = palpitesDe(j)[String(g.id)];
                if (!p) return;
                tot++;
                var r = p.timeA > p.timeB ? 'A' : (p.timeB > p.timeA ? 'B' : 'E');
                votos[r]++;
                var pp = pts(j, g); if (pp != null && pp >= 1) acertaram++;
            });
            var real = temVencedor ? (g.placar.timeA > g.placar.timeB ? 'A' : 'B') : 'E';
            // surpresa = fração que NÃO previu o resultado real (1 = ninguém previu)
            var surpresa = tot ? (tot - votos[real]) / tot : 0;
            // só conta como zebra candidata se for vitória; empates viram "jogo difícil"
            var peso = temVencedor ? surpresa : -1;
            var cand = { jogo: g, acertaram: acertaram, surpresa: surpresa, previuReal: votos[real], tot: tot, peso: peso };
            if (!best
                || cand.peso > best.peso
                || (cand.peso === best.peso && cand.previuReal < best.previuReal)
                || (cand.peso === best.peso && cand.previuReal === best.previuReal && (g.placar.timeA + g.placar.timeB) > (best.jogo.placar.timeA + best.jogo.placar.timeB))) {
                best = cand;
            }
        });
        best.acertantes = JOGADORES.filter(function (j) { var p = pts(j, best.jogo); return p != null && p >= 1; });
        best.pct = Math.round(best.surpresa * 100);
        return best;
    }

    // 🌟 Rodada de Ouro: dia com maior soma de pontos do bolão
    function rodadaOuro() {
        var best = null;
        rodadas().forEach(function (rd) {
            var soma = 0, porJogador = {};
            JOGADORES.forEach(function (j) {
                var s = 0;
                rd.jogos.forEach(function (g) { var p = pts(j, g); if (p != null) s += p; });
                porJogador[j] = s; soma += s;
            });
            if (!best || soma > best.soma) best = { dia: rd.dia, jogos: rd.jogos.length, soma: soma, porJogador: porJogador };
        });
        var top = Object.entries(best.porJogador).sort(function (a, b) { return b[1] - a[1]; })[0];
        best.topJogador = top[0];
        best.topPts = top[1];
        return best;
    }

    // 🧩 O Jogo Impossível: jogo em que menos gente pontuou (>0)
    function jogoImpossivel() {
        var best = null;
        jogados().forEach(function (g) {
            var scored = 0;
            JOGADORES.forEach(function (j) { var p = pts(j, g); if (p != null && p > 0) scored++; });
            if (!best || scored < best.scored) best = { jogo: g, scored: scored };
        });
        return best;
    }

    // 👯 Gêmeos: par com palpites mais parecidos
    function gemeos() {
        var jg = jogados(), best = null;
        for (var a = 0; a < JOGADORES.length; a++) {
            for (var b = a + 1; b < JOGADORES.length; b++) {
                var ja = JOGADORES[a], jb = JOGADORES[b];
                var iguais = 0, ambos = 0, somaDiff = 0;
                jg.forEach(function (g) {
                    var pa = palpitesDe(ja)[String(g.id)], pb = palpitesDe(jb)[String(g.id)];
                    if (pa && pb) {
                        ambos++;
                        if (pa.timeA === pb.timeA && pa.timeB === pb.timeB) iguais++;
                        somaDiff += Math.abs(pa.timeA - pb.timeA) + Math.abs(pa.timeB - pb.timeB);
                    }
                });
                if (!ambos) continue;
                var frac = iguais / ambos, meanDiff = somaDiff / ambos;
                if (!best || frac > best.frac || (frac === best.frac && meanDiff < best.meanDiff)) {
                    best = { a: ja, b: jb, frac: frac, iguais: iguais, ambos: ambos, meanDiff: meanDiff };
                }
            }
        }
        return best;
    }

    // Estatísticas pessoais de um jogador
    function statsJogador(jogador) {
        var total = 0, ex = 0, vencedor = 0, erros = 0, count = 0, palpites = 0;
        var melhorPalpite = null, melhorSeq = 0, seq = 0;

        jogados().forEach(function (g) {
            var palpite = palpitesDe(jogador)[String(g.id)];
            if (!palpite) return;
            palpites++;
            var p = pts(jogador, g);
            if (p == null) return;
            count++; total += p;
            if (p === 3) {
                ex++; seq++; if (seq > melhorSeq) melhorSeq = seq;
                var soma = palpite.timeA + palpite.timeB;
                if (!melhorPalpite || soma > melhorPalpite.soma) melhorPalpite = { jogo: g, palpite: palpite, soma: soma };
            } else if (p === 1) { vencedor++; seq = 0; }
            else { erros++; seq = 0; }
        });

        var rk = ranking();
        var pos = rk.find(function (r) { return r.jogador === jogador; }).pos;

        var porDia = {};
        rodadas().forEach(function (rd) {
            var s = 0;
            rd.jogos.forEach(function (g) { var p = pts(jogador, g); if (p != null) s += p; });
            porDia[rd.dia] = s;
        });
        var entradas = Object.keys(porDia).map(function (k) { return [k, porDia[k]]; });
        var melhorDia = entradas.length ? entradas.reduce(function (x, y) { return y[1] > x[1] ? y : x; }) : null;
        var piorDia = entradas.length ? entradas.reduce(function (x, y) { return y[1] < x[1] ? y : x; }) : null;

        // 🍀 Jogo da sorte: pontuou quando pouquíssimos outros pontuaram
        var sorte = null;
        jogados().forEach(function (g) {
            var p = pts(jogador, g);
            if (p == null || p === 0) return;
            var outros = 0;
            JOGADORES.forEach(function (j) { if (j === jogador) return; var pp = pts(j, g); if (pp != null && pp > 0) outros++; });
            if (!sorte || outros < sorte.outros) sorte = { jogo: g, pontos: p, outros: outros };
        });

        var taxa = count > 0 ? Math.round((total / (count * 3)) * 100) : 0;

        return {
            jogador: jogador, pos: pos, totalJogadores: JOGADORES.length,
            total: total, ex: ex, vencedor: vencedor, erros: erros,
            jogadosCount: count, palpites: palpites, taxa: taxa,
            melhorSeq: melhorSeq, melhorPalpite: melhorPalpite,
            melhorDia: melhorDia, piorDia: piorDia, sorte: sorte
        };
    }

    // ----------------------------- Gráfico -------------------------------
    function buildChart(highlight) {
        var data = seriesPorRodada();
        var rds = data.rds, series = data.series;
        var W = 320, H = 168, padL = 10, padR = 12, padT = 12, padB = 20;
        var n = rds.length;
        var xStep = (W - padL - padR) / Math.max(1, n - 1);
        var allMax = 1;
        JOGADORES.forEach(function (j) { series[j].forEach(function (v) { if (v > allMax) allMax = v; }); });
        var yOf = function (v) { return H - padB - (v / allMax) * (H - padT - padB); };
        var xOf = function (i) { return padL + i * xStep; };

        // Linhas em ordem crescente de pontuação final → líder fica por último (no topo)
        var ord = JOGADORES.slice().sort(function (a, b) {
            return (series[a][series[a].length - 1] || 0) - (series[b][series[b].length - 1] || 0);
        });

        var grid = '';
        for (var k = 0; k <= 3; k++) {
            var y = padT + (k / 3) * (H - padT - padB);
            grid += '<line class="chart-grid" x1="' + padL + '" y1="' + y.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + y.toFixed(1) + '"></line>';
        }

        var rlabels = '';
        rds.forEach(function (rd, i) {
            if (i === 0 || i === n - 1 || i === Math.floor((n - 1) / 2)) {
                rlabels += '<text class="chart-axis-label" x="' + xOf(i).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle">' + fmtData(rd.dia).replace('.', '') + '</text>';
            }
        });

        var lines = '';
        ord.forEach(function (j, idx) {
            var arr = series[j];
            var d = arr.map(function (v, i) { return (i === 0 ? 'M' : 'L') + ' ' + xOf(i).toFixed(1) + ' ' + yOf(v).toFixed(1); }).join(' ');
            var cls = highlight ? (j === highlight ? 'hi' : 'dim') : '';
            var lastX = xOf(arr.length - 1), lastY = yOf(arr[arr.length - 1]);
            lines += '<path class="chart-line ' + cls + '" style="--i:' + idx + ';stroke:' + colorOf(j) + '" pathLength="1" d="' + d + '"></path>';
            if (highlight && j !== highlight) return;
            lines += '<circle class="chart-dot" style="--i:' + idx + '" cx="' + lastX.toFixed(1) + '" cy="' + lastY.toFixed(1) + '" r="3.4" fill="' + colorOf(j) + '"></circle>';
        });

        var legend = JOGADORES.map(function (j) {
            var dim = highlight && j !== highlight ? 'dim' : '';
            var v = series[j][series[j].length - 1] || 0;
            return '<span class="legend-item ' + dim + '"><span class="legend-dot" style="background:' + colorOf(j) + '"></span>' + esc(j) + ' <span class="legend-pts">' + v + '</span></span>';
        }).join('');

        return '<div class="chart-wrap reveal" style="--d:.2s">'
            + '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Evolução da pontuação por rodada">'
            + '<g>' + grid + rlabels + '</g>'
            + lines
            + '</svg>'
            + '<div class="chart-legend">' + legend + '</div>'
            + '</div>';
    }

    // ------------------------------ Renders ------------------------------
    function shell(grad, inner, styleAttr) {
        return '<section class="slide" data-grad="' + grad + '"' + (styleAttr ? ' style="' + styleAttr + '"' : '') + ' aria-hidden="true">'
            + '<div class="slide-inner">' + inner + '</div>'
            + '</section>';
    }

    function matchChip(g, extraDelay) {
        return '<span class="match-chip reveal" style="--d:' + extraDelay + 's">'
            + '<span class="teams">' + getBandeira(g.timeA) + ' ' + esc(g.timeA) + '</span>'
            + '<span class="score">' + g.placar.timeA + '×' + g.placar.timeB + '</span>'
            + '<span class="teams">' + esc(g.timeB) + ' ' + getBandeira(g.timeB) + '</span>'
            + '</span>';
    }

    // ---- Geral ----
    function rIntro() {
        return shell('magenta', ''
            + '<div class="intro-badge reveal" style="--d:.05s">⚽ o seu bolão · em retrospectiva</div>'
            + '<h1 class="mega reveal" style="--d:.18s">BOLÃO<br><span class="accent-italic">wrapped</span></h1>'
            + '<div class="intro-year reveal" style="--d:.34s">2026</div>'
            + '<p class="lead reveal" style="--d:.6s">Tudo que rolou nas ' + rodadas().length + ' rodadas — pontos, viradas e curiosidades.</p>'
        );
    }

    function rCenario() {
        var c = cenario();
        function stat(n, l, d) {
            return '<div class="scene-stat reveal" style="--d:' + d + 's"><div class="scene-num num">' + n + '</div><div class="scene-label">' + l + '</div></div>';
        }
        return shell('cyan', ''
            + '<p class="eyebrow reveal" style="--d:.05s">o cenário</p>'
            + '<h2 class="mega reveal" style="--d:.14s">até agora<br><span class="accent-italic">rolou</span></h2>'
            + '<div class="scene-grid">'
            + stat(c.jogos, 'jogos disputados', .28)
            + stat(c.rodadas, 'rodadas', .36)
            + stat(c.palpites, 'palpites no total', .44)
            + stat(c.jogadores, 'jogadores na disputa', .52)
            + '</div>'
        );
    }

    function rPodio() {
        var rk = ranking();
        var medals = { 1: 'gold', 2: 'silver', 3: 'bronze' };
        var emoji = { 1: '🥇', 2: '🥈', 3: '🥉' };
        var visual = [rk[1], rk[0], rk[2]];
        var steps = visual.map(function (r, vi) {
            var pos = r.pos;
            return '<div class="podium-step ' + medals[pos] + '" style="--pc:' + colorOf(r.jogador) + '">'
                + '<div class="podium-medal reveal" style="--d:' + (0.10 + vi * 0.12) + 's">' + emoji[pos] + '</div>'
                + '<div class="podium-name reveal" style="--d:' + (0.18 + vi * 0.12) + 's">' + esc(r.jogador) + '</div>'
                + '<div class="podium-pts reveal" style="--d:' + (0.26 + vi * 0.12) + 's">' + r.pontos + '</div>'
                + '<div class="podium-bar reveal" style="--d:' + (0.34 + vi * 0.12) + 's"></div>'
                + '</div>';
        }).join('');
        var rest = rk.slice(3).map(function (r) {
            return '<span class="mini-pill">' + r.pos + 'º ' + esc(r.jogador) + ' · ' + r.pontos + '</span>';
        }).join('');
        return shell('gold', ''
            + '<p class="eyebrow reveal" style="--d:.05s">a classificação final</p>'
            + '<h2 class="mega reveal" style="--d:.14s">o <span class="accent-italic">pódio</span></h2>'
            + '<div class="podium">' + steps + '</div>'
            + '<div class="mini-list reveal" style="--d:.62s">' + rest + '</div>'
        );
    }

    function rEvolucao() {
        return shell('lime', ''
            + '<p class="eyebrow reveal" style="--d:.05s">a corrida · rodada a rodada</p>'
            + '<h2 class="mega reveal" style="--d:.14s">a <span class="accent-italic">evolução</span></h2>'
            + buildChart(null)
            + '<p class="lead reveal" style="--d:.5s">Pontos acumulados a cada dia de jogos.</p>'
        );
    }

    function rProfeta() {
        var f = profeta();
        var winners = f.tied.map(function (j) { return '<span style="color:' + colorOf(j) + '">' + esc(j) + '</span>'; }).join(' &amp; ');
        var sub = f.exatos === 0
            ? 'Ainda ninguém cravou um placar exato — a Copa tá imprevisível!'
            : 'Com ' + f.exatos + ' placar' + (f.exatos > 1 ? 'es' : '') + ' cravado' + (f.exatos > 1 ? 's' : '') + ' no detalhe.';
        return shell('violet', ''
            + '<p class="eyebrow reveal" style="--d:.05s">curiosidade</p>'
            + '<div class="fact-emoji reveal" style="--d:.1s">🔮</div>'
            + '<h2 class="fact-headline reveal" style="--d:.2s">o profeta<br>do placar</h2>'
            + (f.exatos > 0 ? '<div class="fact-winner reveal" style="--d:.34s">' + winners + '</div>' : '')
            + '<p class="fact-sub reveal" style="--d:.46s">' + sub + '</p>'
        );
    }

    function rZebra() {
        var z = zebra();
        var sub = z.pct >= 100
            ? 'Ninguém esperava esse vencedor — ' + z.pct + '% do bolão foi pego de surpresa.'
            : z.pct + '% do bolão foi pego de surpresa com esse resultado.';
        var pills = z.acertantes.length
            ? '<div class="mini-list reveal" style="--d:.52s"><span class="mini-pill" style="opacity:.8">previu: </span>' + z.acertantes.map(function (j) { return '<span class="mini-pill" style="color:' + colorOf(j) + '">' + esc(j) + '</span>'; }).join('') + '</div>'
            : '<div class="mini-list reveal" style="--d:.52s"><span class="mini-pill" style="opacity:.8">ninguém previu 🫠</span></div>';
        return shell('crimson', ''
            + '<p class="eyebrow reveal" style="--d:.05s">curiosidade</p>'
            + '<div class="fact-emoji reveal" style="--d:.1s">🤯</div>'
            + '<h2 class="fact-headline reveal" style="--d:.2s">a zebra<br>do ano</h2>'
            + '<p class="fact-sub reveal" style="--d:.3s">' + sub + '</p>'
            + matchChip(z.jogo, .38)
            + pills
        );
    }

    function rOuro() {
        var o = rodadaOuro();
        return shell('ember', ''
            + '<p class="eyebrow reveal" style="--d:.05s">curiosidade</p>'
            + '<div class="fact-emoji reveal" style="--d:.1s">🌟</div>'
            + '<h2 class="fact-headline reveal" style="--d:.2s">rodada<br>de ouro</h2>'
            + '<p class="fact-sub reveal" style="--d:.3s">No dia ' + fmtData(o.dia) + ', o bolão inteiro somou <strong>' + o.soma + ' pontos</strong> em ' + o.jogos + ' jogo' + (o.jogos > 1 ? 's' : '') + '.</p>'
            + '<div class="fact-winner reveal" style="--d:.44s;--pc:' + colorOf(o.topJogador) + '">' + esc(o.topJogador) + ' +' + o.topPts + '</div>'
        );
    }

    function rImpossivel() {
        var im = jogoImpossivel();
        var sub = im.scored === 0
            ? 'Ninguém conseguiu pontuar nesse jogo — o mais difícil do bolão.'
            : 'Só ' + im.scored + (im.scored === 1 ? ' pessoa pontuou' : ' pessoas pontuaram') + ' nesse jogo.';
        return shell('cyan', ''
            + '<p class="eyebrow reveal" style="--d:.05s">curiosidade</p>'
            + '<div class="fact-emoji reveal" style="--d:.1s">🧩</div>'
            + '<h2 class="fact-headline reveal" style="--d:.2s">o jogo<br>impossível</h2>'
            + '<p class="fact-sub reveal" style="--d:.3s">' + sub + '</p>'
            + matchChip(im.jogo, .38)
        );
    }

    function rGemeos() {
        var gm = gemeos();
        var pct = Math.round(gm.frac * 100);
        return shell('rose', ''
            + '<p class="eyebrow reveal" style="--d:.05s">curiosidade</p>'
            + '<div class="fact-emoji reveal" style="--d:.1s">👯</div>'
            + '<h2 class="fact-headline reveal" style="--d:.2s">gêmeos<br>do palpite</h2>'
            + '<div class="fact-winner reveal" style="--d:.34s">'
            + '<span style="color:' + colorOf(gm.a) + '">' + esc(gm.a) + '</span>'
            + '<span style="font-size:.55em;color:var(--paper);margin:0 .25em">&amp;</span>'
            + '<span style="color:' + colorOf(gm.b) + '">' + esc(gm.b) + '</span>'
            + '</div>'
            + '<p class="fact-sub reveal" style="--d:.46s">Cravaram o mesmo palpite em ' + pct + '% dos ' + gm.ambos + ' jogos.</p>'
        );
    }

    function rCTA() {
        var picks = JOGADORES.map(function (j, i) {
            return '<button class="pick-btn reveal" type="button" style="--d:' + (0.12 + i * 0.07) + 's;--pc:' + colorOf(j) + '" data-jogador="' + esc(j) + '"><span class="pick-emoji">' + (EMOJIS[j] || '⚽') + '</span>' + esc(j) + '</button>';
        }).join('');
        return shell('night', ''
            + '<p class="eyebrow reveal" style="--d:.05s">agora é com você</p>'
            + '<h2 class="mega reveal" style="--d:.14s">veja o seu<br><span class="accent-italic">wrapped</span></h2>'
            + '<p class="lead reveal" style="--d:.26s">Escolha um jogador e veja a retrospectiva pessoal.</p>'
            + '<div class="cta-stack"><div class="player-pick">' + picks + '</div></div>'
        );
    }

    // ---- Por jogador ----
    function rJHero(s) {
        var medal = s.pos === 1 ? '🥇' : s.pos === 2 ? '🥈' : s.pos === 3 ? '🥉' : (s.pos === s.totalJogadores ? '😅' : '⚽');
        return shell('sunset', ''
            + '<div class="hero-avatar reveal" style="--d:.05s">' + medal + '</div>'
            + '<h2 class="hero-name reveal" style="--d:.14s">' + esc(s.jogador) + '</h2>'
            + '<p class="hero-rank reveal" style="--d:.24s">' + ordinal(s.pos) + ' de ' + s.totalJogadores + ' jogadores</p>'
            + '<div class="hero-pts num reveal" style="--d:.34s">' + s.total + '<small>pontos no total</small></div>'
        , '--pc:' + colorOf(s.jogador));
    }

    function ordinal(n) {
        return n + 'º';
    }

    function rJPontos(s) {
        var maxC = Math.max(s.ex, s.vencedor, s.erros, 1);
        function row(n, label, d) {
            return '<div class="bk-item">'
                + '<div class="bk-row"><span class="bk-label">' + label + '</span><span class="bk-pts">' + n + '</span></div>'
                + '<div class="bk-bar"><div class="bk-fill" style="--w:' + (n / maxC * 100).toFixed(0) + '%;--bd:' + d + 's"></div></div>'
                + '</div>';
        }
        return shell('violet', ''
            + '<p class="eyebrow reveal" style="--d:.05s">sua pontuação</p>'
            + '<h2 class="mega reveal" style="--d:.14s">' + s.total + ' <span class="accent-italic">pts</span></h2>'
            + '<div class="breakdown">'
            + row(s.ex, 'placares exatos  +3', .3)
            + row(s.vencedor, 'vencedor / empate  +1', .42)
            + row(s.erros, 'errou tudo  0', .54)
            + '</div>'
        , '--pc:' + colorOf(s.jogador));
    }

    function rJEvolucao(s) {
        return shell('lime', ''
            + '<p class="eyebrow reveal" style="--d:.05s">sua corrida</p>'
            + '<h2 class="mega reveal" style="--d:.14s"><span class="accent-italic">' + esc(s.jogador) + '</span><br>rodada a rodada</h2>'
            + buildChart(s.jogador)
            + '<p class="lead reveal" style="--d:.5s">Sua linha é o destaque.</p>'
        , '--pc:' + colorOf(s.jogador));
    }

    function rJTaxa(s) {
        var r = 52, circ = 2 * Math.PI * r;
        var off = circ - (s.taxa / 100) * circ;
        return shell('cyan', ''
            + '<p class="eyebrow reveal" style="--d:.05s">precisão</p>'
            + '<h2 class="mega reveal" style="--d:.14s">taxa de <span class="accent-italic">acerto</span></h2>'
            + '<div class="ring-wrap reveal" style="--d:.2s">'
            + '<svg class="ring" width="160" height="160" viewBox="0 0 120 120">'
            + '<circle class="ring-bg" cx="60" cy="60" r="' + r + '"></circle>'
            + '<circle class="ring-fg" cx="60" cy="60" r="' + r + '" style="--circ:' + circ.toFixed(1) + ';--off:' + off.toFixed(1) + '"></circle>'
            + '</svg>'
            + '<div class="ring-center"><div class="ring-pct">' + s.taxa + '%</div><div class="ring-cap">' + s.total + ' pts / ' + (s.jogadosCount * 3) + ' possíveis</div></div>'
            + '</div>'
        , '--pc:' + colorOf(s.jogador));
    }

    function rJStreak(s) {
        if (s.melhorSeq === 0) {
            return shell('ember', ''
                + '<p class="eyebrow reveal" style="--d:.05s">no fogo</p>'
                + '<div class="fact-emoji reveal" style="--d:.1s">🔥</div>'
                + '<h2 class="fact-headline reveal" style="--d:.2s">a sequência<br>vai começar</h2>'
                + '<p class="fact-sub reveal" style="--d:.34s">Ainda veio nenhum placar exato seguido — o próximo pode iniciar a saga!</p>'
            , '--pc:' + colorOf(s.jogador));
        }
        return shell('ember', ''
            + '<p class="eyebrow reveal" style="--d:.05s">no fogo</p>'
            + '<div class="big-num num reveal" style="--d:.12s">' + s.melhorSeq + '</div>'
            + '<span class="big-num-unit reveal" style="--d:.3s">jogos seguidos cravando placar exato 🔥</span>'
        , '--pc:' + colorOf(s.jogador));
    }

    function rJMelhor(s) {
        if (!s.melhorPalpite) {
            return shell('rose', ''
                + '<p class="eyebrow reveal" style="--d:.05s">o grande momento</p>'
                + '<div class="fact-emoji reveal" style="--d:.1s">🎯</div>'
                + '<h2 class="fact-headline reveal" style="--d:.2s">o placar exato<br>vai chegar</h2>'
                + '<p class="fact-sub reveal" style="--d:.34s">Ainda não veio o primeiro placar cravado. Fica de olho nas próximas rodadas!</p>'
            , '--pc:' + colorOf(s.jogador));
        }
        var g = s.melhorPalpite.jogo, p = s.melhorPalpite.palpite;
        return shell('rose', ''
            + '<p class="eyebrow reveal" style="--d:.05s">o grande momento</p>'
            + '<div class="fact-emoji reveal" style="--d:.1s">⭐</div>'
            + '<h2 class="fact-headline reveal" style="--d:.2s">melhor<br>palpite</h2>'
            + matchChip(g, .34)
            + '<p class="fact-sub reveal" style="--d:.46s">Cravou ' + p.timeA + '×' + p.timeB + ' em cheio. +3 pontos!</p>'
        , '--pc:' + colorOf(s.jogador));
    }

    function rJSorte(s) {
        if (!s.sorte) {
            return shell('magenta', ''
                + '<p class="eyebrow reveal" style="--d:.05s">sorte ou faro?</p>'
                + '<div class="fact-emoji reveal" style="--d:.1s">🍀</div>'
                + '<h2 class="fact-headline reveal" style="--d:.2s">ainda sem<br>jogo da sorte</h2>'
                + '<p class="fact-sub reveal" style="--d:.34s">Nenhum palpite solitário por enquanto. Ainda há rodadas por vir!</p>'
            , '--pc:' + colorOf(s.jogador));
        }
        var g = s.sorte.jogo;
        var sub = s.sorte.outros === 0
            ? 'Pontuou e ninguém mais conseguiu! +' + s.sorte.pontos + ' só pra você.'
            : 'Pontuou quando só mais ' + s.sorte.outros + (s.sorte.outros === 1 ? ' conseguiu' : ' conseguiram') + '. +' + s.sorte.pontos + ' pra você.';
        return shell('magenta', ''
            + '<p class="eyebrow reveal" style="--d:.05s">sorte ou faro?</p>'
            + '<div class="fact-emoji reveal" style="--d:.1s">🍀</div>'
            + '<h2 class="fact-headline reveal" style="--d:.2s">jogo<br>da sorte</h2>'
            + '<p class="fact-sub reveal" style="--d:.3s">' + sub + '</p>'
            + matchChip(g, .4)
        , '--pc:' + colorOf(s.jogador));
    }

    function rJRodadas(s) {
        if (!s.melhorDia) {
            return shell('sunset', ''
                + '<p class="eyebrow reveal" style="--d:.05s">altos e baixos</p>'
                + '<h2 class="mega reveal" style="--d:.14s">os altos e baixos<br><span class="accent-italic">vêm aí</span></h2>'
                + '<p class="lead reveal" style="--d:.3s">Assim que os jogos rolarem, aparece aqui o seu dia de ouro vs o dia pra esquecer.</p>'
            , '--pc:' + colorOf(s.jogador));
        }
        return shell('sunset', ''
            + '<p class="eyebrow reveal" style="--d:.05s">altos e baixos</p>'
            + '<h2 class="mega reveal" style="--d:.14s">dia de <span class="accent-italic">ouro</span><br>vs dia pra esquecer</h2>'
            + '<div class="scene-grid">'
            + '<div class="scene-stat reveal" style="--d:.28s"><div class="scene-num num">+' + s.melhorDia[1] + '</div><div class="scene-label">' + fmtData(s.melhorDia[0]) + '</div></div>'
            + '<div class="scene-stat reveal" style="--d:.38s"><div class="scene-num num" style="opacity:.8">' + s.piorDia[1] + '</div><div class="scene-label">' + fmtData(s.piorDia[0]) + '</div></div>'
            + '</div>'
        , '--pc:' + colorOf(s.jogador));
    }

    function rJOutro(s) {
        return shell('night', ''
            + '<p class="eyebrow reveal" style="--d:.05s">fim</p>'
            + '<h2 class="mega reveal" style="--d:.14s">esse foi o<br><span class="accent-italic">wrapped</span><br>da ' + esc(s.jogador) + '</h2>'
            + '<div class="outro-actions">'
            + '<button class="share-btn reveal" style="--d:.3s" type="button" id="outro-outro">🔁 ver outro jogador</button>'
            + '<button class="text-btn reveal" style="--d:.4s" type="button" id="outro-geral">voltar ao wrapped geral</button>'
            + '</div>'
        , '--pc:' + colorOf(s.jogador));
    }

    // ------------------------------ Deck ---------------------------------
    function buildDeckGeral() {
        return [rIntro(), rCenario(), rPodio(), rEvolucao(), rProfeta(), rZebra(), rOuro(), rImpossivel(), rGemeos(), rCTA()];
    }

    function buildDeckJogador(jogador) {
        var s = statsJogador(jogador);
        return [rJHero(s), rJPontos(s), rJEvolucao(s), rJTaxa(s), rJStreak(s), rJMelhor(s), rJSorte(s), rJRodadas(s), rJOutro(s)];
    }

    function render() {
        state.slides = state.mode === 'geral' ? buildDeckGeral() : buildDeckJogador(state.jogador);
        var deck = $('#deck');
        deck.innerHTML = state.slides.join('');

        // Botões do CTA (escolha de jogador)
        deck.querySelectorAll('[data-jogador]').forEach(function (btn) {
            btn.addEventListener('click', function () { switchToJogador(btn.getAttribute('data-jogador')); });
        });
        var outroOutro = deck.querySelector('#outro-outro');
        if (outroOutro) outroOutro.addEventListener('click', switchToGeral);
        var outroGeral = deck.querySelector('#outro-geral');
        if (outroGeral) outroGeral.addEventListener('click', switchToGeral);

        buildProgress();
        goTo(0);
    }

    function buildProgress() {
        var p = $('#progress');
        p.innerHTML = state.slides.map(function (_, i) { return '<span class="progress-dot" data-i="' + i + '"></span>'; }).join('');
        p.querySelectorAll('.progress-dot').forEach(function (d) {
            d.addEventListener('click', function () { goTo(Number(d.getAttribute('data-i'))); });
        });
    }

    function updateProgress() {
        var dots = $('#progress').querySelectorAll('.progress-dot');
        dots.forEach(function (d, i) {
            d.classList.toggle('active', i === state.index);
            d.classList.toggle('done', i < state.index);
        });
        $('#nav-prev').classList.toggle('is-hidden', state.index === 0);
        $('#nav-next').classList.toggle('is-hidden', state.index === state.slides.length - 1);
    }

    function goTo(i) {
        var slides = $('#deck').querySelectorAll('.slide');
        if (i < 0 || i >= slides.length) return;
        var cur = slides[state.index];
        if (cur) cur.classList.remove('active');
        state.index = i;
        var nxt = slides[i];
        nxt.classList.add('active');
        slides.forEach(function (s, idx) { s.setAttribute('aria-hidden', idx === i ? 'false' : 'true'); });
        updateProgress();
        hideHint();
    }

    function next() { goTo(state.index + 1); }
    function prev() { goTo(state.index - 1); }

    function switchToJogador(jogador) {
        state.mode = 'jogador';
        state.jogador = jogador;
        render();
    }

    function switchToGeral() {
        state.mode = 'geral';
        state.jogador = null;
        render();
    }

    function hideHint() {
        if (hintHidden) return;
        hintHidden = true;
        var h = $('#hint');
        if (h) h.classList.add('is-hidden');
    }

    // ------------------------------ Wiring -------------------------------
    function wire() {
        $('#nav-next').addEventListener('click', next);
        $('#nav-prev').addEventListener('click', prev);
        var tapNext = $('#tap-next'), tapPrev = $('#tap-prev');
        if (tapNext) tapNext.addEventListener('click', next);
        if (tapPrev) tapPrev.addEventListener('click', prev);

        document.addEventListener('keydown', function (e) {
            if (['ArrowRight', 'ArrowDown', ' ', 'PageDown'].indexOf(e.key) >= 0) { e.preventDefault(); next(); }
            else if (['ArrowLeft', 'ArrowUp', 'PageUp'].indexOf(e.key) >= 0) { e.preventDefault(); prev(); }
            else if (e.key === 'Home') { goTo(0); }
            else if (e.key === 'End') { goTo(state.slides.length - 1); }
            else if (e.key === 'Escape') { if (state.mode === 'jogador') switchToGeral(); }
        });

        // Swipe (mobile)
        var sx = 0, sy = 0, tracking = false;
        document.addEventListener('touchstart', function (e) {
            if (!e.touches[0]) return;
            sx = e.touches[0].clientX; sy = e.touches[0].clientY; tracking = true;
        }, { passive: true });
        document.addEventListener('touchend', function (e) {
            if (!tracking) return;
            tracking = false;
            var t = e.changedTouches[0]; if (!t) return;
            var dx = t.clientX - sx, dy = t.clientY - sy;
            if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? next() : prev(); }
        }, { passive: true });
    }

    // ------------------------------- Init --------------------------------
    function init() {
        var overlay = document.createElement('div');
        overlay.className = 'loader';
        overlay.innerHTML = '<div><div class="spinner"></div>'
            + '<p style="font-family:var(--font-mono);letter-spacing:.22em;text-transform:uppercase;font-size:.78rem;opacity:.8">montando o wrapped…</p>'
            + '</div>';
        document.body.appendChild(overlay);

        CORE.loadDados().then(function (dados) {
            state.dados = dados;
            wire();
            render();
        }).catch(function () {
            overlay.innerHTML = '<div><h2 class="mega" style="font-size:2rem">Não foi possível carregar os dados.</h2>'
                + '<p class="lead" style="margin-top:1rem">Abra a página por um servidor local (ex.: python3 -m http.server).</p></div>';
        }).then(function () {
            if (state.dados) overlay.remove();
        });
    }

    init();
}());
