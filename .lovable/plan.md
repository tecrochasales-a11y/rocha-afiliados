

## Plano: Footer cinza neutro + logo transparente

### 1. Corrigir tom de cinza (remover subtom azulado)

O `gray` padrão do Tailwind tem um leve subtom azulado. Para um cinza neutro puro, trocar para `neutral` em todo o footer:

- `bg-gray-800` → `bg-neutral-800`
- `text-gray-100` → `text-neutral-100`
- `bg-gray-600` → `bg-neutral-600`
- `bg-gray-700` → `bg-neutral-700`
- `text-gray-300` → `text-neutral-300`
- `text-gray-400` → `text-neutral-400`
- `text-gray-500` → `text-neutral-500`
- `border-gray-700` → `border-neutral-700`
- Hover states: `bg-gray-600` → `bg-neutral-600`

### 2. Usar logo local com fundo transparente

- Importar `src/assets/rocha-sales-logo.png` no footer (mesmo arquivo usado no Header e Dashboard)
- Substituir a busca do banco de dados (`site_assets`) pela logo local
- Remover o `useEffect` de fetch da logo
- A imagem PNG já possui fundo transparente

### Arquivo alterado
- `src/components/layout/Footer.tsx`

