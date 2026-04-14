

## Plano: Simplificar seção do link de indicação

### Objetivo
Tornar a seção do link mais clean e sutil — esconder o link por padrão, mostrar apenas dois botões compactos, e revelar o link/QR Code sob demanda.

### Alteração — `src/pages/Dashboard.tsx` (linhas 387-415)

**Antes**: Card grande com gradiente, link visível, botão "Copiar Link" e botão "Ver QR Code" lado a lado.

**Depois**: Card compacto com fundo `bg-card` (sem gradiente chamativo):
- Linha com título "Seu Link de Indicação" + dois botões à direita:
  - **Copiar Link** (ícone + texto) — copia direto ao clicar, sem mostrar a URL
  - **Visualizar Link** (texto discreto/ghost) — toggle que expande e revela a URL + botão QR Code abaixo
- Adicionar estado `const [showLink, setShowLink] = useState(false)`
- Quando `showLink` é true, exibe a URL truncada e o botão de QR Code numa linha abaixo

### Layout visual (aproximado)
```text
┌─────────────────────────────────────────────────────────┐
│  Seu Link de Indicação          [Copiar Link] [Ver Link]│
│                                                         │
│  (se expandido:)                                        │
│  https://...ref/V5G8KD85              [Ver QR Code]     │
└─────────────────────────────────────────────────────────┘
```

### O que NÃO muda
- Lógica de geração do link, QRCodeGenerator, função de copiar — tudo intacto
- Stats, tabelas, resto do dashboard — inalterado

