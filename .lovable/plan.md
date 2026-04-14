

## Plano: Usar logo local no Dashboard

### Problema
O `Dashboard.tsx` ainda busca a logo do banco de dados (`site_assets`), que retorna a imagem antiga com fundo preto. O mesmo problema que já foi corrigido no `Header.tsx`.

### Alterações — `src/pages/Dashboard.tsx`

1. **Adicionar import** do logo local: `import localLogo from "@/assets/rocha-sales-logo.png";`
2. **Remover** o estado `logoUrl` e a lógica de fetch da logo do banco (linhas ~75, ~102-111)
3. **Substituir** o bloco condicional `{logoUrl ? <img .../> : <div .../>}` por `<img src={localLogo} alt="Rocha Sales Seguros" className="h-10 w-auto object-contain" />`

### O que NÃO muda
- Texto "Rocha Sales", navegação, menu, dados do dashboard — tudo intacto

