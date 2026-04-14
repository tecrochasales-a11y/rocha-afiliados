

## Plano: Layout limpo com animações em destaque

### Problema atual
A área de preview (animação) divide espaço com texto extenso (descrição, como usar, dicas, observação), resultando em um preview pequeno e layout denso.

### Solução
Reorganizar o layout para que a **animação ocupe a maior parte da área visual**, com as informações textuais em um painel colapsável/compacto abaixo ou ao lado.

### Mudanças

**`TutorialExplorer.tsx`** — Reescrever o layout:
- Área de preview ocupa **~60-70% da altura** disponível, com padding generoso e fundo sutil
- Título + badge ficam em uma barra compacta acima do preview (inline, sem ocupar muito espaço vertical)
- Informações textuais (descrição, como usar, dicas, observação) ficam em um **accordion compacto** abaixo do preview, colapsado por padrão — o usuário expande se quiser ler
- Menu lateral fica mais estreito (220px ao invés de 280px) e com visual mais minimalista
- Preview area com `min-h-[350px]` e cantos arredondados mais pronunciados, fundo com gradiente sutil

**`HelpCenter.tsx`** — Ajuste menor:
- Remover a contagem "X tópicos encontrados" (ruído visual)
- Filtros de categoria com visual mais discreto

### Resultado visual esperado
```text
┌─────────────────────────────────────────────────┐
│  ← Central de Ajuda                    [⬜][⬛] │
│  [🔍 Buscar...]                                 │
│  [Todos] [Dashboard] [Financeiro] ...            │
├──────────┬──────────────────────────────────────┤
│ Sidebar  │  Cards de métricas      [Dashboard]  │
│ --------│                                       │
│ ● Métricas│  ┌─────────────────────────────────┐ │
│   Link    │  │                                 │ │
│   Leads   │  │    ANIMAÇÃO GRANDE              │ │
│   Comissões│  │    (preview com espaço)         │ │
│   Saque   │  │                                 │ │
│   ...     │  └─────────────────────────────────┘ │
│           │                                      │
│           │  ▸ Descrição                         │
│           │  ▸ Como usar                         │
│           │  ▸ Dicas                             │
└──────────┴──────────────────────────────────────┘
```

### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `TutorialExplorer.tsx` | Reescrever layout: preview grande, texto em accordion compacto |
| `HelpCenter.tsx` | Remover contagem de tópicos, visual mais limpo |

### Técnica
- Usa o componente `Accordion` do shadcn/ui já instalado
- Sidebar mais compacta (220px)
- Preview com `min-h-[350px]` e fundo gradiente
- Zero dependências novas

