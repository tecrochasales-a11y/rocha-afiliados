
## Plano: Melhorar o color picker da seção Tipografia & Cores

O usuário está usando os `<input type="color">` nativos (mostrado no print) e quer uma experiência mais polida. Vou substituir pelo componente `react-colorful` (popover customizado) com swatches de cores da marca + hex input + preview.

### Implementação

Em `src/pages/BannerCreator.tsx`, criar componente `ColorPickerField`:

- **Trigger**: botão pequeno mostrando swatch da cor atual + label hex (ex: `■ #C9A84C`), com `transition-all hover:scale-105 hover:shadow-md`
- **Popover** (Radix `Popover` já existe no projeto): abre com animação `scale-in`/`fade-in` (já configuradas no tailwind)
  - `HexColorPicker` do `react-colorful` (área visual hue/saturation)
  - Input de texto para hex manual (com validação)
  - 6 swatches da paleta da marca: `#C9A84C` (dourado), `#FFFFFF`, `#181818`, `#0A2540` (azul Porto), `#E30613` (vermelho Bradesco), `#FF6B00` (laranja SulAmérica) — clique aplica imediatamente
  - Cada swatch com `hover:scale-110 transition-transform ring-2 ring-transparent hover:ring-primary`

### Dependência
- Instalar `react-colorful` (leve, ~2.8KB, sem deps)

### Substituições
Trocar os 4 `<input type="color">` (badge, title, subtitle, footerLabel) pelo novo `ColorPickerField`. Mesma API: `value` + `onChange(hex)`.

### Bônus de UX
- Botão "Restaurar padrão" ganha ícone `RotateCcw` + animação de rotação no hover
- Card da seção "Tipografia & Cores" com `animate-fade-in` ao montar

### Arquivos
- **Editado**: `src/pages/BannerCreator.tsx` (novo componente interno + 4 substituições)
- **Dependência nova**: `react-colorful`

### Garantias
- Mesmo state e mesma persistência — apenas a UI do picker muda
- Sem mudanças em DB, lógica de export ou outras seções
