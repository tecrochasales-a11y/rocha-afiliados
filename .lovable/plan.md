

## Plano: Toggle de Modo Claro/Escuro no Dashboard

### Contexto
O projeto já tem variáveis CSS para modo escuro (`.dark` no `index.css`) e Tailwind configurado com `darkMode: ["class"]`. Falta apenas o mecanismo de toggle e o botão na UI.

### Alterações

**1. Criar hook `src/hooks/useTheme.tsx`**
- Hook que lê/grava a preferência no `localStorage` (chave `theme`)
- Adiciona/remove a classe `dark` no `<html>`
- Respeita preferência do sistema como fallback inicial

**2. `src/pages/Dashboard.tsx`**
- Importar o hook `useTheme` e ícones `Sun`/`Moon` do Lucide
- Adicionar um botão de toggle (ícone sol/lua) no header, ao lado do sino de notificações
- Também adicionar no menu mobile

**3. `src/components/layout/Header.tsx`** (landing page)
- Adicionar o mesmo toggle para consistência no site público (opcional, mas recomendado)

### Layout do botão
```text
[Logo] [Rocha Sales]          [🔔] [🌙/☀️] [Avatar ▾]
```

Botão circular discreto com ícone Moon (modo claro) ou Sun (modo escuro).

### O que NÃO muda
- Variáveis CSS — já existem para ambos os modos
- Layout, lógica de dados, componentes — intactos

