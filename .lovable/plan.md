

## Plano: Corrigir logo — priorizar arquivo local

### Problema
O `Header.tsx` busca a logo na tabela `site_assets` do banco. Se encontra uma logo ativa, usa essa URL (`logoUrl`) em vez do arquivo local. A logo antiga (com fundo preto/quadrado) está salva no banco e está sobrescrevendo a nova.

### Solução — 2 opções (faremos ambas para garantir)

1. **`src/components/layout/Header.tsx`**: Remover a lógica de `fetchLogo` e o estado `logoUrl`. Usar apenas o `localLogo` importado do arquivo local. Isso garante que a logo correta sempre apareça.

2. **Banco de dados**: Desativar ou remover a logo antiga da tabela `site_assets` (setar `is_active = false`), para que mesmo se no futuro voltarmos a usar logos dinâmicas, a antiga não apareça.

### Alteração principal — Header.tsx
- Remover `useState` de `logoUrl`
- Remover `useEffect` + `fetchLogo`
- Trocar `src={logoUrl || localLogo}` por `src={localLogo}`

### O que NÃO muda
- Layout, navegação, menu mobile — tudo intacto
- O arquivo `rocha-sales-logo.png` já é a imagem correta

