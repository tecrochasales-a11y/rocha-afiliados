

## Plano: Sistema de Tutorial/Ajuda Guiada (Camada Isolada)

### Resumo
Adicionar uma central de ajuda/tutorial como camada complementar ao app, sem modificar nenhum arquivo ou funcionalidade existente. O sistema será composto por novos arquivos apenas.

### Arquivos a criar (todos novos, nenhuma alteração em existentes exceto App.tsx para rota e Dashboard.tsx para botão)

**1. Dados do tutorial** — `src/data/tutorialData.ts`
- Array centralizado com todos os tópicos organizados por categorias (Dashboard, Financeiro, Indicações, Perfil, etc.)
- Cada item com: título, descrição, como usar, dicas, observações, ícone, categoria
- Estrutura escalável para adicionar novos tópicos facilmente no futuro

**2. Componente da Central de Ajuda** — `src/components/tutorial/HelpCenter.tsx`
- Página completa com:
  - Campo de busca por palavras-chave
  - Filtro por categorias (tabs ou chips)
  - Cards visuais com animações fade-in ao aparecer
  - Accordion para expandir/colapsar detalhes de cada tópico
  - Seções: "Para que serve", "Como usar", "Dicas", "Observações"
- Visual compatível com o design atual (Tailwind + shadcn/ui)

**3. Componente de Card Tutorial** — `src/components/tutorial/TutorialCard.tsx`
- Card individual com ícone, título, descrição curta
- Expande ao clicar para mostrar detalhes completos
- Microanimações suaves (fade-in, scale-in)

**4. Botão flutuante de ajuda** — `src/components/tutorial/HelpButton.tsx`
- Ícone de interrogação fixo no canto inferior direito
- Visível apenas nas páginas autenticadas (dashboard, financeiro, perfil)
- Ao clicar, navega para `/ajuda`

### Alterações mínimas em arquivos existentes

**5. `src/App.tsx`** — Adicionar apenas 1 rota nova:
```
<Route path="/ajuda" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
```

**6. `src/pages/Dashboard.tsx`** — Adicionar apenas o componente `<HelpButton />` no final do JSX (sem alterar nada existente)

### Categorias iniciais do tutorial
- **Visão Geral** — O que é a plataforma, como funciona o programa de afiliados
- **Dashboard** — Cards de métricas, link de indicação, tabela de leads
- **Financeiro** — Comissões, total recebido, a receber, pagamento via PIX
- **Indicações** — Como compartilhar link, QR Code, acompanhar leads
- **Perfil** — Dados cadastrais, chave PIX, alteração de senha
- **Dicas Rápidas** — Boas práticas para converter mais leads
- **Problemas Comuns** — FAQ com soluções para dúvidas frequentes

### Detalhes técnicos
- Usa apenas componentes shadcn/ui já instalados (Card, Accordion, Input, Badge, Tabs)
- Animações via classes Tailwind existentes (animate-fade-in, animate-scale-in)
- Zero dependências novas
- Nenhuma integração com banco de dados (dados estáticos no código, editáveis depois)
- Nenhum arquivo existente será refatorado ou reestruturado

