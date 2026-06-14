(function () {
    const VERSION = window.APP_VERSION || '1';
    const FONTES_DADOS = ['dados.csv', 'dados.json'];

    const JOGADORES = ['Alan', 'Fernanda', 'Jorge', 'Lia', 'Raquel', 'Sueli'];

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
        'Escócia': '🏴',
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
        'Inglaterra': '🏴',
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

    let dadosCache = null;
    let fonteAtual = null;

    function buildVersionedUrl(path) {
        return `${path}?v=${VERSION}`;
    }

    function getBandeira(pais) {
        return BANDEIRAS[pais] || '⚽';
    }

    function parseCsvLine(line) {
        const columns = [];
        let current = '';
        let insideQuotes = false;

        for (let index = 0; index < line.length; index++) {
            const char = line[index];
            const nextChar = line[index + 1];

            if (char === '"') {
                if (insideQuotes && nextChar === '"') {
                    current += '"';
                    index++;
                } else {
                    insideQuotes = !insideQuotes;
                }
                continue;
            }

            if (char === ',' && !insideQuotes) {
                columns.push(current);
                current = '';
                continue;
            }

            current += char;
        }

        columns.push(current);
        return columns.map((value) => value.trim());
    }

    function normalizarPlacar(value) {
        if (!value && value !== 0) {
            return null;
        }

        if (typeof value === 'object') {
            const timeA = Number(value.timeA);
            const timeB = Number(value.timeB);
            if (Number.isFinite(timeA) && Number.isFinite(timeB)) {
                return { timeA, timeB };
            }
            return null;
        }

        const texto = String(value).trim();
        if (!texto) {
            return null;
        }

        const match = texto.match(/^(\d+)\s*[-xX×:]\s*(\d+)$/);
        if (!match) {
            return null;
        }

        return {
            timeA: Number(match[1]),
            timeB: Number(match[2]),
        };
    }

    function calcularPontos(palpite, jogo) {
        if (!palpite || !jogo.jogado || !jogo.placar) {
            return null;
        }

        const { timeA: palpiteA, timeB: palpiteB } = palpite;
        const { timeA: realA, timeB: realB } = jogo.placar;

        if (palpiteA === realA && palpiteB === realB) {
            return 3;
        }

        const resultadoReal = realA > realB ? 'A' : (realB > realA ? 'B' : 'empate');
        const resultadoPalpite = palpiteA > palpiteB ? 'A' : (palpiteB > palpiteA ? 'B' : 'empate');

        if (resultadoReal === resultadoPalpite) {
            return 1;
        }

        return 0;
    }

    function normalizarDados(dadosBrutos) {
        const jogos = Array.isArray(dadosBrutos?.jogos) ? dadosBrutos.jogos : [];
        const palpites = dadosBrutos?.palpites && typeof dadosBrutos.palpites === 'object'
            ? dadosBrutos.palpites
            : {};

        return {
            jogos: jogos.map((jogo, index) => {
                const placar = normalizarPlacar(jogo.placar);
                const jogado = typeof jogo.jogado === 'boolean' ? jogo.jogado : Boolean(placar);

                return {
                    id: Number.isFinite(Number(jogo.id)) ? Number(jogo.id) : index + 1,
                    dataHora: jogo.dataHora,
                    timeA: jogo.timeA,
                    timeB: jogo.timeB,
                    placar,
                    jogado,
                };
            }),
            palpites: Object.fromEntries(
                Object.entries(palpites).map(([jogador, palpitesJogador]) => [
                    jogador,
                    Object.fromEntries(
                        Object.entries(palpitesJogador || {})
                            .map(([jogoId, palpite]) => [jogoId, normalizarPlacar(palpite)])
                            .filter(([, palpite]) => palpite)
                    ),
                ])
            ),
        };
    }

    function csvParaDados(csvText) {
        const lines = csvText
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith('#'));

        if (lines.length < 2) {
            throw new Error('dados.csv sem linhas suficientes');
        }

        const headers = parseCsvLine(lines[0]);
        const fixedColumns = ['id', 'dataHora', 'timeA', 'timeB', 'placar'];
        const playerColumns = headers.filter((header) => !fixedColumns.includes(header));
        const palpites = {};
        const jogos = [];

        playerColumns.forEach((jogador) => {
            palpites[jogador] = {};
        });

        lines.slice(1).forEach((line, lineIndex) => {
            const values = parseCsvLine(line);
            const row = Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
            const placar = normalizarPlacar(row.placar);
            const jogoId = Number(row.id);

            if (!Number.isFinite(jogoId) || !row.dataHora || !row.timeA || !row.timeB) {
                throw new Error(`Linha inválida no CSV: ${lineIndex + 2}`);
            }

            jogos.push({
                id: jogoId,
                dataHora: row.dataHora,
                timeA: row.timeA,
                timeB: row.timeB,
                placar,
                jogado: Boolean(placar),
            });

            playerColumns.forEach((jogador) => {
                const palpite = normalizarPlacar(row[jogador]);
                if (palpite) {
                    palpites[jogador][String(jogoId)] = palpite;
                }
            });
        });

        return { jogos, palpites };
    }

    function getDadosExemplo() {
        return {
            jogos: [
                {
                    id: 1,
                    dataHora: new Date().toISOString(),
                    timeA: 'Brasil',
                    timeB: 'Argentina',
                    placar: null,
                    jogado: false
                }
            ],
            palpites: {
                Alan: { 1: { timeA: 2, timeB: 1 } },
                Fernanda: { 1: { timeA: 1, timeB: 1 } },
                Jorge: { 1: { timeA: 3, timeB: 0 } },
                Lia: { 1: { timeA: 2, timeB: 1 } },
                Raquel: { 1: { timeA: 2, timeB: 0 } },
                Sueli: { 1: { timeA: 1, timeB: 2 } }
            }
        };
    }

    async function loadDados() {
        if (dadosCache) {
            return dadosCache;
        }

        for (const fonte of FONTES_DADOS) {
            try {
                const response = await fetch(buildVersionedUrl(fonte));
                if (!response.ok) {
                    continue;
                }

                const dadosBrutos = fonte.endsWith('.csv')
                    ? csvParaDados(await response.text())
                    : normalizarDados(await response.json());

                dadosCache = dadosBrutos;
                fonteAtual = fonte;
                return dadosCache;
            } catch (error) {
                console.warn(`Erro ao carregar ${fonte}:`, error);
            }
        }

        fonteAtual = null;
        dadosCache = getDadosExemplo();
        return dadosCache;
    }

    function getDataSourceUrl() {
        return buildVersionedUrl(fonteAtual || FONTES_DADOS[0]);
    }

    window.BolaoCore = {
        BANDEIRAS,
        JOGADORES,
        calcularPontos,
        csvParaDados,
        getBandeira,
        getDataSourceUrl,
        loadDados,
        normalizarDados,
        normalizarPlacar,
    };
}());
