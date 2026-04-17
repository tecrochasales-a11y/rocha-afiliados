
Ajustes em `src/pages/Perfil.tsx`:

1. **Card branco → adaptado ao dark mode**: o card externo usa `bg-card` que está renderizando branco. Trocar para classe que respeite o tema (provavelmente já é `bg-card` mas com glass-card forçando claro). Vou usar `bg-card dark:bg-card` garantindo contraste, e ajustar texto para `text-foreground`.

2. **Email field cinza ilegível**: trocar `bg-muted` (que fica cinza escuro no dark) por `bg-background` com `text-muted-foreground` legível.

3. **Botão "Copiar Código"** ao lado do código de indicação (V5G8KD85): ícone Copy + toast de confirmação ao clicar, usando `navigator.clipboard.writeText(profile.tracking_code)`.

Arquivo alterado: `src/pages/Perfil.tsx` apenas.
