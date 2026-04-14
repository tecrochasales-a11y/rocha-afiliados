

## Plano: Redesign da Central de Ajuda — layout mais prático e fácil de navegar

### Problema atual
A Central de Ajuda tem muitos tópicos listados no sidebar esquerdo que ficam truncados, dificultando a localização. O modo "Explorar" mistura tudo numa lista longa sem agrupamento visual claro por categoria.

### Proposta de redesign

**Mudança principal**: Agrupar os tópicos por categoria no sidebar com títulos de seção, e simplificar a navegação removendo a barra de filtros por categoria (já que o agrupamento visual faz esse papel).

#### 1. `src/components/tutorial/TutorialExplorer.tsx`
- **Sidebar agrupado por categoria**: em vez de listar todos os tópicos em sequência, agrupá-los sob headings de categoria (ex: "Dashboard", "Financeiro", "Indicações") com texto pequeno e cor sutil
- **Sidebar mais largo** (de 220px para 260px) para os títulos não ficarem truncados
- **Destaque visual na categoria ativa**: ao clicar num tópico, o grupo da categoria fica visualmente marcado
- **Scrollbar mais suave** e padding melhorado

#### 2. `src/components/tutorial/HelpCenter.tsx`
- **Remover os filtros por badge** (Todos, Visão Geral, Dashboard...) já que o agrupamento no sidebar torna isso redundante
- **Manter a busca** — ao digitar, filtra os tópicos no sidebar e mostra apenas os que combinam
- **Título mais descritivo**: de "Central de Ajuda" para "Tutorial — Central de Ajuda" para reforçar o propósito
- **Subtítulo**: adicionar uma linha "Aprenda a usar cada funcionalidade da plataforma" abaixo do título

#### 3. Área de detalhe (direita)
- Manter o layout atual com preview + accordions, que já funciona bem
- Apenas ajustar para abrir automaticamente o accordion "Descrição" por padrão (valor `defaultValue={["description"]}`)

### Resultado esperado
- Sidebar organizado por seções com nomes completos visíveis
- Mais fácil de encontrar o tópico desejado sem precisar ler uma lista longa
- Busca continua funcionando para localização rápida
- Visual mais limpo e profissional

