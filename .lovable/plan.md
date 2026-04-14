

## Plano: Adicionar logo PNG ao Header

### O que será feito
1. **Copiar a logo PNG** (`IMG_9693.PNG`) para `src/assets/rocha-sales-logo.png`
2. **Atualizar `Header.tsx`**: Usar a logo PNG como fallback local (quando não houver logo dinâmica do banco). Importar a imagem como módulo ES6 e exibi-la no lugar do ícone Shield.
3. **Remover o texto "Rocha Sales / SEGUROS"** ao lado da logo, já que a própria imagem PNG já contém o nome da marca — resultado mais limpo e profissional, como empresa grande.

### Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `src/assets/rocha-sales-logo.png` | Novo arquivo (cópia da logo enviada) |
| `src/components/layout/Header.tsx` | Importar logo local, usar como fallback no lugar do Shield. Remover texto duplicado "Rocha Sales / SEGUROS" para visual mais limpo. |

### O que NÃO muda
- Lógica de busca dinâmica da logo no banco (site_assets) permanece
- Navegação, scroll, menu mobile — tudo intacto
- Nenhuma integração ou função alterada

