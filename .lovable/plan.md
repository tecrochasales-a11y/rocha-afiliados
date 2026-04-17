
## Plano: Personalização de cor e fonte dos textos do banner

Adicionar controles para o usuário customizar **cor do texto** e **família da fonte** dos textos do banner (badge "Consultoria 100% gratuita", título "Proteja quem você ama", subtítulo, label do CTA e label "TRABALHAMOS COM AS MELHORES OPERADORAS"), mantendo o estilo atual como padrão.

### Controles novos no painel de edição (BannerCreator.tsx)

Adicionar nova seção "Tipografia & Cores" com:

1. **Família da fonte** (Select) — aplica a todos os textos:
   - Playfair Display (padrão atual — títulos)
   - Inter
   - Poppins
   - Montserrat
   - Roboto
   - Lora
   - Merriweather

2. **Cor por texto** (4 color pickers `<input type="color">`):
   - Cor do badge (padrão: dourado `#C9A84C`)
   - Cor do título (padrão: branco `#FFFFFF`)
   - Cor do subtítulo (padrão: branco translúcido — usar `#FFFFFF` com opacity)
   - Cor do label do rodapé "TRABALHAMOS COM..." (padrão: dourado/azul atual)

3. **Botão "Restaurar padrão"** — reseta as 4 cores e fonte para os valores atuais.

### Implementação

- Adicionar estados: `fontFamily`, `badgeColor`, `titleColor`, `subtitleColor`, `footerLabelColor`
- Aplicar `style={{ fontFamily, color: ... }}` em cada elemento de texto correspondente no preview
- Carregar as fontes via Google Fonts no `index.html` (link `<link>` com as 6 famílias adicionais) — Playfair, Inter e Poppins já estão no projeto
- Persistir nos templates salvos: incluir os 5 novos campos no objeto template (banco/localStorage onde já salva)
- Garantir que o export (html2canvas) capture as fontes — pré-carregar via `document.fonts.ready` antes do snapshot

### Arquivos
- **Editado**: `src/pages/BannerCreator.tsx` (estados + UI de controles + style nos textos do preview + persistência template)
- **Editado**: `index.html` (link Google Fonts para Montserrat, Roboto, Lora, Merriweather)

### Garantias
- Padrões mantidos = visual idêntico ao atual se usuário não alterar nada
- Sem mudanças em DB schema (campos extras vão dentro do JSON do template já existente)
- Sem alteração nas logos das seguradoras nem no QR Code
