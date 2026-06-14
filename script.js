// Versão da aplicação (definida no index.html)
const VERSION = window.APP_VERSION || '2';
const JOGADORES = window.BolaoCore.JOGADORES;

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

// Função para verificar se jogo está ao vivo (últimas 2 horas)
function isAoVivo(dataHora, jogado) {
    if (jogado) return false;
    const agora = new Date();
    const dataJogo = new Date(dataHora);
    const diffMinutos = (agora - dataJogo) / (1000 * 60);
    return diffMinutos >= 0 && diffMinutos <= 120; // Ao vivo se começou há até 2h
}

function isLocalhost() {
    return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}

// Função para ler os dados (do elemento script inline ou do arquivo JSON)
async function loadDados() {
    return window.BolaoCore.loadDados();
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
            "Lia": { 1: { timeA: 2, timeB: 1 } },
            "Raquel": { 1: { timeA: 2, timeB: 0 } },
            "Sueli": { 1: { timeA: 1, timeB: 2 } }
        }
    };
}

// Calcular pontos de um palpite
function calcularPontos(palpite, jogo) {
    return window.BolaoCore.calcularPontos(palpite, jogo);
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

// ========== FUNÇÕES DE ESTATÍSTICAS ALEATÓRIAS ==========

// 1. O Consenso - Placar que todos previram igual
function calcConsenso(jogos, palpites, jogadores) {
    const consensos = [];
    jogos.forEach(jogo => {
        const palpitesJogo = jogadores.map(j => palpites[j]?.[jogo.id]).filter(p => p);
        if (palpitesJogo.length < 2) return;

        const primeiro = palpitesJogo[0];
        const todosIguais = palpitesJogo.every(p => p.timeA === primeiro.timeA && p.timeB === primeiro.timeB);

        if (todosIguais) {
            consensos.push({ jogo, placar: `${primeiro.timeA}×${primeiro.timeB}` });
        }
    });

    if (consensos.length === 0) return null;
    const aleatorio = consensos[Math.floor(Math.random() * consensos.length)];
    return {
        icon: '🎯',
        label: 'O Consenso',
        value: aleatorio.placar,
        sub: `Todos concordaram!`
    };
}

// 2. A Zebra - Total de jogos sem acertador
function calcZebra(jogos, palpites, jogadores) {
    let totalZebra = 0;

    jogos.forEach(jogo => {
        if (!jogo.jogado || !jogo.placar) return;

        const vencedorReal = jogo.placar.timeA > jogo.placar.timeB ? 'A' :
            (jogo.placar.timeB > jogo.placar.timeA ? 'B' : 'E');

        const todosErraram = jogadores.every(jogador => {
            const palpite = palpites[jogador]?.[jogo.id];
            if (!palpite) return true;

            const vencedorPalpite = palpite.timeA > palpite.timeB ? 'A' :
                (palpite.timeB > palpite.timeA ? 'B' : 'E');
            return vencedorPalpite !== vencedorReal;
        });

        if (todosErraram && jogadores.some(j => palpites[j]?.[jogo.id])) {
            totalZebra++;
        }
    });

    if (totalZebra === 0) return null;
    return {
        icon: '😱',
        label: 'Ninguém viu Vindo',
        value: `${totalZebra} ${totalZebra === 1 ? 'vez' : 'vezes'} sem acertador`,
        sub: ''
    };
}

// 3. O Otimista - Quem mais prevê placares com muitos gols
function calcOtimista(jogos, palpites, jogadores) {
    const medias = {};
    jogadores.forEach(jogador => {
        let totalGols = 0;
        let count = 0;
        jogos.forEach(jogo => {
            const palpite = palpites[jogador]?.[jogo.id];
            if (palpite) {
                totalGols += palpite.timeA + palpite.timeB;
                count++;
            }
        });
        if (count > 0) medias[jogador] = totalGols / count;
    });

    const maxMedia = Math.max(...Object.values(medias));
    const otimistas = Object.entries(medias).filter(([j, m]) => m === maxMedia).map(([j]) => j);

    return {
        icon: '🎪',
        label: 'Sonha com Goleada',
        value: otimistas.length > 2 ? `${otimistas[0]} e ${otimistas[1]}` : otimistas.join(' e '),
        sub: `${maxMedia.toFixed(1)} gols/jogo (média)`
    };
}

// 4. O Conservador - Quem mais prevê placares com poucos gols
function calcConservador(jogos, palpites, jogadores) {
    const medias = {};
    jogadores.forEach(jogador => {
        let totalGols = 0;
        let count = 0;
        jogos.forEach(jogo => {
            const palpite = palpites[jogador]?.[jogo.id];
            if (palpite) {
                totalGols += palpite.timeA + palpite.timeB;
                count++;
            }
        });
        if (count > 0) medias[jogador] = totalGols / count;
    });

    const minMedia = Math.min(...Object.values(medias));
    const conservadores = Object.entries(medias).filter(([j, m]) => m === minMedia).map(([j]) => j);

    return {
        icon: '🛡️',
        label: 'Placar Magro',
        value: conservadores.length > 2 ? `${conservadores[0]} e ${conservadores[1]}` : conservadores.join(' e '),
        sub: `${minMedia.toFixed(1)} gols/jogo (média)`
    };
}

// 5. O Troller - Quem mais prevê placares improváveis (soma >= 6)
function calcTroller(jogos, palpites, jogadores) {
    const trolls = {};
    jogadores.forEach(jogador => {
        let count = 0;
        jogos.forEach(jogo => {
            const palpite = palpites[jogador]?.[jogo.id];
            if (palpite) {
                const total = palpite.timeA + palpite.timeB;
                if (total >= 6) {
                    count++;
                }
            }
        });
        trolls[jogador] = count;
    });

    const maxTroll = Math.max(...Object.values(trolls));
    if (maxTroll === 0) return null;

    const vencedores = Object.entries(trolls).filter(([j, c]) => c === maxTroll).map(([j]) => j);

    return {
        icon: '😈',
        label: 'O Troller',
        value: vencedores.length > 2 ? `${vencedores[0]} e ${vencedores[1]}` : vencedores.join(' e '),
        sub: `${maxTroll} palpite${maxTroll !== 1 ? 's' : ''} maluco${maxTroll !== 1 ? 's' : ''}`
    };
}

// 6. O Sortudo - Quem foi o ÚNICO a acertar o resultado de um jogo
function calcSortudo(jogos, palpites, jogadores) {
    const sortudos = {};
    jogadores.forEach(jogador => {
        let count = 0;
        jogos.forEach(jogo => {
            if (!jogo.jogado || !jogo.placar) return;

            const meuPalpite = palpites[jogador]?.[jogo.id];
            const meusPontos = calcularPontos(meuPalpite, jogo);
            if (!meusPontos) return;

            const outrosAcertaram = jogadores.some((outroJogador) => {
                if (outroJogador === jogador) return false;
                const outroPalpite = palpites[outroJogador]?.[jogo.id];
                return (calcularPontos(outroPalpite, jogo) || 0) > 0;
            });

            if (!outrosAcertaram) {
                count++;
            }
        });
        sortudos[jogador] = count;
    });

    const maxSorte = Math.max(...Object.values(sortudos));
    if (maxSorte === 0) return null;

    const vencedores = Object.entries(sortudos).filter(([j, c]) => c === maxSorte).map(([j]) => j);

    return {
        icon: '🍀',
        label: 'Eu Avisei',
        value: vencedores.length > 2 ? `${vencedores[0]} e ${vencedores[1]}` : vencedores.join(' e '),
        sub: `${maxSorte}x foi o único acertador!`
    };
}

// 7. O Azarado - Quem acertou o vencedor mas errou o placar por 1 gol
function calcAzarado(jogos, palpites, jogadores) {
    const azarados = {};
    jogadores.forEach(jogador => {
        let count = 0;
        jogos.forEach(jogo => {
            const palpite = palpites[jogador]?.[jogo.id];
            if (palpite && jogo.jogado && jogo.placar) {
                // Verificar se acertou o vencedor
                const resultadoReal = jogo.placar.timeA > jogo.placar.timeB ? 'A' :
                    (jogo.placar.timeB > jogo.placar.timeA ? 'B' : 'E');
                const resultadoPalpite = palpite.timeA > palpite.timeB ? 'A' :
                    (palpite.timeB > palpite.timeA ? 'B' : 'E');

                if (resultadoReal === resultadoPalpite && resultadoReal !== 'E') {
                    // Acertou o vencedor - verificar se errou por 1 gol no total
                    const diffA = Math.abs(palpite.timeA - jogo.placar.timeA);
                    const diffB = Math.abs(palpite.timeB - jogo.placar.timeB);
                    const diffTotal = diffA + diffB;

                    // Errou por exatamente 1 gol no total
                    if (diffTotal === 1) count++;
                }
            }
        });
        azarados[jogador] = count;
    });

    const maxAzar = Math.max(...Object.values(azarados));
    if (maxAzar === 0) return null;

    const vencedores = Object.entries(azarados).filter(([j, c]) => c === maxAzar).map(([j]) => j);

    return {
        icon: '😫',
        label: 'Por Um Gol',
        value: vencedores.length > 2 ? `${vencedores[0]} e ${vencedores[1]}` : vencedores.join(' e '),
        sub: `${maxAzar} vez${maxAzar !== 1 ? 'es' : ''}!`
    };
}

// 8. Festão - Jogo com maior soma de gols previsto
function calcFestao(jogos, palpites, jogadores) {
    const maxGols = { jogo: null, total: 0 };

    jogos.forEach(jogo => {
        let soma = 0;
        let count = 0;
        jogadores.forEach(jogador => {
            const palpite = palpites[jogador]?.[jogo.id];
            if (palpite) {
                soma += palpite.timeA + palpite.timeB;
                count++;
            }
        });
        const media = count > 0 ? soma / count : 0;
        if (media > maxGols.total) {
            maxGols.jogo = jogo;
            maxGols.total = media;
        }
    });

    if (!maxGols.jogo) return null;

    return {
        icon: '⚽',
        label: 'Show de Gols',
        value: `${maxGols.jogo.timeA} vs ${maxGols.jogo.timeB}`,
        sub: `${maxGols.total.toFixed(1)} gols/jogo, maior média de gols por palpite`
    };
}

// 9. Defesa Total - Jogo com menor soma de gols previsto
function calcDefesaTotal(jogos, palpites, jogadores) {
    const minGols = { jogo: null, total: Infinity };

    jogos.forEach(jogo => {
        let soma = 0;
        let count = 0;
        jogadores.forEach(jogador => {
            const palpite = palpites[jogador]?.[jogo.id];
            if (palpite) {
                soma += palpite.timeA + palpite.timeB;
                count++;
            }
        });
        const media = count > 0 ? soma / count : Infinity;
        if (media < minGols.total && count > 0) {
            minGols.jogo = jogo;
            minGols.total = media;
        }
    });

    if (!minGols.jogo) return null;

    return {
        icon: '🧱',
        label: 'Defesa Total',
        value: `${minGols.jogo.timeA} vs ${minGols.jogo.timeB}`,
        sub: `${minGols.total.toFixed(1)} gols/jogo, menor média de gols por palpite`
    };
}

// 10. Disco Arranhado - Quem mais repete o mesmo placar
function calcDiscoArranhado(jogos, palpites, jogadores) {
    const repeticoes = {};

    jogadores.forEach(jogador => {
        const contagem = {};
        jogos.forEach(jogo => {
            const palpite = palpites[jogador]?.[jogo.id];
            if (palpite) {
                const menor = Math.min(palpite.timeA, palpite.timeB);
                const maior = Math.max(palpite.timeA, palpite.timeB);
                const chave = `${menor}×${maior}`;
                contagem[chave] = (contagem[chave] || 0) + 1;
            }
        });

        const [placar, vezes] = Object.entries(contagem)
            .sort((a, b) => b[1] - a[1])[0] || [null, 0];

        repeticoes[jogador] = { placar, vezes };
    });

    const maxRepeticoes = Math.max(...Object.values(repeticoes).map(item => item.vezes));
    if (maxRepeticoes <= 1) return null;

    const vencedores = Object.entries(repeticoes)
        .filter(([, item]) => item.vezes === maxRepeticoes)
        .map(([jogador]) => jogador);
    const placarDestaque = Object.values(repeticoes).find(item => item.vezes === maxRepeticoes)?.placar;

    return {
        icon: `
            <svg viewBox="0 0 64 64" aria-hidden="true" style="width: 1.4em; height: 1.4em;">
                <circle cx="32" cy="32" r="28" fill="#111111"></circle>
                <circle cx="32" cy="32" r="18" fill="none" stroke="#2f2f2f" stroke-width="2"></circle>
                <circle cx="32" cy="32" r="9" fill="#d4af37"></circle>
                <circle cx="32" cy="32" r="2.2" fill="#f8f4e8"></circle>
                <path d="M32 14 A18 18 0 0 1 46 21" fill="none" stroke="#4a4a4a" stroke-width="2" stroke-linecap="round"></path>
                <path d="M18 43 A18 18 0 0 1 14 32" fill="none" stroke="#4a4a4a" stroke-width="2" stroke-linecap="round"></path>
            </svg>
        `,
        label: 'Disco Arranhado',
        value: vencedores.length > 2 ? `${vencedores[0]} e ${vencedores[1]}` : vencedores.join(' e '),
        sub: `${placarDestaque} repetido ${maxRepeticoes}x`
    };
}

// 11. Rei do Empate - Quem mais aposta em empates
function calcReiDoEmpate(jogos, palpites, jogadores) {
    const empates = {};

    jogadores.forEach(jogador => {
        let total = 0;
        jogos.forEach(jogo => {
            const palpite = palpites[jogador]?.[jogo.id];
            if (palpite && palpite.timeA === palpite.timeB) {
                total++;
            }
        });
        empates[jogador] = total;
    });

    const maxEmpates = Math.max(...Object.values(empates));
    if (maxEmpates === 0) return null;

    const vencedores = Object.entries(empates)
        .filter(([, total]) => total === maxEmpates)
        .map(([jogador]) => jogador);

    return {
        icon: '🤝',
        label: 'Rei do Empate',
        value: vencedores.length > 2 ? `${vencedores[0]} e ${vencedores[1]}` : vencedores.join(' e '),
        sub: `${maxEmpates} palpite${maxEmpates !== 1 ? 's' : ''} de empate`
    };
}

// 12. Do Contra - Quem mais desafiou o consenso do grupo
function calcDoContra(jogos, palpites, jogadores) {
    const doContra = {};
    jogadores.forEach(jogador => {
        doContra[jogador] = 0;
    });

    jogos.forEach(jogo => {
        const palpitesDoJogo = jogadores
            .map((jogador) => ({ jogador, palpite: palpites[jogador]?.[jogo.id] }))
            .filter((item) => item.palpite);

        if (palpitesDoJogo.length < 3) return;

        const contagemResultados = { A: 0, B: 0, E: 0 };
        palpitesDoJogo.forEach(({ palpite }) => {
            const resultado = palpite.timeA > palpite.timeB ? 'A' : (palpite.timeB > palpite.timeA ? 'B' : 'E');
            contagemResultados[resultado]++;
        });

        const consenso = Object.entries(contagemResultados)
            .sort((a, b) => b[1] - a[1])[0];

        if (!consenso || consenso[1] < 2) return;

        palpitesDoJogo.forEach(({ jogador, palpite }) => {
            const resultado = palpite.timeA > palpite.timeB ? 'A' : (palpite.timeB > palpite.timeA ? 'B' : 'E');
            if (resultado !== consenso[0]) {
                doContra[jogador]++;
            }
        });
    });

    const maxDoContra = Math.max(...Object.values(doContra));
    if (maxDoContra === 0) return null;

    const vencedores = Object.entries(doContra)
        .filter(([, total]) => total === maxDoContra)
        .map(([jogador]) => jogador);

    return {
        icon: '🙃',
        label: 'Do Contra',
        value: vencedores.length > 2 ? `${vencedores[0]} e ${vencedores[1]}` : vencedores.join(' e '),
        sub: `${maxDoContra} palpite${maxDoContra !== 1 ? 's' : ''} contra o consenso`
    };
}

// Pool de estatísticas aleatórias
const ESTATISTICAS_ALEATORIAS = [
    calcConsenso,
    calcZebra,
    calcOtimista,
    calcConservador,
    calcTroller,
    calcSortudo,
    calcAzarado,
    calcFestao,
    calcDefesaTotal,
    calcDiscoArranhado,
    calcReiDoEmpate,
    calcDoContra
];

// Sortear estatísticas aleatórias diferentes
function sortearEstatisticas(jogos, palpites, jogadores, quantidade = 2) {
    const disponiveis = [];

    // Calcular todas as estatísticas disponíveis
    ESTATISTICAS_ALEATORIAS.forEach(fn => {
        try {
            const resultado = fn(jogos, palpites, jogadores);
            if (resultado) {
                disponiveis.push(resultado);
            }
        } catch (e) {
            console.error('Erro ao calcular estatística:', e);
        }
    });

    // Embaralhar e pegar a quantidade desejada
    const embaralhado = disponiveis.sort(() => Math.random() - 0.5);
    return embaralhado.slice(0, quantidade);
}

// ========== FIM DAS ESTATÍSTICAS ALEATÓRIAS ==========

// Calcular e renderizar estatísticas gerais
function renderizarEstatisticasGerais(jogos, palpites) {
    const jogadores = JOGADORES;
    const stats = {
        maisExatos: { jogadores: [], total: 0 },
        menosErros: { jogadores: [], total: Infinity },
        totalPalpites: 0,
        jogosDisputados: null,
        placarMaisPrevisto: { placar: '-', vezes: 0 }
    };

    // Contar palpites exatos e erros por jogador
    jogadores.forEach(jogador => {
        let exatos = 0;
        let erros = 0;
        let totalJogos = 0;

        jogos.forEach(jogo => {
            const palpite = palpites[jogador]?.[jogo.id];
            if (palpite && jogo.jogado) {
                totalJogos++;
                const pontos = calcularPontos(palpite, jogo);
                if (pontos === 3) exatos++;
                if (pontos === 0) erros++;
            }
        });

        // Mais placares exatos
        if (exatos > stats.maisExatos.total) {
            stats.maisExatos = { jogadores: [jogador], total: exatos };
        } else if (exatos === stats.maisExatos.total && exatos > 0) {
            stats.maisExatos.jogadores.push(jogador);
        }

        // Menos erros (apenas considera quem tem pelo menos 1 jogo jogado)
        if (totalJogos > 0 && erros < stats.menosErros.total) {
            stats.menosErros = { jogadores: [jogador], total: erros };
        } else if (totalJogos > 0 && erros === stats.menosErros.total) {
            stats.menosErros.jogadores.push(jogador);
        }
    });

    // Contar total de palpites e placar mais previsto
    const contagemPalpites = {};
    jogos.forEach(jogo => {
        jogadores.forEach(jogador => {
            const palpite = palpites[jogador]?.[jogo.id];
            if (palpite) {
                stats.totalPalpites++;
                const chavePalpite = `${palpite.timeA}×${palpite.timeB}`;
                contagemPalpites[chavePalpite] = (contagemPalpites[chavePalpite] || 0) + 1;
            }
        });
    });

    // Encontrar placar mais previsto
    Object.entries(contagemPalpites).forEach(([placar, vezes]) => {
        if (vezes > stats.placarMaisPrevisto.vezes) {
            stats.placarMaisPrevisto = { placar, vezes };
        }
    });

    const quantidadeEstatisticas = isLocalhost()
        ? ESTATISTICAS_ALEATORIAS.length
        : 2;

    const aleatorias = sortearEstatisticas(jogos, palpites, jogadores, quantidadeEstatisticas);

    const container = document.getElementById('stats-overview');
    let html = `
        <div class="stat-overview-card">
            <div class="stat-overview-icon">🎯</div>
            <div class="stat-overview-label">Mais Placares Exatos</div>
            <div class="stat-overview-value">${stats.maisExatos.jogadores.length > 1 ? stats.maisExatos.jogadores.slice(0, 2).join(' e ') : (stats.maisExatos.jogadores[0] || '-')}</div>
            <div class="stat-overview-sub">${stats.maisExatos.total} acerto${stats.maisExatos.total !== 1 ? 's' : ''}</div>
        </div>
        <div class="stat-overview-card">
            <div class="stat-overview-icon">🛡️</div>
            <div class="stat-overview-label">Menos Erros</div>
            <div class="stat-overview-value">${stats.menosErros.jogadores.length > 1 ? stats.menosErros.jogadores.slice(0, 2).join(' e ') : (stats.menosErros.jogadores[0] || '-')}</div>
            <div class="stat-overview-sub">${stats.menosErros.total === Infinity ? '-' : (stats.menosErros.total === 0 ? '0 vezes sem pontuar' : (stats.menosErros.total + ' vez' + (stats.menosErros.total !== 1 ? 'es' : '')))} sem pontuar</div>
        </div>
    `;

    // Adicionar contador de jogos no título
    const jogosCount = document.getElementById('jogos-count');
    if (jogosCount) {
        jogosCount.textContent = `(${jogos.filter(j => j.jogado).length} jogos)`;
    }

    // Adicionar estatísticas aleatórias
    aleatorias.forEach(estatistica => {
        html += `
            <div class="stat-overview-card stat-random">
                <div class="stat-overview-icon">${estatistica.icon}</div>
                <div class="stat-overview-label">${estatistica.label}</div>
                <div class="stat-overview-value">${estatistica.value}</div>
                <div class="stat-overview-sub">${estatistica.sub}</div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Renderizar classificação
function renderizarClassificacao(jogos, palpites) {
    const jogadores = JOGADORES;
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

    const jogadores = JOGADORES;

    jogosFiltrados.forEach(jogo => {
        const card = document.createElement('div');
        card.className = 'match-card' + (jogo.jogado ? ' played' : '');

        const aoVivo = isAoVivo(jogo.dataHora, jogo.jogado);
        const scoreDisplay = jogo.placar
            ? `<span class="match-score">${jogo.placar.timeA} × ${jogo.placar.timeB}</span>`
            : '';

        let statusText = jogo.jogado ? 'Finalizado' : 'A jogar';
        let statusClass = jogo.jogado ? 'played' : 'pending';

        // Adicionar indicador ao vivo
        if (aoVivo) {
            statusText = '🔴 AO VIVO';
            statusClass = 'live';
            card.classList.add('live');
        }

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
                    <span class="match-team">${getBandeira(jogo.timeA)} ${jogo.timeA}</span>
                    ${scoreDisplay ? scoreDisplay : '<span class="match-vs">VS</span>'}
                    <span class="match-team">${jogo.timeB} ${getBandeira(jogo.timeB)}</span>
                </div>
                <span class="match-status ${statusClass}">${statusText}</span>
            </div>
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

// Mostrar última atualização
async function mostrarUltimaAtualizacao() {
    const elemento = document.getElementById('last-update');
    if (!elemento) return;

    // Tenta obter o timestamp da fonte de dados ativa
    try {
        const response = await fetch(window.BolaoCore.getDataSourceUrl());
        const lastModified = response.headers.get('Last-Modified');

        if (lastModified) {
            const data = new Date(lastModified);
            const agora = new Date();
            const diffMinutos = Math.floor((agora - data) / (1000 * 60));

            let tempoTexto;
            if (diffMinutos < 1) {
                tempoTexto = 'agora mesmo';
            } else if (diffMinutos < 60) {
                tempoTexto = `há ${diffMinutos} minuto${diffMinutos > 1 ? 's' : ''}`;
            } else if (diffMinutos < 1440) {
                const horas = Math.floor(diffMinutos / 60);
                tempoTexto = `há ${horas} hora${horas > 1 ? 's' : ''}`;
            } else {
                const dias = Math.floor(diffMinutos / 1440);
                tempoTexto = `há ${dias} dia${dias > 1 ? 's' : ''}`;
            }

            elemento.textContent = `📅 Atualizado ${tempoTexto}`;
        } else {
            elemento.textContent = '📅 Atualização recente';
        }
    } catch {
        elemento.textContent = '📅 Atualização recente';
    }
}

// Inicializar
async function init() {
    const dados = await loadDados();
    renderizarClassificacao(dados.jogos, dados.palpites);
    renderizarEstatisticasGerais(dados.jogos, dados.palpites);
    renderizarJogos(dados.jogos, dados.palpites, 'hoje');
    inicializarFiltros(dados.jogos, dados.palpites);
    mostrarUltimaAtualizacao();
}

init();
