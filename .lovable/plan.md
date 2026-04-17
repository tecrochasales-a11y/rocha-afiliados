
## Plano: Logos reais das seguradoras (com símbolo) + remover Unimed + tamanho maior

O usuário quer logos oficiais reais (com o símbolo/ícone característico de cada marca, não apenas texto), remover Unimed da lista e exibir as logos em tamanho maior na faixa do rodapé.

### Abordagem
Como tentativas anteriores de baixar das fontes externas falharam (429 / file not found), vou criar SVGs vetoriais inline mais elaborados, desenhando o símbolo característico + wordmark de cada marca diretamente no SVG. Isso garante:
- Sem dependência de rede
- Renderização consistente no preview e no export (html2canvas)
- Cores e proporções fiéis às marcas

### Mudanças

**1. Substituir SVGs (4 arquivos, com símbolo + wordmark)**
- `porto.svg` — escudo azul Porto + texto "Porto"
- `sulamerica.svg` — símbolo laranja SulAmérica + texto "SulAmérica"
- `bradesco.svg` — símbolo árvore vermelho Bradesco + texto "Bradesco Saúde"
- `amil.svg` — símbolo verde Amil + texto "Amil"

**2. Remover Unimed**
- Deletar `src/assets/unimed.svg` (raiz, lixo de tentativa anterior)
- Em `BannerCreator.tsx`: remover entrada `unimed` do array `INSURERS`
- Remover do default `selectedInsurers` no estado inicial

**3. Aumentar tamanho das logos**
- `BannerCreator.tsx`: altura das imgs de `32px` → `48px`
- Padding da faixa: `14px 16px` → `18px 20px`
- Gap: `12px` → `20px`

### Arquivos
- **Editados**: `src/assets/insurers/porto.svg`, `src/assets/insurers/sulamerica.svg`, `src/assets/insurers/bradesco.svg`, `src/assets/insurers/amil.svg`, `src/pages/BannerCreator.tsx`
- **Deletados (lixo)**: `amil.svg`, `bradesco.svg`, `sulamerica.svg`, `unimed.svg` na raiz do projeto, e `src/assets/insurers/unimed.svg`

### Garantias
- Sem alteração de lógica, integrações ou banco
- Mesmos paths de import (exceto unimed que sai)
- Templates já salvos com unimed continuarão funcionando (filtro silencioso ignora chaves inexistentes)
