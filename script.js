// Função para ler os dados (do elemento script inline ou do arquivo JSON)
async function loadDados() {
    // Tenta ler do elemento script inline primeiro
    const dadosScript = document.getElementById('dados');
    if (dadosScript) {
        try {
            return JSON.parse(dadosScript.textContent);
        } catch (error) {
            console.error('Erro ao fazer parse dos dados inline:', error);
        }
    }

    // Se não tiver dados inline, tenta fetch do arquivo JSON
    try {
        const response = await fetch('dados.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        return getDadosExemplo();
    }
}

// Dados de exemplo (fallback)
function getDadosExemplo() {
    return {
        jogos: [
            {
                id: 1,
                timeA: "Brasil",
                timeB: "Argentina",
                placar: null,
                jogado: false
            },
            {
                id: 2,
                timeA: "França",
                timeB: "Alemanha",
                placar: { timeA: 2, timeB: 1 },
                jogado: true
            },
            {
                id: 3,
                timeA: "Portugal",
                timeB: "Espanha",
                placar: null,
                jogado: false
            },
            {
                id: 4,
                timeA: "Inglaterra",
                timeB: "Holanda",
                placar: { timeA: 1, timeB: 1 },
                jogado: true
            }
        ],
        palpites: {
            "Alan": { 1: { timeA: 2, timeB: 1 }, 2: { timeA: 2, timeB: 2 }, 3: { timeA: 1, timeB: 0 }, 4: { timeA: 2, timeB: 1 } },
            "Fernanda": { 1: { timeA: 1, timeB: 1 }, 2: { timeA: 2, timeB: 1 }, 3: { timeA: 2, timeB: 1 }, 4: { timeA: 1, timeB: 1 } },
            "Jorge": { 1: { timeA: 3, timeB: 0 }, 2: { timeA: 1, timeB: 2 }, 3: { timeA: 0, timeB: 2 }, 4: { timeA: 1, timeB: 2 } },
            "Raquel": { 1: { timeA: 2, timeB: 1 }, 2: { timeA: 2, timeB: 1 }, 3: { timeA: 1, timeB: 1 }, 4: { timeA: 1, timeB: 0 } }
        }
    };
}

// Calcular resultado de um jogo
function calcularResultado(jogo) {
    if (!jogo.placar) return null;

    const { timeA, timeB } = jogo.placar;
    if (timeA > timeB) return 'A';
    if (timeB > timeA) return 'B';
    return 'empate';
}

// Calcular pontos de um palpite
function calcularPontos(palpite, jogo) {
    if (!jogo.jogado || !jogo.placar) return null;

    const { timeA: palpiteA, timeB: palpiteB } = palpite;
    const { timeA: realA, timeB: realB } = jogo.placar;

    // Placar exato = 3 pontos
    if (palpiteA === realA && palpiteB === realB) {
        return 3;
    }

    // Acertou o vencedor ou empate = 1 ponto
    const resultadoReal = realA > realB ? 'A' : (realB > realA ? 'B' : 'empate');
    const resultadoPalpite = palpiteA > palpiteB ? 'A' : (palpiteB > palpiteA ? 'B' : 'empate');

    if (resultadoReal === resultadoPalpite) {
        return 1;
    }

    return 0;
}

// Renderizar classificação
function renderizarClassificacao(jogos, palpites) {
    const jogadores = ['Alan', 'Fernanda', 'Jorge', 'Raquel'];
    const pontuacoes = [];

    jogadores.forEach(jogador => {
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

    const podium = document.getElementById('podium');
    podium.innerHTML = '';

    pontuacoes.forEach((item, index) => {
        const classes = ['podium-item'];
        if (index === 0) classes.push('gold');
        else if (index === 1) classes.push('silver');
        else if (index === 2) classes.push('bronze');

        const div = document.createElement('div');
        div.className = classes.join(' ');
        div.innerHTML = `
            <span class="podium-rank">${index + 1}</span>
            <div class="podium-name">${item.jogador}</div>
            <div class="podium-points">${item.pontos}<span>pts</span></div>
        `;
        podium.appendChild(div);
    });
}

// Renderizar jogos
function renderizarJogos(jogos, palpites) {
    const matchesList = document.getElementById('matches-list');
    matchesList.innerHTML = '';

    const jogadores = ['Alan', 'Fernanda', 'Jorge', 'Raquel'];

    jogos.forEach(jogo => {
        const card = document.createElement('div');
        card.className = 'match-card' + (jogo.jogado ? ' played' : '');

        const scoreDisplay = jogo.placar
            ? `${jogo.placar.timeA} × ${jogo.placar.timeB}`
            : '×';
        const scoreClass = jogo.jogado ? 'match-score' : 'match-score pending';
        const statusText = jogo.jogado ? 'Finalizado' : 'A jogar';
        const statusClass = jogo.jogado ? 'played' : 'pending';

        let predictionsHTML = '';
        jogadores.forEach(jogador => {
            const palpite = palpites[jogador]?.[jogo.id];
            if (palpite) {
                const pontos = calcularPontos(palpite, jogo);
                let itemClass = 'prediction-item';
                let pointsText = '-';

                if (pontos !== null) {
                    if (pontos === 3) {
                        itemClass += ' correct-exact';
                        pointsText = '+3';
                    } else if (pontos === 1) {
                        itemClass += ' correct-winner';
                        pointsText = '+1';
                    } else {
                        pointsText = '0';
                    }
                }

                predictionsHTML += `
                    <div class="${itemClass}">
                        <div class="prediction-player">${jogador}</div>
                        <div class="prediction-score">${palpite.timeA} × ${palpite.timeB}</div>
                        <div class="prediction-points">${pointsText}</div>
                    </div>
                `;
            }
        });

        card.innerHTML = `
            <div class="match-header">
                <div class="match-teams">
                    <span class="match-team">${jogo.timeA}</span>
                    <span class="match-vs">VS</span>
                    <span class="match-team">${jogo.timeB}</span>
                </div>
                <div class="${scoreClass}">${scoreDisplay}</div>
                <span class="match-status ${statusClass}">${statusText}</span>
            </div>
            <div class="predictions-grid">
                ${predictionsHTML}
            </div>
        `;

        matchesList.appendChild(card);
    });
}

// Inicializar
async function init() {
    const dados = await loadDados();
    renderizarClassificacao(dados.jogos, dados.palpites);
    renderizarJogos(dados.jogos, dados.palpites);
}

init();
