
## Plano: Baixar logos oficiais reais das seguradoras

Substituir os SVGs desenhados manualmente pelas logos oficiais reais (PNG transparente) das seguradoras, no estilo do exemplo Bradesco enviado (símbolo + wordmark com tipografia original da marca).

### Abordagem
Buscar e baixar as logos oficiais via Google/fontes confiáveis (Wikimedia, sites oficiais, repositórios de logos como seeklogo/brandsoftheworld) em formato PNG transparente de alta resolução. Salvar em `src/assets/insurers/` substituindo os SVGs atuais.

### Passos de execução
1. **websearch--web_search** para localizar URLs diretas das logos oficiais:
   - Bradesco Saúde
   - Porto Seguro
   - SulAmérica
   - Amil
2. **code--fetch_website** ou download direto para baixar cada PNG transparente
3. **Salvar** como `src/assets/insurers/{nome}.png` (substituindo .svg atuais)
4. **Atualizar `BannerCreator.tsx`**: trocar imports de `.svg` para `.png` no array `INSURERS`
5. **Manter** altura 48px, padding e gap atuais — fundo branco da faixa já destaca bem
6. **Fallback**: se algum download falhar, mantém o SVG atual daquela marca específica

### Arquivos
- **Novos/Substituídos**: `src/assets/insurers/bradesco.png`, `porto.png`, `sulamerica.png`, `amil.png`
- **Editado**: `src/pages/BannerCreator.tsx` (apenas linhas dos imports)
- **Removidos** (se downloads OK): `src/assets/insurers/*.svg` antigos

### Garantias
- Apenas troca visual de assets — nenhuma lógica alterada
- Mesma estrutura de array, mesmas keys
- Templates salvos no banco continuam funcionando
- Sem mudanças em DB, RLS, integrações ou outros componentes
