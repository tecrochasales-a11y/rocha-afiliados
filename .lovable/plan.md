

## Plano: Header transparente com degradê e ajustes visuais

### Mudanças no `src/components/layout/Header.tsx`

1. **Header transparente**: Remover `bg-card/95` e `bg-card/98`. Usar fundo totalmente transparente (sem `border-b` nem `shadow`). Ao scrollar, aplicar um fundo semi-transparente escuro com blur.

2. **Degradê escuro no topo**: Adicionar um `::before` pseudo-elemento (via classe Tailwind `before:`) no header com gradiente de preto/escuro para transparente, criando contraste sutil no topo da página.

3. **Logo maior**: Aumentar de `h-10 md:h-12` para `h-14 md:h-16` (e scrollado de `h-8 md:h-10` para `h-10 md:h-12`).

4. **Textos de navegação brancos**: Trocar `text-muted-foreground` por `text-white` nos 3 botões de navegação desktop. Hover também branco com opacidade.

5. **Botão "Entrar" branco**: Ajustar para `text-white` também.

6. **Menu mobile**: Manter fundo sólido escuro para legibilidade.

### Arquivo alterado
| Arquivo | Mudança |
|---------|---------|
| `src/components/layout/Header.tsx` | Fundo transparente, degradê superior, logo maior, textos brancos |

