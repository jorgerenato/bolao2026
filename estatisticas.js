// Versão da aplicação
const VERSION = window.APP_VERSION || '3';

// Mapeamento de países para bandeiras (emojis)
const BANDEIRAS = {
    'Alemanha': '🇩🇪',
    'Arábia Saudita': '🇸🇦',
    'Argélia': '🇩🇿',
    'Argentina': '🇦🇷',
    'Austrália': '🇦🇺',
    'Bélgica': '🇧🇪',
    'Bégica': '🇧🇪',
    'Bósnia': '🇧🇦',
    'Brasil': '🇧🇷',
    'Cabo Verde': '🇨🇻',
    'Canadá': '🇨🇦',
    'Catar': '🇶🇦',
    'Chile': '🇨🇱',
    'Colômbia': '🇨🇴',
    'Coreia do Sul': '🇰🇷',
    'Costa do Marfim': '🇨🇮',
    'Croácia': '🇭🇷',
    'Curaçao': '🇨🇼',
    'Dinamarca': '🇩🇰',
    'Egito': '🇪🇬',
    'El Salvador': '🇸🇻',
    'Equador': '🇪🇨',
    'Escócia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'Espanha': '🇪🇸',
    'Estados Unidos': '🇺🇸',
    'EUA': '🇺🇸',
    'Finlândia': '🇫🇮',
    'França': '🇫🇷',
    'Grécia': '🇬🇷',
    'Holanda': '🇳🇱',
    'Holanda/Países Baixos': '🇳🇱',
    'Países Baixos': '🇳🇱',
    'Honduras': '🇭🇳',
    'Haiti': '🇭🇹',
    'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Irã': '🇮🇷',
    'Iraque': '🇮🇶',
    'Itália': '🇮🇹',
    'Japão': '🇯🇵',
    'Jordânia': '🇯🇴',
    'México': '🇲🇽',
    'Marrocos': '🇲🇦',
    'Nicarágua': '🇳🇮',
    'Nigéria': '🇳🇬',
    'Nova Zelândia': '🇳🇿',
    'Panamá': '🇵🇦',
    'Paraguai': '🇵🇾',
    'Peru': '🇵🇪',
    'Polônia': '🇵🇱',
    'Portugal': '🇵🇹',
    'República Tcheca': '🇨🇿',
    'Romênia': '🇷🇴',
    'Rússia': '🇷🇺',
    'Senegal': '🇸🇳',
    'Sérvia': '🇷🇸',
    'Suécia': '🇸🇪',
    'Suíça': '🇨🇭',
    'Tunísia': '🇹🇳',
    'Turquia': '🇹🇷',
    'Ucrânia': '🇺🇦',
    'Uruguai': '🇺🇾',
    'África do Sul': '🇿🇦',
};

// Função para obter a bandeira de um país
function getBandeira(pais) {
    return BANDEIRAS[pais] || '⚽';
}

// Jogadores disponíveis
const JOGADORES = ['Alan', 'Fernanda', 'Jorge', 'Lia', 'Raquel', 'Sueli'];

// Jogador selecionado - ler da URL ou usar o primeiro
const urlParams = new URLSearchParams(window.location.search);
const jogadorFromUrl = urlParams.get('jogador');
let jogadorAtual = jogadorFromUrl && JOGADORES.includes(jogadorFromUrl)
    ? jogadorFromUrl
    : JOGADORES[0];

// Dados carregados
let dados = null;

// Função para ler os dados
async function loadDados() {
    if (dados) return dados;
    dados = await window.BolaoCore.loadDados();
    return dados;
}

// Dados de exemplo (fallback)
function getDadosExemplo() {
    return {
        jogos: [
            {
                id: 1,
                dataHora: new Date().toISOString(),
                timeA: "Brasil",
                timeB: "Argentina",
                placar: { timeA: 2, timeB: 1 },
                jogado: true
            }
        ],
        palpites: {
            "Alan": { 1: { timeA: 2, timeB: 1 } },
            "Fernanda": { 1: { timeA: 1, timeB: 1 } },
            "Jorge": { 1: { timeA: 3, timeB: 0 } },
            "Lia": { 1: { timeA: 1, timeB: 0 } },
            "Raquel": { 1: { timeA: 2, timeB: 0 } },
            "Sueli": { 1: { timeA: 1, timeB: 2 } }
        }
    };
}

// Calcular pontos de um palpite
function calcularPontos(palpite, jogo) {
    return window.BolaoCore.calcularPontos(palpite, jogo);
}

// Calcular ranking de todos os jogadores
function calcularRanking(jogos, palpites) {
    const pontuacoes = [];

    JOGADORES.forEach(jogador => {
        let total = 0;
        jogos.forEach(jogo => {
            const palpite = palpites[jogador]?.[jogo.id];
            if (palpite) {
                const pontos = calcularPontos(palpite, jogo);
                if (pontos !== null) total += pontos;
            }
        });
        pontuacoes.push({ jogador, pontos: total });
    });

    // Ordenar por pontos (decrescente)
    pontuacoes.sort((a, b) => b.pontos - a.pontos);

    return pontuacoes;
}

// Calcular estatísticas de um jogador
function calcularEstatisticasJogador(jogador, jogos, palpites) {
    const ranking = calcularRanking(jogos, palpites);
    const posicaoRanking = ranking.findIndex(r => r.jogador === jogador) + 1;

    let pontosTotal = 0;
    let palpitesFeitos = 0;
    let placaresExatos = 0;
    let acertosVencedor = 0;
    let erros = 0;
    let jogosJogados = 0;
    let melhorSequencia = 0;
    let sequenciaAtual = 0;

    const historico = [];
    const desempenho = [];

    jogos.forEach(jogo => {
        const palpite = palpites[jogador]?.[jogo.id];

        if (palpite) {
            palpitesFeitos++;
            const pontos = calcularPontos(palpite, jogo);

            historico.push({
                jogo,
                palpite,
                pontos,
                acertou: pontos === 3 ? 'exato' : pontos === 1 ? 'vencedor' : pontos === 0 ? 'erro' : 'pendente'
            });

            if (pontos !== null) {
                jogosJogados++;
                pontosTotal += pontos;
                desempenho.push(pontos);

                if (pontos === 3) {
                    placaresExatos++;
                    sequenciaAtual++;
                    melhorSequencia = Math.max(melhorSequencia, sequenciaAtual);
                } else if (pontos === 1) {
                    acertosVencedor++;
                    sequenciaAtual = 0;
                } else {
                    erros++;
                    sequenciaAtual = 0;
                }
            } else {
                desempenho.push(null); // Jogo ainda não jogado
            }
        }
    });

    // Taxa de acerto (baseado na pontuação máxima possível: 3 pontos por jogo)
    const taxaAcerto = jogosJogados > 0
        ? Math.round((pontosTotal / (jogosJogados * 3)) * 100)
        : 0;

    // Melhor palpite (placar exato com maior soma de gols)
    const melhorPalpite = historico
        .filter(h => h.pontos === 3)
        .sort((a, b) => {
            const somaA = a.palpite.timeA + a.palpite.timeB;
            const somaB = b.palpite.timeA + b.palpite.timeB;
            return somaB - somaA;
        })[0];

    // Último jogo jogado
    const ultimoJogo = historico
        .filter(h => h.pontos !== null)
        .pop();

    // Primeiro jogo jogado
    const primeiroJogo = historico
        .filter(h => h.pontos !== null)[0];

    return {
        jogador,
        pontosTotal,
        posicaoRanking,
        palpitesFeitos,
        placaresExatos,
        acertosVencedor,
        erros,
        jogosJogados,
        taxaAcerto,
        melhorSequencia,
        melhorPalpite,
        ultimoJogo,
        primeiroJogo,
        historico,
        desempenho,
        totalJogadores: JOGADORES.length
    };
}

// Renderizar tabs de seleção de jogador
function renderizarPlayerTabs() {
    const tabsContainer = document.getElementById('player-tabs');
    tabsContainer.innerHTML = '';

    JOGADORES.forEach(jogador => {
        const tab = document.createElement('button');
        tab.className = 'player-tab' + (jogador === jogadorAtual ? ' active' : '');
        tab.textContent = jogador;
        tab.addEventListener('click', () => {
            jogadorAtual = jogador;
            renderizarPlayerTabs();
            renderizarEstatisticas();
        });
        tabsContainer.appendChild(tab);
    });
}

// Renderizar cabeçalho do jogador
function renderizarPlayerHeader(stats) {
    const header = document.getElementById('player-header');

    // Emojis com base na posição
    let avatar = '👤';
    let titulo = 'Jogador';

    if (stats.posicaoRanking === 1) {
        avatar = '🥇';
        titulo = 'Líder do Bolão';
    } else if (stats.posicaoRanking === 2) {
        avatar = '🥈';
        titulo = 'Vice-líder';
    } else if (stats.posicaoRanking === 3) {
        avatar = '🥉';
        titulo = 'No Pódio';
    } else if (stats.posicaoRanking === stats.totalJogadores) {
        avatar = '🫣';
        titulo = 'Útimo lugar';
    } else {
        avatar = '⚽';
        titulo = `${stats.posicaoRanking}º lugar`;
    }

    header.innerHTML = `
        <div class="player-header-avatar">${avatar}</div>
        <h2 class="player-header-name">${stats.jogador}</h2>
        <p class="player-header-title">${titulo}</p>
    `;
}

// Renderizar estatísticas principais
function renderizarStats(stats) {
    // Pontuação total
    document.getElementById('stat-total').textContent = stats.pontosTotal;

    // Posição no ranking
    document.getElementById('stat-rank').textContent = `#${stats.posicaoRanking}`;

    // Palpites feitos
    document.getElementById('stat-predictions').textContent = stats.palpitesFeitos;

    // Taxa de acerto
    document.getElementById('stat-rate').textContent = `${stats.taxaAcerto}%`;
}

// Renderizar acertos detalhados
function renderizarAccuracy(stats) {
    document.getElementById('stat-exact').textContent = stats.placaresExatos;
    document.getElementById('stat-winner').textContent = stats.acertosVencedor;
    document.getElementById('stat-zero').textContent = stats.erros;
}

// Renderizar gráfico de desempenho
function renderizarPerformanceChart(stats) {
    const chart = document.getElementById('performance-chart');
    chart.innerHTML = '';

    stats.desempenho.forEach((pontos, index) => {
        const bar = document.createElement('div');
        bar.className = 'performance-bar';

        const altura = pontos === null ? 10 : (pontos === 0 ? 20 : (pontos * 33));
        const pontosClass = pontos === null ? 'pending' : `points-${pontos}`;

        bar.innerHTML = `
            <div class="performance-bar-tooltip">
                Jogo ${index + 1}: ${pontos === null ? 'Pendente' : pontos + ' pontos'}
            </div>
            <div class="performance-bar-fill ${pontosClass}" style="height: ${altura}%"></div>
            <div class="performance-bar-label">${index + 1}</div>
        `;

        chart.appendChild(bar);
    });
}

// Renderizar histórico
function renderizarHistory(stats) {
    const list = document.getElementById('history-list');
    list.innerHTML = '';

    stats.historico.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${item.acertou}`;

        const dataJogo = new Date(item.jogo.dataHora);
        const dataFormatada = dataJogo.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

        const resultadoDisplay = item.pontos === null
            ? '?'
            : `+${item.pontos}`;

        const palpiteDisplay = `${item.palpite.timeA} × ${item.palpite.timeB}`;
        const realDisplay = item.jogo.placar
            ? `${item.jogo.placar.timeA} × ${item.jogo.placar.timeB}`
            : 'a jogar';

        historyItem.innerHTML = `
            <div class="history-date">${dataFormatada}</div>
            <div class="history-match">
                <div class="history-teams">${getBandeira(item.jogo.timeA)} ${item.jogo.timeA} vs ${item.jogo.timeB} ${getBandeira(item.jogo.timeB)}</div>
                <div class="history-prediction">Palpite: ${palpiteDisplay} ${item.jogo.placar ? `· Real: ${realDisplay}` : ''}</div>
            </div>
            <div class="history-result ${item.acertou}">${resultadoDisplay}</div>
        `;

        list.appendChild(historyItem);
    });

    if (stats.historico.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 2rem;">Nenhum palpite encontrado.</p>';
    }
}

// Renderizar destaques
function renderizarHighlights(stats) {
    const grid = document.getElementById('highlights-grid');
    grid.innerHTML = '';

    const highlights = [];

    // Melhor sequência
    if (stats.melhorSequencia > 0) {
        highlights.push({
            icon: '🔥',
            value: `${stats.melhorSequencia} jogos`,
            label: 'Melhor Sequência de Acertos'
        });
    }

    // Melhor palpite
    if (stats.melhorPalpite) {
        const soma = stats.melhorPalpite.palpite.timeA + stats.melhorPalpite.palpite.timeB;
        highlights.push({
            icon: '⭐',
            value: `${stats.melhorPalpite.palpite.timeA} × ${stats.melhorPalpite.palpite.timeB}`,
            label: 'Melhor Palpite (Placar Exato)'
        });
    }

    // Primeiro jogo
    if (stats.primeiroJogo) {
        highlights.push({
            icon: '🎬',
            value: stats.primeiroJogo.pontos === 3 ? 'Placar Exato!' : `+${stats.primeiroJogo.pontos}`,
            label: 'Primeiro Jogo'
        });
    }

    // Último resultado
    if (stats.ultimoJogo) {
        const lastPoints = stats.ultimoJogo.pontos;
        const lastLabel = lastPoints === 3 ? 'Último: Placar Exato! 🎉' :
            lastPoints === 1 ? 'Último: Acertou vencedor' :
                lastPoints === 0 ? 'Último: Errou' : 'Último: Pendente';
        highlights.push({
            icon: lastPoints === 3 ? '🎉' : lastPoints === 1 ? '👍' : '🤔',
            value: lastPoints !== null ? `+${lastPoints}` : '?',
            label: lastLabel
        });
    }

    // Total de jogos jogados
    highlights.push({
        icon: '📊',
        value: `${stats.jogosJogados}/${stats.palpitesFeitos}`,
        label: 'Jogos Finalizados'
    });

    highlights.forEach(h => {
        const card = document.createElement('div');
        card.className = 'highlight-card';
        card.innerHTML = `
            <div class="stat-icon">${h.icon}</div>
            <div class="highlight-value">${h.value}</div>
            <div class="highlight-label">${h.label}</div>
        `;
        grid.appendChild(card);
    });
}

// Renderizar todas as estatísticas
function renderizarEstatisticas() {
    const stats = calcularEstatisticasJogador(jogadorAtual, dados.jogos, dados.palpites);

    renderizarPlayerHeader(stats);
    renderizarStats(stats);
    renderizarAccuracy(stats);
    renderizarPerformanceChart(stats);
    renderizarHistory(stats);
    renderizarHighlights(stats);
}

// Inicializar
async function init() {
    await loadDados();
    renderizarPlayerTabs();
    renderizarEstatisticas();
}

init();
