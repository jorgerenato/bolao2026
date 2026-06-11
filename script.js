// Versão da aplicação (definida no index.html)
const VERSION = window.APP_VERSION || '2';

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
        const response = await fetch(`dados.json?v=${VERSION}`);
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
                dataHora: new Date().toISOString(),
                timeA: "Brasil",
                timeB: "Argentina",
                placar: null,
                jogado: false
            }
        ],
        palpites: {
            "Alan": { 1: { timeA: 2, timeB: 1 } },
            "Fernanda": { 1: { timeA: 1, timeB: 1 } },
            "Jorge": { 1: { timeA: 3, timeB: 0 } },
            "Raquel": { 1: { timeA: 2, timeB: 0 } }
        }
    };
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

// Filtrar jogos baseado no filtro selecionado
function filtrarJogos(jogos, filtro) {
    const agora = new Date();
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());

    switch (filtro) {
        case 'hoje':
            return jogos.filter(jogo => {
                const dataJogo = new Date(jogo.dataHora);
                const dataJogoDia = new Date(dataJogo.getFullYear(), dataJogo.getMonth(), dataJogo.getDate());
                return dataJogoDia.getTime() === hoje.getTime();
            });

        case 'proximos':
            return jogos.filter(jogo => {
                const dataJogo = new Date(jogo.dataHora);
                return dataJogo > agora && !jogo.jogado;
            }).sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));

        case 'anteriores':
            return jogos.filter(jogo => jogo.jogado || new Date(jogo.dataHora) < agora);

        case 'todos':
        default:
            return jogos;
    }
}

// Formatar data e hora para exibição
function formatarDataHora(dataHora) {
    const data = new Date(dataHora);
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const dataJogo = new Date(data.getFullYear(), data.getMonth(), data.getDate());
    const dataHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const dataAmanha = new Date(amanha.getFullYear(), amanha.getMonth(), amanha.getDate());

    let dataTexto = '';
    if (dataJogo.getTime() === dataHoje.getTime()) {
        dataTexto = 'Hoje';
    } else if (dataJogo.getTime() === dataAmanha.getTime()) {
        dataTexto = 'Amanhã';
    } else {
        const opcoes = { day: '2-digit', month: '2-digit' };
        dataTexto = data.toLocaleDateString('pt-BR', opcoes);
    }

    const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${dataTexto} · ${hora}`;
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

        const link = document.createElement('a');
        link.href = `estatisticas.html?jogador=${encodeURIComponent(item.jogador)}`;
        link.className = classes.join(' ');
        link.innerHTML = `
            <span class="podium-rank">${index + 1}</span>
            <div class="podium-name">${item.jogador}</div>
            <div class="podium-points">${item.pontos}<span>pts</span></div>
            <span class="podium-link">→</span>
        `;
        podium.appendChild(link);
    });
}

// Renderizar jogos
function renderizarJogos(jogos, palpites, filtro = 'hoje') {
    const matchesList = document.getElementById('matches-list');
    matchesList.innerHTML = '';

    const jogosFiltrados = filtrarJogos(jogos, filtro);

    if (jogosFiltrados.length === 0) {
        matchesList.innerHTML = '<p style="text-align: center; color: var(--gold-light); padding: 2rem;">Nenhum jogo encontrado para este filtro.</p>';
        return;
    }

    const jogadores = ['Alan', 'Fernanda', 'Jorge', 'Raquel'];

    jogosFiltrados.forEach(jogo => {
        const card = document.createElement('div');
        card.className = 'match-card' + (jogo.jogado ? ' played' : '');

        const scoreDisplay = jogo.placar
            ? `${jogo.placar.timeA} × ${jogo.placar.timeB}`
            : '';
        const scoreClass = jogo.jogado ? 'match-score' : 'match-score pending';
        const statusText = jogo.jogado ? 'Finalizado' : 'A jogar';
        const statusClass = jogo.jogado ? 'played' : 'pending';

        const dataHoraTexto = formatarDataHora(jogo.dataHora);

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
                <div class="match-date">${dataHoraTexto}</div>
                <div class="match-teams">
                    <span class="match-team">${jogo.timeA}</span>
                    <span class="match-vs">VS</span>
                    <span class="match-team">${jogo.timeB}</span>
                </div>
                <span class="match-status ${statusClass}">${statusText}</span>
            </div>
            ${scoreDisplay ? `<div class="${scoreClass}">${scoreDisplay}</div>` : ''}
            <div class="predictions-grid">
                ${predictionsHTML}
            </div>
        `;

        matchesList.appendChild(card);
    });
}

// Inicializar filtros
function inicializarFiltros(jogos, palpites) {
    const botoes = document.querySelectorAll('.filter-btn');

    botoes.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover classe active de todos
            botoes.forEach(b => b.classList.remove('active'));
            // Adicionar classe active no clicado
            btn.classList.add('active');
            // Filtrar jogos
            renderizarJogos(jogos, palpites, btn.dataset.filter);
        });
    });
}

// Inicializar
async function init() {
    const dados = await loadDados();
    renderizarClassificacao(dados.jogos, dados.palpites);
    renderizarJogos(dados.jogos, dados.palpites, 'hoje');
    inicializarFiltros(dados.jogos, dados.palpites);
}

init();
