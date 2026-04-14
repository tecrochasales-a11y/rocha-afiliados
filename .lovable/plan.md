

## Plano: Tutorial em modal passo-a-passo (estilo onboarding)

### Conceito
Criar um componente `TutorialModal` que exibe os tópicos do tutorial como slides dentro de um Dialog, com preview animado no topo, título, descrição, dots de progresso e navegação Anterior/Próximo — semelhante à imagem de referência.

### Arquivos

#### 1. Criar `src/components/tutorial/TutorialModal.tsx`
- Dialog/modal centralizado usando `shadcn/ui Dialog`
- Cada "slide" = um tópico do `tutorialTopics` (já existem 18 tópicos)
- Layout de cada slide:
  - **Topo**: Preview animado do tópico (reutilizar os componentes de preview existentes: `DashboardPreview`, `FinanceiroPreview`, etc.)
  - **Centro**: Título em negrito + descrição do tópico
  - **Dots**: Indicadores de progresso (slide atual destacado com cor primary, os demais em cinza)
  - **Rodapé**: Botão "← Anterior" (text) | Botão "Próximo →" (filled) | Contador "3 de 11"
- Estado interno: `currentStep` controlando qual tópico é exibido
- Botão X para fechar no canto superior direito
- Animação de transição suave entre slides (fade)

#### 2. Atualizar `src/components/tutorial/HelpButton.tsx`
- Ao clicar no botão "Tutorial", abrir o `TutorialModal` em vez de navegar para `/ajuda`
- Manter a opção de acessar a Central de Ajuda completa (link "Ver todos os tutoriais" no modal)

#### 3. Opcional: Filtrar por contexto
- Possibilidade futura de filtrar os slides por categoria (ex: mostrar só "Dashboard" quando o usuário está no Dashboard)

### Técnico
- Reutiliza `tutorialTopics` e `tutorialCategories` de `src/data/tutorialData.ts`
- Reutiliza os previews de `src/components/tutorial/previews/`
- Usa `Dialog` do shadcn para o modal
- Sem dependências novas
- ~150 linhas de código novo

### Resultado
Um tutorial interativo em modal que guia o usuário passo a passo, sem sair da página atual — mais acessível e prático que navegar para uma página separada.

