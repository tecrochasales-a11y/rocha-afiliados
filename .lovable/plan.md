

## Plano: Destacar "Visão Geral" no sidebar e reorganizar cards abaixo

### O que muda

#### 1. `src/components/tutorial/TutorialExplorer.tsx` — Sidebar

- **Destaque na categoria "Visão Geral"**: Adicionar um fundo sutil (ex: `bg-primary/5 border border-primary/20 rounded-xl p-2`) ao grupo "Visão Geral" para que ele se sobressaia visualmente em relação às outras categorias
- O heading "VISÃO GERAL" ganha cor `text-primary` em vez do cinza padrão, com um ponto colorido ao lado (como no screenshot)

#### 2. `src/components/tutorial/TutorialExplorer.tsx` — Área de detalhe

- Mover os accordions (Descrição, Como usar, Dicas) para **cards separados em grid horizontal** abaixo do preview, em vez de accordions empilhados
- Layout: grid de 2-3 colunas com cards compactos (ícone + título + conteúdo), semelhante a cards de FAQ
- Isso torna a informação mais acessível sem precisar clicar para expandir

### Resultado
- "Visão Geral" se destaca visualmente no sidebar
- As informações complementares ficam em cards visíveis abaixo do preview, sem necessidade de accordion

