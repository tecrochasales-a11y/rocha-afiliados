

## Plano: Alterar rodapé para tom cinza

### Alteração — `src/components/layout/Footer.tsx`

Trocar as classes de cor do footer de `bg-primary text-primary-foreground` para tons de cinza escuro, mantendo a legibilidade:

- **Tag `<footer>`**: `bg-primary` → `bg-gray-800` e `text-primary-foreground` → `text-gray-100`
- **Decoração de fundo**: trocar `bg-secondary` e `bg-accent` por `bg-gray-600`
- **Textos secundários**: trocar `text-primary-foreground/80` → `text-gray-300`, `text-primary-foreground/70` → `text-gray-400`, `text-primary-foreground/60` → `text-gray-500`
- **Ícones de contato**: manter `text-secondary` (dourado) nos ícones de telefone/email/localização para contraste
- **Redes sociais**: `bg-primary-foreground/10` → `bg-gray-700`, hover `bg-primary-foreground/20` → `bg-gray-600`
- **Divider**: `border-primary-foreground/15` → `border-gray-700`
- **Logo fallback**: `bg-primary-foreground/20` → `bg-gray-700`
- **Headings**: `text-primary-foreground` → `text-gray-100`

O rodapé ficará com fundo cinza escuro consistente com o tema, sem o tom dourado.

