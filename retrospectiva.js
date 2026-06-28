/* =====================================================================
   BOLÃO COPA 2026 — RETROSPECTIVA FASE DE GRUPOS
   Deck animado estilo wrapped, mas com conteúdo 100% fixo (até 27/06,
   fim da fase de grupos — 72 jogos). Nada é calculado: tudo vem dos
   arrays DATA abaixo. Reusa a estética de wrapped.css + retrospectiva.css.
   ===================================================================== */
(function () {
    'use strict';

    var CORE = window.BolaoCore;
    var getBandeira = CORE.getBandeira;
    var JOGADORES = CORE.JOGADORES;
    var calcularPontos = CORE.calcularPontos;
    var GRUPO_LIMITE = 72; // fase de grupos: jogos 1 a 72

    // Cores / emojis por jogador (alinhadas às vars em wrapped.css)
    var PCOLOR = {
        Alan: '#ff2e6c', Fernanda: '#ffd23f', Jorge: '#2ce5a0',
        Lia: '#9b6cff', Raquel: '#38b6ff', Sueli: '#ff7a1a'
    };
    var PEMOJI = {
        Alan: '🧠', Fernanda: '🌸', Jorge: '⚽', Lia: '🦄', Raquel: '🐬', Sueli: '🔥'
    };
    function colorOf(j) { return PCOLOR[j] || '#ffffff'; }

    // Rotação de gradientes para os momentos por jogo
    var GAME_GRADS = ['magenta', 'cyan', 'gold', 'lime', 'violet', 'crimson', 'ember', 'rose', 'sunset', 'night'];

    // ------------------------------ Helpers ------------------------------
    function $(sel) { return document.querySelector(sel); }

    function esc(s) {
        return String(s).replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    }

    function fmtData(iso) {
        try {
            return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        } catch (e) { return ''; }
    }

    function shell(grad, inner, styleAttr) {
        return '<section class="slide" data-grad="' + grad + '"' + (styleAttr ? ' style="' + styleAttr + '"' : '') + ' aria-hidden="true">'
            + '<div class="slide-inner">' + inner + '</div>'
            + '</section>';
    }

    function matchChip(a, sa, sb, b, extraDelay) {
        return '<span class="match-chip reveal" style="--d:' + (extraDelay || 0) + 's">'
            + '<span class="teams">' + getBandeira(a) + ' ' + esc(a) + '</span>'
            + '<span class="score">' + sa + '×' + sb + '</span>'
            + '<span class="teams">' + esc(b) + ' ' + getBandeira(b) + '</span>'
            + '</span>';
    }

    function chips(games, baseDelay) {
        return games.map(function (g, i) {
            return matchChip(g.a, g.sa, g.sb, g.b, baseDelay + i * 0.08);
        }).join('');
    }

    function table(head, rows, opts) {
        opts = opts || {};
        var ths = head.map(function (h, i) {
            return '<th' + (i === head.length - 1 ? ' class="num"' : '') + '>' + h + '</th>';
        }).join('');
        var body = rows.map(function (r) {
            var cls = r.hl ? ' class="hl"' : (r.real ? ' class="real"' : '');
            var tds = r.cells.map(function (c, i) {
                var cell = c;
                if (i === 0 && r.name) cell = '<span class="swatch" style="color:' + colorOf(r.name) + '"></span>' + c;
                return '<td' + (i === r.cells.length - 1 ? ' class="num"' : '') + '>' + cell + '</td>';
            }).join('');
            return '<tr' + cls + '>' + tds + '</tr>';
        }).join('');
        var cap = opts.caption ? '<caption>' + opts.caption + '</caption>' : '';
        return '<table class="fact-table reveal" style="--d:' + (opts.delay || .34) + 's">'
            + '<thead><tr>' + ths + '</tr></thead><tbody>' + body + '</tbody>' + cap + '</table>';
    }

    function bigNum(n, unit) {
        return '<div class="big-num num reveal" style="--d:.14s">' + n + '</div>'
            + '<span class="big-num-unit reveal" style="--d:.32s">' + unit + '</span>';
    }

    function vsRow(now, real, cap) {
        return '<div class="vs-row reveal" style="--d:.2s">'
            + '<span>' + now + '</span>'
            + '<span class="vs-sep">vs real</span>'
            + '<span class="vs-real">' + real + '</span>'
            + '</div><span class="vs-cap reveal" style="--d:.34s">' + cap + '</span>';
    }

    // ------------------------------ Conteúdo -----------------------------

    // 16 curiosidades gerais. headline em HTML (pode ter <br> + accent).
    var CURIOSIDADES = [
        {
            grad: 'magenta', style: '--pc:' + colorOf('Alan'),
            emoji: '🧙',
            head: 'alan, o<br><span class="accent-italic">oráculo</span> oficial',
            body: '<p class="fact-sub reveal" style="--d:.34s">75 pontos · 13 placares exatos · pontuou em 49 dos 72 jogos · 68,1% de acerto.</p>',
            phrase: 'Alan não está participando do bolão. Está vazando informação do futuro.'
        },
        {
            grad: 'ember', style: '--pc:' + colorOf('Sueli'),
            emoji: '🥈',
            head: 'sueli, a<br><span class="accent-italic">vice</span> silenciosa',
            body: '<p class="fact-sub reveal" style="--d:.34s">2ª em pontos (59), em placares exatos (8) e em jogos pontuados (43).</p>',
            phrase: 'Sueli não faz muito barulho, mas está sempre ali, incomodando a liderança.'
        },
        {
            grad: 'cyan', style: '--pc:' + colorOf('Jorge'),
            emoji: '⚖️',
            head: 'o engarrafamento<br>dos <span class="accent-italic">49</span>',
            body: '<p class="fact-sub reveal" style="--d:.32s">Jorge, Lia e Raquel empatados em 49 — cada um chegou lá do seu jeito:</p>'
                + table(['', 'exatos', 'simples'], [
                    { name: 'Jorge', cells: ['Jorge', '5', '34'] },
                    { name: 'Lia', cells: ['Lia', '6', '31'] },
                    { name: 'Raquel', cells: ['Raquel', '6', '31'], hl: true }
                ], { delay: .42 }),
            phrase: 'Três pessoas, 49 pontos, e nenhuma paz na tabela.'
        },
        {
            grad: 'ember', style: '--pc:' + colorOf('Jorge'),
            emoji: '🧊',
            head: 'jorge zerou<br>quase <span class="accent-italic">metade</span>',
            body: bigNum(33, 'jogos sem pontuar · 45,8% do total'),
            phrase: 'Jorge vive entre o quase brilhante e o absolutamente nada.'
        },
        {
            grad: 'rose', style: '--pc:' + colorOf('Fernanda'),
            emoji: '🧊',
            head: 'fernanda também<br>zerou <span class="accent-italic">33</span>',
            body: '<p class="fact-sub reveal" style="--d:.34s">Os mesmos 33 jogos zerados de Jorge — mas 2 pontos à frente, por ter um placar exato a mais.</p>',
            phrase: 'Fernanda e Jorge erram na mesma frequência, mas Fernanda erra com um pouco mais de classe.'
        },
        {
            grad: 'crimson', style: '--pc:' + colorOf('Lia'),
            emoji: '🧱',
            head: 'as rainhas do<br><span class="accent-italic">ou vai ou não vai</span>',
            body: bigNum(35, 'jogos zerados · o maior número do bolão')
                + '<p class="fact-sub reveal" style="--d:.4s">Lia e Raquel lideram em jogos sem pontuar — e mesmo assim seguem empatadas em 49.</p>',
            phrase: 'Lia e Raquel provaram que dá para errar muito e continuar vivas na disputa.'
        },
        {
            grad: 'lime', style: '--pc:' + colorOf('Raquel'),
            emoji: '🧮',
            head: 'raquel acertou<br>o <span class="accent-italic">tamanho</span> da festa',
            body: '<p class="fact-sub reveal" style="--d:.32s">215 gols reais — quem previu quantos:</p>'
                + table(['participante', 'gols previstos'], [
                    { name: 'Raquel', cells: ['Raquel', '220'], hl: true },
                    { name: 'Alan', cells: ['Alan', '202'] },
                    { name: 'Fernanda', cells: ['Fernanda', '202'] },
                    { name: 'Jorge', cells: ['Jorge', '187'] },
                    { name: 'Sueli', cells: ['Sueli', '184'] },
                    { name: 'Lia', cells: ['Lia', '178'] },
                    { cells: ['real', '215'], real: true }
                ], { delay: .42, caption: '215 gols marcados na fase de grupos' }),
            phrase: 'Raquel acertou o tamanho da festa, mas confundiu os endereços.'
        },
        {
            grad: 'cyan', style: '--pc:' + colorOf('Lia'),
            emoji: '🐢',
            head: 'lia, a mais<br><span class="accent-italic">conservadora</span>',
            body: vsRow('178', '215', 'gols previstos · a menor previsão do grupo'),
            phrase: 'Lia montou seus palpites com responsabilidade fiscal.'
        },
        {
            grad: 'violet', style: '--pc:' + colorOf('Alan'),
            emoji: '🎯',
            head: 'mesma compra,<br><span class="accent-italic">outro</span> resultado',
            body: '<p class="fact-sub reveal" style="--d:.34s">Alan e Fernanda previram <strong>202 gols</strong> cada. Mas Alan fez 75 pontos — Fernanda, 51.</p>',
            phrase: 'Alan e Fernanda compraram a mesma quantidade de gols. Alan só soube distribuir melhor.'
        },
        {
            grad: 'gold', style: '--pc:' + colorOf('Jorge'),
            emoji: '🤝',
            head: 'o drama<br>dos <span class="accent-italic">empates</span>',
            body: '<p class="fact-sub reveal" style="--d:.32s">20 empates reais. Quem apostou, quem acertou o resultado e quem cravou o placar:</p>'
                + table(['participante', 'apostou', 'resultado', 'exato'], [
                    { name: 'Alan', cells: ['Alan', '12', '7', '3'], hl: true },
                    { name: 'Jorge', cells: ['Jorge', '15', '4', '3'] },
                    { name: 'Raquel', cells: ['Raquel', '11', '3', '1'] },
                    { name: 'Sueli', cells: ['Sueli', '5', '2', '1'] },
                    { name: 'Fernanda', cells: ['Fernanda', '5', '1', '0'] },
                    { name: 'Lia', cells: ['Lia', '11', '0', '0'] }
                ], { delay: .42 }),
            phrase: 'Lia propôs 11 acordos de paz. O futebol rejeitou todos.'
        },
        {
            grad: 'sunset', style: '--pc:' + colorOf('Jorge'),
            emoji: '🤝',
            head: 'jorge, o especialista<br>em <span class="accent-italic">empate exato</span>',
            body: '<p class="fact-sub reveal" style="--d:.3s">3 empates cravados — empatando com Alan no topo:</p>'
                + '<div class="mini-list">' + chips([
                    { a: 'Brasil', sa: 1, sb: 1, b: 'Marrocos' },
                    { a: 'Holanda', sa: 2, sb: 2, b: 'Japão' },
                    { a: 'Japão', sa: 1, sb: 1, b: 'Suécia' }
                ], .4) + '</div>',
            phrase: 'Quando Jorge acerta exatamente, normalmente ninguém vence.'
        },
        {
            grad: 'ember', style: '--pc:' + colorOf('Alan'),
            emoji: '⚽',
            head: 'alan é fã do<br><span class="accent-italic">ambos marcam</span>',
            body: '<p class="fact-sub reveal" style="--d:.32s">Palpites em que os dois times fariam gol:</p>'
                + table(['participante', 'vezes'], [
                    { name: 'Alan', cells: ['Alan', '42'], hl: true },
                    { name: 'Fernanda', cells: ['Fernanda', '41'] },
                    { name: 'Raquel', cells: ['Raquel', '40'] },
                    { name: 'Lia', cells: ['Lia', '37'] },
                    { name: 'Jorge', cells: ['Jorge', '33'] },
                    { name: 'Sueli', cells: ['Sueli', '32'] }
                ], { delay: .42 }),
            phrase: 'Alan quer vencer o bolão, mas sem abrir mão do entretenimento.'
        },
        {
            grad: 'rose', style: '--pc:' + colorOf('Sueli'),
            emoji: '🧤',
            head: 'sueli e o placar<br>com <span class="accent-italic">alguém zerado</span>',
            body: bigNum(40, 'palpites em que pelo menos um time ficaria sem marcar · a mais adepta'),
            phrase: 'Para Sueli, futebol bom também pode ter alguém passando em branco.'
        },
        {
            grad: 'gold', style: '--pc:' + colorOf('Lia'),
            emoji: '🍚',
            head: 'o placar favorito:<br><span class="accent-italic">2×1</span>',
            body: table(['participante', 'usou o 2×1'], [
                { name: 'Lia', cells: ['Lia', '18'], hl: true },
                { name: 'Alan', cells: ['Alan', '14'] },
                { name: 'Fernanda', cells: ['Fernanda', '14'] },
                { name: 'Sueli', cells: ['Sueli', '11'] }
            ], { delay: .34, caption: 'o 2×1 é a muleta oficial do bolão' }),
            phrase: 'Quando a dúvida bate, o bolão responde: 2×1.'
        },
        {
            grad: 'magenta', style: '--pc:' + colorOf('Jorge'),
            emoji: '🧱',
            head: 'jorge acredita<br>no <span class="accent-italic">2×0</span>',
            body: bigNum(14, 'apostas de 2×0 · o placar mais usado por Jorge'),
            phrase: 'Jorge acredita em domínio, mas com moderação.'
        },
        {
            grad: 'violet', style: '--pc:' + colorOf('Sueli'),
            emoji: '🎰',
            head: 'sueli, a mais<br><span class="accent-italic">imprevisível</span>',
            body: '<p class="fact-sub reveal" style="--d:.34s">Três placares empatados como favoritos — todos com 11 aparições: <strong>1×0</strong>, <strong>2×1</strong> e <strong>1×2</strong>.</p>',
            phrase: 'Sueli tem três palpites de estimação e usa todos com convicção.'
        }
    ];

    // 6 perfis de jogador (em ordem de classificação)
    var PLAYERS = [
        {
            name: 'Alan', grad: 'magenta', medal: '🥇', pos: '1º de 6',
            stats: [['75', 'pontos'], ['13', 'exatos'], ['49', 'pontuou'], ['8', 'sequência']],
            hls: [
                'Pontuou em 49 dos 72 jogos (68,1% de acerto).',
                'Melhor sequência: 8 jogos seguidos pontuando.',
                'Acertou o resultado de 7 dos 20 empates.',
                'Cravou 27 das 34 vitórias do time A.'
            ],
            card: 'Alan é o participante que mais parece ter lido o roteiro antes do jogo começar.'
        },
        {
            name: 'Sueli', grad: 'ember', medal: '🥈', pos: '2º de 6',
            stats: [['59', 'pontos'], ['8', 'exatos'], ['43', 'pontuou'], ['17/18', 'visitante']],
            hls: [
                'Vice-líder discreta, a 16 pontos do topo.',
                'Acertou 17 das 18 vitórias do time visitante.',
                'Foi uma das únicas a cravar Argentina 3×0 Argélia.'
            ],
            card: 'Sueli é a perseguidora oficial: sempre perto, sempre somando, sempre perigosa.'
        },
        {
            name: 'Fernanda', grad: 'gold', medal: '🥉', pos: '3º de 6',
            stats: [['51', 'pontos'], ['6', 'exatos'], ['33', 'zerou'], ['16/18', 'visitante']],
            hls: [
                'Um placar exato a mais que Jorge (6 vs 5) — daí os 2 pts de frente.',
                'Acertou 16 das 18 vitórias do visitante.',
                'Teve a maior seca do bolão: 6 jogos sem pontuar.'
            ],
            card: 'Fernanda sofre com secas longas, mas quando o visitante ganha, ela costuma aparecer.'
        },
        {
            name: 'Jorge', grad: 'lime', medal: '⚽', pos: '4º de 6',
            stats: [['49', 'pontos'], ['5', 'exatos'], ['15', 'empates'], ['33', 'zerou']],
            hls: [
                'Apostou em 15 empates — mais do que todos.',
                'Cravou 3 empates exatos (Brasil 1×1 Marrocos, Holanda 2×2 Japão, Japão 1×1 Suécia).',
                'Zerou em 33 jogos (45,8%).',
                'Começou forte: 10 pontos nos primeiros 10 jogos.'
            ],
            card: 'Jorge é o poeta do empate: nem sempre acerta, mas insiste com beleza.'
        },
        {
            name: 'Lia', grad: 'violet', medal: '🦄', pos: '5º de 6',
            stats: [['49', 'pontos'], ['6', 'exatos'], ['178', 'gols'], ['18', 'uso 2×1']],
            hls: [
                'A mais conservadora: previu só 178 gols (real: 215).',
                'Apostou em 11 empates e não acertou nenhum dos 20.',
                'Usou o placar 2×1 em 18 jogos — a campeã do clichê.'
            ],
            card: 'Lia economizou gols, insistiu no 2×1 e tentou prever empates que nunca chegaram.'
        },
        {
            name: 'Raquel', grad: 'cyan', medal: '🐬', pos: '6º de 6',
            stats: [['49', 'pontos'], ['6', 'exatos'], ['220', 'gols'], ['35', 'zerou']],
            hls: [
                'Quem mais previu gols: 220 (real: 215) — errou por apenas 5.',
                'Cravou México 2×0, Brasil 3×0 Haiti, Egito 1×1 Irã e Panamá 0×2 Inglaterra.',
                'Zerou em 35 jogos — o maior número do bolão.'
            ],
            card: 'Raquel acertou quase a quantidade total de gols do campeonato. Só faltou colocar cada gol no jogo certo.'
        }
    ];

    // 40 momentos por jogo (em ordem)
    var GAMES = [
        { n: 1, a: 'México', sa: 2, sb: 0, b: 'África do Sul', ctx: 'Fernanda e Raquel começaram com placar exato.', ph: 'O bolão mal tinha começado e duas pessoas já estavam fingindo naturalidade.' },
        { n: 2, a: 'Coreia do Sul', sa: 2, sb: 1, b: 'República Tcheca', ctx: 'Alan, Fernanda e Sueli acertaram o placar exato.', ph: 'O primeiro momento "todo mundo entende de futebol" — pelo menos metade do grupo.' },
        { n: 3, a: 'Canadá', sa: 1, sb: 1, b: 'Bósnia', ctx: 'Alan e Sueli acertaram o empate exato.', ph: 'Alan e Sueli começaram cedo a carreira diplomática.' },
        { n: 5, a: 'Catar', sa: 1, sb: 1, b: 'Suíça', ctx: 'Ninguém pontuou. Todos apostaram na Suíça.', ph: 'Primeira união total do bolão: todo mundo junto, todo mundo errado.' },
        { n: 6, a: 'Brasil', sa: 1, sb: 1, b: 'Marrocos', ctx: 'Jorge foi o único a acertar o placar exato. Todos os outros apostaram em vitória do Brasil.', ph: 'Jorge olhou para o Brasil, viu empate, e foi chamado de pessimista. Saiu como profeta.' },
        { n: 8, a: 'Austrália', sa: 2, sb: 0, b: 'Turquia', ctx: 'Ninguém pontuou. Quase todos apostaram na Turquia — ninguém na vitória australiana.', ph: 'A Austrália venceu o jogo e o bolão inteiro ao mesmo tempo.' },
        { n: 9, a: 'Alemanha', sa: 7, sb: 1, b: 'Curaçao', ctx: 'Todos acertaram o vencedor, mas ninguém chegou perto do tamanho da goleada.', ph: 'Todo mundo viu a Alemanha ganhando. Ninguém viu o trauma vindo.' },
        { n: 10, a: 'Holanda', sa: 2, sb: 2, b: 'Japão', ctx: 'Alan e Jorge acertaram o 2×2 exato.', ph: 'Jorge encontrou seu habitat natural: empate com gols.' },
        { n: 13, a: 'Espanha', sa: 0, sb: 0, b: 'Cabo Verde', ctx: 'Ninguém pontuou. Todos apostaram em vitória da Espanha.', ph: 'O bolão pediu goleada. O jogo entregou reunião sem ata.' },
        { n: 14, a: 'Bélgica', sa: 1, sb: 1, b: 'Egito', ctx: 'Ninguém pontuou. Todos apostaram na Bélgica.', ph: 'Mais um empate transformando certezas em recibos de vergonha.' },
        { n: 15, a: 'Arábia Saudita', sa: 1, sb: 1, b: 'Uruguai', ctx: 'Ninguém pontuou. Todos apostaram no Uruguai.', ph: 'O Uruguai tinha seis votos. A realidade anulou a eleição.' },
        { n: 17, a: 'França', sa: 3, sb: 1, b: 'Senegal', ctx: 'Fernanda foi a única a cravar o placar.', ph: 'Fernanda abriu sua filial especializada em França.' },
        { n: 19, a: 'Argentina', sa: 3, sb: 0, b: 'Argélia', ctx: 'Sueli foi a única a acertar o placar exato.', ph: 'Enquanto todo mundo foi cauteloso, Sueli pediu Argentina sem sofrer gol.' },
        { n: 21, a: 'Portugal', sa: 1, sb: 1, b: 'Congo', ctx: 'Ninguém pontuou. Todos apostaram em Portugal.', ph: 'Portugal decepcionou o bolão inteiro em perfeita harmonia.' },
        { n: 24, a: 'Uzbequistão', sa: 1, sb: 3, b: 'Colômbia', ctx: 'Alan e Sueli acertaram o placar exato.', ph: 'Alan e Sueli viram o 3×1 fora de casa antes de todo mundo.' },
        { n: 27, a: 'Canadá', sa: 6, sb: 0, b: 'Catar', ctx: 'Ninguém acertou o placar exato. Fernanda e Raquel apostaram em empate.', ph: 'O Canadá fez seis gols e destruiu qualquer ideia de jogo equilibrado.' },
        { n: 29, a: 'Estados Unidos', sa: 2, sb: 0, b: 'Austrália', ctx: 'Jorge e Raquel acertaram o placar exato.', ph: 'Jorge apareceu de novo com um placar limpo. Raquel também leu bem o jogo.' },
        { n: 31, a: 'Brasil', sa: 3, sb: 0, b: 'Haiti', ctx: 'Lia e Raquel acertaram o placar exato.', ph: 'No jogo do Brasil, Lia e Raquel foram cirúrgicas.' },
        { n: 32, a: 'Turquia', sa: 0, sb: 1, b: 'Paraguai', ctx: 'Ninguém pontuou. Todos evitaram a vitória do Paraguai.', ph: 'O Paraguai venceu contra o adversário e contra seis planilhas.' },
        { n: 34, a: 'Alemanha', sa: 2, sb: 1, b: 'Costa do Marfim', ctx: 'Alan e Sueli acertaram o placar exato.', ph: 'Alan e Sueli formaram a dupla do 2×1 alemão.' },
        { n: 35, a: 'Equador', sa: 0, sb: 0, b: 'Curaçao', ctx: 'Ninguém pontuou. Todos apostaram em vitória do Equador.', ph: 'O 0×0 apareceu como um bug no sistema de confiança coletiva.' },
        { n: 38, a: 'Bélgica', sa: 0, sb: 0, b: 'Irã', ctx: 'Ninguém pontuou. Todos apostaram na Bélgica.', ph: 'A Bélgica virou especialista em derrubar bolões.' },
        { n: 40, a: 'Nova Zelândia', sa: 1, sb: 3, b: 'Egito', ctx: 'Raquel foi a única a cravar.', ph: 'Raquel distribuiu os gols certinhos nesse endereço.' },
        { n: 42, a: 'França', sa: 3, sb: 0, b: 'Iraque', ctx: 'Fernanda, Lia e Sueli acertaram o placar exato.', ph: 'França 3×0 Iraque foi o momento em que metade do bolão virou comentarista.' },
        { n: 43, a: 'Noruega', sa: 3, sb: 2, b: 'Senegal', ctx: 'Alan foi o único a acertar o placar exato.', ph: 'Alan acertou o 3×2, que é basicamente prever futebol no modo difícil.' },
        { n: 46, a: 'Inglaterra', sa: 0, sb: 0, b: 'Gana', ctx: 'Ninguém pontuou. Todos apostaram na Inglaterra.', ph: 'A Inglaterra tinha seis votos e zero gols.' },
        { n: 54, a: 'África do Sul', sa: 1, sb: 0, b: 'Coreia do Sul', ctx: 'Ninguém pontuou. Todos apostaram na Coreia do Sul.', ph: 'O bolão inteiro foi para um lado. A África do Sul foi para o outro.' },
        { n: 55, a: 'Equador', sa: 2, sb: 1, b: 'Alemanha', ctx: 'Ninguém pontuou. Todos apostaram na Alemanha.', ph: 'Talvez o maior tombo coletivo: seis pessoas confiaram na Alemanha, e o Equador rasgou o roteiro.' },
        { n: 56, a: 'Curaçao', sa: 0, sb: 2, b: 'Costa do Marfim', ctx: 'Alan e Lia acertaram o placar exato. Todos pontuaram.', ph: 'Depois do caos, veio um jogo em que o bolão inteiro respirou aliviado.' },
        { n: 57, a: 'Japão', sa: 1, sb: 1, b: 'Suécia', ctx: 'Jorge foi o único a pontuar — e com placar exato. Todos os outros apostaram na Suécia.', ph: 'Jorge, o profeta do empate, teve seu momento mais Jorge possível.' },
        { n: 59, a: 'Turquia', sa: 3, sb: 2, b: 'Estados Unidos', ctx: 'Só Alan pontuou. Apostou na Turquia, mas por 2×1.', ph: 'Alan não acertou o placar, mas foi o único que escolheu o lado certo da bagunça.' },
        { n: 60, a: 'Paraguai', sa: 0, sb: 0, b: 'Austrália', ctx: 'Só Jorge pontuou. Apostou em 2×2.', ph: 'Jorge viu empate. Errou os gols, mas acertou o espírito.' },
        { n: 63, a: 'Cabo Verde', sa: 0, sb: 0, b: 'Arábia Saudita', ctx: 'Só Alan pontuou. Apostou em 1×1.', ph: 'Alan também errou os gols, mas acertou a ausência de vencedor.' },
        { n: 65, a: 'Egito', sa: 1, sb: 1, b: 'Irã', ctx: 'Alan e Raquel acertaram o placar exato. Sueli também pontuou com 0×0.', ph: 'Alan e Raquel cravaram o empate; Sueli acertou a diplomacia, mas não os gols.' },
        { n: 67, a: 'Panamá', sa: 0, sb: 2, b: 'Inglaterra', ctx: 'Raquel e Sueli acertaram o placar exato. Todos pontuaram.', ph: 'O bolão inteiro acreditou na Inglaterra, mas Raquel e Sueli acertaram até a régua.' },
        { n: 68, a: 'Croácia', sa: 2, sb: 1, b: 'Gana', ctx: 'Fernanda e Jorge acertaram o placar exato. Sueli também pontuou.', ph: 'Fernanda e Jorge encontraram o 2×1 que muita gente procurou em outros jogos.' },
        { n: 69, a: 'Colômbia', sa: 0, sb: 0, b: 'Portugal', ctx: 'Só Alan pontuou. Apostou em 1×1.', ph: 'Alan viu empate onde quase todo mundo viu Portugal. Não acertou os gols, mas ganhou sozinho.' },
        { n: 70, a: 'Congo', sa: 3, sb: 1, b: 'Uzbequistão', ctx: 'Todo mundo pontuou, menos Alan.', ph: 'Um raro momento em que o líder ficou olhando o resto da turma comemorar.' },
        { n: 71, a: 'Argélia', sa: 3, sb: 3, b: 'Áustria', ctx: 'Ninguém pontuou. Foi o 13º jogo em que todos zeraram.', ph: 'Se alguém apostasse em 3×3 aqui, deveria ganhar o bolão inteiro por ousadia.' },
        { n: 72, a: 'Jordânia', sa: 1, sb: 3, b: 'Argentina', ctx: 'Todos pontuaram, mas ninguém cravou.', ph: 'Final de rodada democrático: todo mundo levou um pontinho, ninguém levou a glória.' }
    ];

    // Frases curtas (mural final)
    var FRASES = [
        { who: 'Alan', what: 'O líder não está acertando palpites. Está corrigindo o gabarito.' },
        { who: 'Sueli', what: 'Vice-líder, discreta e perigosa.' },
        { who: 'Fernanda', what: 'Quando acerta, acerta bonito. Quando seca, seca com força.' },
        { who: 'Jorge', what: 'O empate é uma filosofia de vida.' },
        { who: 'Lia', what: 'Conservadora nos gols, insistente no 2×1 e perseguida pelos empates.' },
        { who: 'Raquel', what: 'Acertou o total de gols quase na mosca. Só errou o CEP de alguns.' },
        { who: 'o grupo', what: 'Quando todo mundo concorda, desconfie.', color: '#fff' },
        { who: 'o bolão', what: 'O maior adversário do grupo não é outro participante. É o 0×0 inesperado.', color: '#fff' }
    ];

    // --------------------- Dados (gráfico de evolução) ------------------
    // Gráfico ao vivo (como no wrapped), porém restrito à fase de grupos
    // (jogos 1 a 72). O restante do deck é conteúdo fixo.
    function jogadosGrupo() {
        return ((state.dados && state.dados.jogos) || []).filter(function (j) {
            return j.jogado && j.placar && j.id <= GRUPO_LIMITE;
        });
    }
    function palpitesDe(j) { return (state.dados && state.dados.palpites && state.dados.palpites[j]) || {}; }
    function ptsJogo(jogador, jogo) { return calcularPontos(palpitesDe(jogador)[String(jogo.id)], jogo); }
    function temDados() { return jogadosGrupo().length > 0; }

    function rodadas() {
        var map = {};
        jogadosGrupo().forEach(function (g) {
            var dia = String(g.dataHora).slice(0, 10);
            (map[dia] = map[dia] || []).push(g);
        });
        return Object.keys(map).sort().map(function (dia) { return { dia: dia, jogos: map[dia] }; });
    }

    function seriesPorRodada() {
        var rds = rodadas();
        var series = {};
        JOGADORES.forEach(function (j) { series[j] = []; });
        rds.forEach(function (rd, ri) {
            JOGADORES.forEach(function (j) {
                var prev = ri === 0 ? 0 : series[j][ri - 1];
                var add = 0;
                rd.jogos.forEach(function (g) { var p = ptsJogo(j, g); if (p != null) add += p; });
                series[j].push(prev + add);
            });
        });
        return { rds: rds, series: series };
    }

    function buildChart() {
        var data = seriesPorRodada();
        var rds = data.rds, series = data.series;
        var W = 320, H = 168, padL = 10, padR = 12, padT = 12, padB = 20;
        var n = rds.length;
        var xStep = (W - padL - padR) / Math.max(1, n - 1);
        var allMax = 1;
        JOGADORES.forEach(function (j) { series[j].forEach(function (v) { if (v > allMax) allMax = v; }); });
        var yOf = function (v) { return H - padB - (v / allMax) * (H - padT - padB); };
        var xOf = function (i) { return padL + i * xStep; };

        // Linhas em ordem crescente de pontuação final → líder por último (no topo)
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
            var lastX = xOf(arr.length - 1), lastY = yOf(arr[arr.length - 1]);
            lines += '<path class="chart-line" style="--i:' + idx + ';stroke:' + colorOf(j) + '" pathLength="1" d="' + d + '"></path>';
            lines += '<circle class="chart-dot" style="--i:' + idx + '" cx="' + lastX.toFixed(1) + '" cy="' + lastY.toFixed(1) + '" r="3.4" fill="' + colorOf(j) + '"></circle>';
        });

        var legend = JOGADORES.map(function (j) {
            var v = series[j][series[j].length - 1] || 0;
            return '<span class="legend-item"><span class="legend-dot" style="background:' + colorOf(j) + '"></span>' + esc(j) + ' <span class="legend-pts">' + v + '</span></span>';
        }).join('');

        return '<div class="chart-wrap reveal" style="--d:.2s">'
            + '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Evolução da pontuação por rodada">'
            + '<g>' + grid + rlabels + '</g>'
            + lines
            + '</svg>'
            + '<div class="chart-legend">' + legend + '</div>'
            + '</div>';
    }

    // ------------------------------ Builders -----------------------------
    function rIntro() {
        return shell('magenta', ''
            + '<div class="intro-badge reveal" style="--d:.05s">🏆 fase de grupos · em retrospectiva</div>'
            + '<h1 class="mega reveal" style="--d:.18s">RETROSPECTIVA<br><span class="accent-italic">fase de grupos</span></h1>'
            + '<div class="intro-year reveal" style="--d:.34s">2026</div>'
            + '<p class="lead reveal" style="--d:.6s">Tudo que rolou nos 72 jogos da primeira fase — pontos, zebras e frases pra guardar.</p>'
            + '<p class="intro-kick reveal" style="--d:.78s">🍿 senta, relaxa e pega uma pipoca — essa retrospectiva é longa.</p>'
        );
    }

    function rCenario() {
        function stat(n, l, d) {
            return '<div class="scene-stat reveal" style="--d:' + d + 's"><div class="scene-num num">' + n + '</div><div class="scene-label">' + l + '</div></div>';
        }
        return shell('cyan', ''
            + '<p class="eyebrow reveal" style="--d:.05s">fase de grupos · o cenário</p>'
            + '<h2 class="mega reveal" style="--d:.14s">depois de<br><span class="accent-italic">72 jogos</span></h2>'
            + '<div class="scene-grid">'
            + stat('72', 'jogos disputados', .28)
            + stat('6', 'jogadores na disputa', .36)
            + stat('215', 'gols marcados', .44)
            + stat('20', 'empates reais', .52)
            + '</div>'
        );
    }

    function rPodio() {
        var top = [
            { j: 'Alan', pts: 75, pos: 1 },
            { j: 'Sueli', pts: 59, pos: 2 },
            { j: 'Fernanda', pts: 51, pos: 3 }
        ];
        var medals = { 1: 'gold', 2: 'silver', 3: 'bronze' };
        var emoji = { 1: '🥇', 2: '🥈', 3: '🥉' };
        var visual = [top[1], top[0], top[2]];
        var steps = visual.map(function (r, vi) {
            return '<div class="podium-step ' + medals[r.pos] + '" style="--pc:' + colorOf(r.j) + '">'
                + '<div class="podium-medal reveal" style="--d:' + (0.10 + vi * 0.12) + 's">' + emoji[r.pos] + '</div>'
                + '<div class="podium-name reveal" style="--d:' + (0.18 + vi * 0.12) + 's">' + esc(r.j) + '</div>'
                + '<div class="podium-pts reveal" style="--d:' + (0.26 + vi * 0.12) + 's">' + r.pts + '</div>'
                + '<div class="podium-bar reveal" style="--d:' + (0.34 + vi * 0.12) + 's"></div>'
                + '</div>';
        }).join('');
        var rest = ['Jorge', 'Lia', 'Raquel'].map(function (j) {
            return '<span class="mini-pill" style="color:' + colorOf(j) + '">' + j + ' · 49</span>';
        }).join('');
        return shell('gold', ''
            + '<p class="eyebrow reveal" style="--d:.05s">a classificação</p>'
            + '<h2 class="mega reveal" style="--d:.14s">o <span class="accent-italic">pódio</span></h2>'
            + '<div class="podium">' + steps + '</div>'
            + '<div class="mini-list reveal" style="--d:.62s"><span class="mini-pill" style="opacity:.7">empate triplo em 49:</span>' + rest + '</div>'
        );
    }

    function rDivider(eyebrow, head, count, grad) {
        return shell(grad, ''
            + '<p class="eyebrow reveal" style="--d:.05s">' + eyebrow + '</p>'
            + '<h2 class="mega reveal" style="--d:.14s">' + head + '</h2>'
            + '<div class="divider-rule reveal" style="--d:.3s"></div>'
            + '<div class="divider-count reveal" style="--d:.42s">' + count + '</div>'
        );
    }

    function rCuriosidade(c, i) {
        return shell(c.grad, ''
            + '<p class="eyebrow reveal" style="--d:.04s">curiosidade · ' + (i + 1) + ' de ' + CURIOSIDADES.length + '</p>'
            + '<div class="fact-emoji reveal" style="--d:.1s">' + c.emoji + '</div>'
            + '<h2 class="fact-headline reveal" style="--d:.2s">' + c.head + '</h2>'
            + c.body
            + '<p class="phrase is-quote reveal" style="--d:.5s">' + esc(c.phrase) + '</p>'
        , c.style);
    }

    function rPlayer(p) {
        var isPodium = ['🥇', '🥈', '🥉'].indexOf(p.medal) >= 0;
        var rankLine = (isPodium ? p.medal + ' · ' : '') + p.pos;
        var stats = p.stats.map(function (s) {
            return '<div class="stat-chip reveal" style="--d:.3s"><span class="v">' + s[0] + '</span><span class="l">' + s[1] + '</span></div>';
        }).join('');
        var hls = p.hls.map(function (h) {
            return '<li class="reveal" style="--d:.4s">' + esc(h) + '</li>';
        }).join('');
        return shell(p.grad, ''
            + '<div class="profile-head">'
            + '<div class="profile-medal reveal" style="--d:.05s">' + PEMOJI[p.name] + '</div>'
            + '<h2 class="profile-name reveal" style="--d:.14s">' + esc(p.name) + '</h2>'
            + '<p class="profile-rank reveal" style="--d:.22s">' + rankLine + '</p>'
            + '</div>'
            + '<div class="stat-row">' + stats + '</div>'
            + '<ul class="hl-list">' + hls + '</ul>'
            + '<p class="player-quote reveal" style="--d:.5s">' + esc(p.card) + '</p>'
        , '--pc:' + colorOf(p.name));
    }

    function rGame(g, i) {
        var grad = GAME_GRADS[i % GAME_GRADS.length];
        return shell(grad, ''
            + '<p class="eyebrow reveal" style="--d:.04s">jogo ' + g.n + ' · de 72</p>'
            + matchChip(g.a, g.sa, g.sb, g.b, .12)
            + '<p class="moment-context reveal" style="--d:.26s">' + esc(g.ctx) + '</p>'
            + '<p class="phrase reveal" style="--d:.4s">' + esc(g.ph) + '</p>'
        );
    }

    function rFrases(part, total, items) {
        var cards = items.map(function (f, i) {
            var pc = f.color || colorOf(f.who);
            return '<div class="quote-card reveal" style="--d:' + (0.18 + i * 0.07) + 's;--pc:' + pc + '">'
                + '<div class="who">' + esc(f.who) + '</div>'
                + '<div class="what">' + esc(f.what) + '</div>'
                + '</div>';
        }).join('');
        return shell('night', ''
            + '<p class="eyebrow reveal" style="--d:.05s">pra guardar · ' + part + ' de ' + total + '</p>'
            + '<h2 class="mega reveal" style="--d:.14s">frases<br><span class="accent-italic">prontas</span></h2>'
            + '<div class="quote-wall">' + cards + '</div>'
        );
    }

    function rEvolucao() {
        var inner = ''
            + '<p class="eyebrow reveal" style="--d:.05s">a corrida · rodada a rodada</p>'
            + '<h2 class="mega reveal" style="--d:.14s">a <span class="accent-italic">evolução</span></h2>';
        if (temDados()) {
            inner += buildChart();
            inner += '<p class="lead reveal" style="--d:.5s">Pontos acumulados a cada dia de jogos.</p>';
        } else {
            inner += '<p class="lead reveal" style="--d:.3s">A evolução aparece aqui quando os dados carregam.</p>';
        }
        return shell('lime', inner);
    }

    // Confetes determinísticos (posições/tempos derivados do índice)
    function confetti(count) {
        var colors = ['#ff2e6c', '#ffd23f', '#2ce5a0', '#9b6cff', '#38b6ff', '#ff7a1a', '#fff8f0'];
        var out = '';
        for (var i = 0; i < count; i++) {
            var left = (i * 53) % 100;            // 0..100 %
            var drift = ((i % 7) - 3) * 6;         // vw de desvio lateral
            var dur = 3.2 + (i % 5) * 0.7;         // s
            var delay = -((i * 0.37) % dur);       // s (negativo → já caindo)
            var w = 7 + (i % 3) * 3;               // px
            var h = 10 + (i % 4) * 3;              // px
            var col = colors[i % colors.length];
            var rad = (i % 2) ? '50%' : '2px';     // mistura quadrados e círculos
            out += '<i style="left:' + left + '%;width:' + w + 'px;height:' + h + 'px;background:'
                + col + ';border-radius:' + rad + ';--drift:' + drift + 'vw;animation-duration:'
                + dur.toFixed(2) + 's;animation-delay:' + delay.toFixed(2) + 's"></i>';
        }
        return '<div class="confetti" aria-hidden="true">' + out + '</div>';
    }

    // Slide final: celebração do campeão da fase de grupos
    function rCelebrate() {
        var inner = ''
            + '<p class="eyebrow reveal" style="--d:.05s">o campeão da fase de grupos</p>'
            + '<div class="trophy" style="--d:.12s">🏆</div>'
            + '<h2 class="celebrate-name reveal" style="--d:.24s">ALAN</h2>'
            + '<p class="celebrate-sub reveal" style="--d:.36s">75 pontos · 13 placares exatos · 68,1% de acerto</p>'
            + '<p class="player-quote reveal" style="--d:.48s">O líder não estava acertando palpites — estava corrigindo o gabarito.</p>'
            + '<div class="outro-actions">'
            + '<button class="share-btn reveal" style="--d:.58s" type="button" id="outro-replay">🔁 ver de novo</button>'
            + '<a class="text-btn reveal" style="--d:.68s" href="index.html">voltar ao bolão</a>'
            + '</div>';
        return '<section class="slide" data-grad="gold" style="--pc:' + colorOf('Alan') + '" aria-hidden="true">'
            + confetti(42)
            + '<div class="slide-inner">' + inner + '</div>'
            + '</section>';
    }

    // ------------------------------ Deck ---------------------------------
    function buildDeck() {
        var slides = [];
        slides.push(rIntro());
        slides.push(rCenario());
        slides.push(rPodio());
        slides.push(rDivider('curiosidades', 'as grandes<br><span class="accent-italic">histórias</span>', '16 momentos', 'violet'));
        CURIOSIDADES.forEach(function (c, i) { slides.push(rCuriosidade(c, i)); });
        slides.push(rDivider('os protagonistas', 'por<br><span class="accent-italic">jogador</span>', '6 perfis', 'night'));
        PLAYERS.forEach(function (p) { slides.push(rPlayer(p)); });
        slides.push(rDivider('jogo a jogo', 'momentos<br><span class="accent-italic">por jogo</span>', '40 jogos', 'crimson'));
        GAMES.forEach(function (g, i) { slides.push(rGame(g, i)); });
        var frasesHalf = Math.ceil(FRASES.length / 2);
        slides.push(rFrases(1, 2, FRASES.slice(0, frasesHalf)));
        slides.push(rFrases(2, 2, FRASES.slice(frasesHalf)));
        slides.push(rEvolucao());
        slides.push(rCelebrate());
        return slides;
    }

    // ------------------------------ Estado / nav -------------------------
    var state = { dados: null, index: 0, slides: [] };
    var hintHidden = false;

    function render() {
        state.slides = buildDeck();
        var deck = $('#deck');
        deck.innerHTML = state.slides.join('');
        var replay = deck.querySelector('#outro-replay');
        if (replay) replay.addEventListener('click', function () { goTo(0); });
        goTo(0);
        var loader = document.getElementById('retro-loader');
        if (loader) loader.remove();
    }

    function updateProgress() {
        var pct = state.slides.length ? ((state.index + 1) / state.slides.length) * 100 : 0;
        $('#progress-fill').style.width = pct + '%';
        $('#nav-prev').classList.toggle('is-hidden', state.index === 0);
        $('#nav-next').classList.toggle('is-hidden', state.index === state.slides.length - 1);
    }

    function goTo(i) {
        var slides = $('#deck').querySelectorAll('.slide');
        if (i < 0 || i >= slides.length) return;
        var cur = slides[state.index];
        if (cur) cur.classList.remove('active');
        state.index = i;
        slides[i].classList.add('active');
        slides.forEach(function (s, idx) { s.setAttribute('aria-hidden', idx === i ? 'false' : 'true'); });
        updateProgress();
        hideHint();
        // Em slides com botões/links (ex.: celebração final), desliga as zonas de
        // toque no celular para o clique chegar nos botões. Swipe e HUD continuam.
        document.body.classList.toggle('no-tap', !!slides[i].querySelector('button, a'));
    }

    function next() { goTo(state.index + 1); }
    function prev() { goTo(state.index - 1); }

    function hideHint() {
        if (hintHidden) return;
        hintHidden = true;
        var h = $('#hint');
        if (h) h.classList.add('is-hidden');
    }

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
        });

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
        var loader = document.createElement('div');
        loader.className = 'loader';
        loader.id = 'retro-loader';
        loader.innerHTML = '<div><div class="spinner"></div>'
            + '<p style="font-family:var(--font-mono);letter-spacing:.22em;text-transform:uppercase;font-size:.78rem;opacity:.8">montando a retrospectiva…</p>'
            + '</div>';
        document.body.appendChild(loader);

        wire();
        CORE.loadDados().then(function (dados) {
            state.dados = dados;
            render();
        }).catch(function () {
            render(); // sem dados: o slide da evolução mostra fallback
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
