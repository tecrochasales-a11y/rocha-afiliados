

## Plano: Modernização Visual do App Rocha Sales

### Escopo
Atualizar **apenas a camada visual** (CSS, classes Tailwind, animações) das páginas do afiliado e da landing page. **Nenhuma lógica, integração, banco de dados, autenticação ou rota será alterada.**

### Exclusões explícitas
- Painel Admin (`src/pages/admin/*`, `src/components/admin/*`) — ZERO alterações
- Painel Gestor (`src/pages/gestor/*`, `src/components/gestor/*`) — ZERO alterações
- Arquivos de integração (`client.ts`, `types.ts`, `.env`) — intocados
- Hooks (`useAuth`, `useSiteContent`) — intocados
- Edge functions e migrations — intocados

### O que muda

**1. Variáveis de tema (`src/index.css`)**
- Refinar a paleta para tons mais vibrantes e característicos da Rocha Sales (azul marinho profundo + verde esmeralda + dourado)
- Adicionar novos gradientes e sombras mais pronunciadas
- Adicionar keyframes globais: `shimmer` melhorado, `glow-pulse`, `gradient-shift` (fundo animado sutil)
- Suavizar transições globais com `transition-all duration-300` em elementos interativos

**2. Landing Page — Componentes visuais**

| Arquivo | Mudança |
|---------|---------|
| `HeroSection.tsx` | Adicionar partículas/formas geométricas flutuantes com CSS, efeito parallax sutil no fundo, badges com glassmorphism |
| `HowItWorksSection.tsx` | Cards com hover 3D (perspective + rotateX/Y), linha de conexão animada entre steps |
| `BenefitsSection.tsx` | Ícones com gradiente animado, cards com borda que brilha no hover |
| `StatsSection.tsx` | Contagem animada nos números (countUp), fundo com gradiente que se move |
| `ProductsSection.tsx` | Cards com efeito glassmorphism e hover lift mais pronunciado |
| `CTASection.tsx` | Botão com efeito shimmer contínuo, fundo com gradient-shift |
| `FAQSection.tsx` | Accordion com transição mais suave e ícone rotativo |
| `ValuePropositionSection.tsx` | Entrada escalonada (stagger) dos cards com intersection observer |
| `ResultsSection.tsx` | Barras de progresso animadas ao entrar na viewport |
| `SuccessStoriesSection.tsx` | Cards com quote estilizada e avatar com ring animado |
| `TrustSection.tsx` | Logos com grayscale que ganham cor no hover |
| `Header.tsx` | Header com blur mais pronunciado, shrink animation ao scrollar |
| `Footer.tsx` | Visual mais limpo com hover animations nos links |

**3. Páginas do Afiliado — Visual moderno**

| Arquivo | Mudança (apenas visual) |
|---------|---------|
| `Dashboard.tsx` | Cards de stats com gradiente sutil de fundo, hover lift, ícones com background animado. Card do link de indicação com efeito glassmorphism. Tabela com hover row highlight |
| `Login.tsx` | Background com gradient-shift animado, card com glassmorphism sutil, inputs com focus animation mais visível |
| `Cadastro.tsx` | Mesmo tratamento do Login — fundo dinâmico, card clean com sombras suaves, steps indicators com glow |
| `EsqueciSenha.tsx` | Consistência visual com Login |
| `RedefinirSenha.tsx` | Consistência visual com Login |
| `Perfil.tsx` | Cards de seção com borda gradiente, inputs com micro-animações no focus |
| `Financeiro.tsx` | Cards de saldo com gradientes distintos (verde para ganhos, azul para pendente), tabela com zebra-stripe sutil |
| `Notificacoes.tsx` | Cards de notificação com indicator animado para não-lidas, entrada staggered |

**4. Componentes UI base**

| Arquivo | Mudança |
|---------|---------|
| `button.tsx` | Adicionar variante `glow` com sombra pulsante sutil |
| `card.tsx` | Adicionar variante com hover-lift e borda gradiente opcional via className |
| `BackToTop.tsx` | Animação de entrada/saída mais suave, ícone com pulse |

**5. Tailwind config (`tailwind.config.ts`)**
- Adicionar keyframes: `gradient-shift`, `glow-pulse`, `float-slow`
- Adicionar animation utilities correspondentes

### Regras de segurança seguidas
- Nenhum `useState`, `useEffect`, hook ou handler de evento será adicionado ou removido (exceto animações CSS puras que usam intersection observer já existente)
- Nenhum import de supabase, auth ou integração será tocado
- Nenhuma prop de componente será renomeada
- Nenhuma rota será alterada
- Todas as queries, mutations e chamadas de API permanecem idênticas
- Os nomes de export permanecem os mesmos

### Ordem de execução
1. `tailwind.config.ts` + `src/index.css` (fundação)
2. `button.tsx` + `card.tsx` (componentes base)
3. Landing page components (13 arquivos)
4. Páginas do afiliado (8 arquivos)
5. `BackToTop.tsx`

Total: ~25 arquivos editados, mudanças exclusivamente em classes CSS/Tailwind e markup visual.

