
Ajustes:

1. **Cores dos inputs no modo escuro** (`src/pages/Perfil.tsx`): trocar `bg-muted/50` e `bg-muted/30` por `bg-background` (ou `bg-card`) com borda visível, garantindo contraste no dark mode. Mesma mudança no card "Código de Indicação".

2. **Logo do escudo → Logo Rocha Sales** (`src/pages/Perfil.tsx`): substituir o ícone `Shield` dentro do `div.bg-gradient-hero` pela imagem `src/assets/rocha-sales-logo.png` (já existente no projeto). Remover o gradiente de fundo (logo já tem identidade visual própria) e ajustar tamanho para ~80x80px.

Arquivo alterado: `src/pages/Perfil.tsx` apenas.
