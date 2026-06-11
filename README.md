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

Edite o JSON dentro do `index.html` (procure pela tag `<script id="dados">`):

```json
{
  "jogos": [
    {
      "id": 1,
      "timeA": "Brasil",
      "timeB": "Argentina",
      "placar": { "timeA": 2, "timeB": 1 },
      "jogado": true
    }
  ],
  "palpites": {
    "Alan": {
      "1": { "timeA": 2, "timeB": 1 }
    }
  }
}
```

## Hospedagem

Este site está hospedado no GitHub Pages.
