
## Plano: Aprimoramento do Criador de Banner

Evoluir `src/pages/BannerCreator.tsx` adicionando recursos profissionais. **Nenhum outro arquivo será tocado** — exceto criação de uma nova tabela isolada para padrões salvos.

### Novos recursos no editor

**1. Logo personalizada**
- Botão de upload (input file local, sem storage — converte para base64 via FileReader)
- Slider de tamanho (40-120px)
- Posição: topo do banner (acima do título), centralizada/esquerda conforme alinhamento

**2. Imagem de fundo**
- Upload local (FileReader → base64) com preview imediato
- Modos: "Sem fundo" (cor sólida) | "Com imagem" (cover + overlay escuro ajustável para legibilidade)
- Slider de opacidade do overlay (0-80%)

**3. Cores customizadas**
- Color pickers nativos (`<input type="color">`) para: cor primária, cor de destaque, cor do texto
- Substituem (quando ativos) os esquemas pré-definidos
- Toggle "Usar paleta personalizada" vs "Usar esquema"

**4. Padrões salvos (templates)**
- Nova tabela `banner_templates` (RLS: usuário só vê os próprios)
  - `id, user_id, name, config (jsonb), created_at`
- Botão "Salvar padrão atual" → grava todo o estado JSON
- Lista de padrões salvos com botões "Aplicar" e "Excluir"
- RLS: `user_id = auth.uid()` em SELECT/INSERT/DELETE

**5. Faixa de rodapé com seguradoras**
- Substitui o `FooterImage` atual
- Faixa branca/clara fixa na base com logos das seguradoras
- Logos pré-cadastradas (Porto, SulAmérica, Bradesco, Amil, Unimed) como assets em `src/assets/insurers/` (placeholders SVG/texto se imagens não disponíveis — usar texto estilizado como fallback)
- Toggle ligar/desligar a faixa
- Seleção de quais seguradoras exibir (checkboxes)

**6. Mensagem fixa institucional**
- Bloco fixo abaixo do título (não editável):
  > "Descubra como reduzir em até 30% o valor do seu plano de saúde com uma consultoria online personalizada."
- Apenas o **título principal** é editável (campo único no painel)
- Remove os campos atuais de subtítulo/descrição/highlight/CTA do painel (mantém internamente como constantes para preservar o layout)

**7. Preview em tempo real**
- Já existe — todos os novos campos (logo, fundo, cores, faixa, título) refletem instantaneamente

### Estrutura do painel reorganizada

```
┌─ Painel de controles ─┐    ┌─ Preview ─┐
│ • Título (editável)   │    │           │
│ • Logo (upload+size)  │    │  [LOGO]   │
│ • Fundo (upload+over) │    │  TÍTULO   │
│ • Cores (3 pickers)   │    │  msg fixa │
│ • Seguradoras (check) │    │  [QR]     │
│ • Padrões salvos      │    │ ▓seguros▓ │
│ • Exportar/Compartilhar│    │           │
└───────────────────────┘    └───────────┘
```

### Banco de dados

Nova tabela `banner_templates` com RLS por usuário. Migration única.

### Garantias de não-interferência

- Edita **apenas** `src/pages/BannerCreator.tsx`
- Cria assets novos em `src/assets/insurers/` (não toca em existentes)
- Cria tabela nova isolada — não mexe em `profiles`, `leads`, etc.
- QR Code, auth, rota e fluxo de exportação permanecem idênticos
- Botão de acesso no Dashboard intacto

### Arquivos
- **Editado**: `src/pages/BannerCreator.tsx`
- **Novos**: `src/assets/insurers/*.svg` (5 logos placeholder de seguradoras)
- **Migration**: criar tabela `banner_templates` + RLS
