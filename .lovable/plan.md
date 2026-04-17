
## Plano: Logos originais das seguradoras no rodapé

Substituir os SVGs placeholder atuais (retângulos coloridos com texto Arial) pelas logos oficiais reais das seguradoras, mantendo a fonte e identidade visual originais de cada marca.

### Abordagem
Baixar as logos oficiais (formato SVG quando possível, PNG transparente como fallback) das 5 seguradoras já listadas no Banner Creator:
- Porto Seguro
- SulAmérica
- Bradesco Saúde
- Amil
- Unimed

Fontes: sites oficiais ou Wikimedia Commons (logos de uso público).

### Arquivos
- **Substituídos** (mesmos paths, mantendo compatibilidade total com `BannerCreator.tsx`):
  - `src/assets/insurers/porto.svg` → logo oficial Porto Seguro
  - `src/assets/insurers/sulamerica.svg` → logo oficial SulAmérica
  - `src/assets/insurers/bradesco.svg` → logo oficial Bradesco Saúde
  - `src/assets/insurers/amil.svg` → logo oficial Amil
  - `src/assets/insurers/unimed.svg` → logo oficial Unimed

### Ajustes no rodapé (`BannerCreator.tsx`)
- A faixa do rodapé permanecerá branca/clara para destacar as logos coloridas
- Aumentar levemente a altura das logos (de ~24px para ~32px) para melhor legibilidade
- Manter espaçamento e centralização atuais
- `object-contain` para preservar proporções originais

### Garantias
- Nenhuma alteração de lógica
- Mesmos imports, mesmos paths
- Banco de dados intacto
- Apenas troca dos arquivos SVG e ajuste mínimo de altura no preview
