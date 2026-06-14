# ⚽ Bolão Copa 2026

Bolão simples com HTML estático para acompanhar a Copa!

## Jogadores

- Alan
- Fernanda
- Jorge
- Raquel

## Pontuação

- **3 pontos** - Acertou o placar exato
- **1 ponto** - Acertou o vencedor (ou empate)

## Como atualizar os dados

Edite o arquivo `dados.csv`. Cada linha representa um jogo, o `placar` real fica em uma coluna e cada jogador tem a sua coluna de palpite.

Exemplo:

```csv
id,dataHora,timeA,timeB,placar,Alan,Fernanda,Jorge,Lia,Raquel,Sueli
1,2026-06-11T16:00:00,Brasil,Argentina,2-1,2-1,1-1,3-0,2-0,2-1,1-2
2,2026-06-11T20:00:00,França,México,,1-0,2-0,1-1,2-1,0-0,1-2
```

Regras práticas:

- `placar` vazio significa que o jogo ainda não aconteceu.
- Os palpites usam o formato `2-1`.
- Dá para editar isso direto no GitHub com bem menos risco de quebrar chaves e vírgulas.
- `dados.json` continua existindo só como fallback de compatibilidade.

## Hospedagem

Este site está hospedado no GitHub Pages.
