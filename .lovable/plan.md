

## Plano: Tutorial Visual Interativo (estilo Royal Enfield Explore)

### Conceito
Transformar a Central de Ajuda para que, ao clicar em um card de tutorial, ele abra um painel visual mostrando uma **simulação/preview** de como a funcionalidade aparece no app real. Inspirado na seção Explore da Royal Enfield, onde um menu lateral controla a imagem principal com transições suaves.

### O que seria necessario

**1. Screenshots/Mockups das telas do app**
- Para cada tópico do tutorial, seria necessario ter uma imagem (screenshot ou mockup) da area correspondente do app
- Exemplos: screenshot do Dashboard com os cards de metricas, screenshot da pagina Financeiro, screenshot do link de indicacao, etc.
- Essas imagens seriam armazenadas em `public/tutorial/` ou `src/assets/tutorial/`
- Sem imagens reais, podemos criar mockups simplificados com componentes HTML/CSS que simulam a aparencia da tela

**2. Novo layout da pagina de tutorial**
- Layout dividido em duas colunas (estilo Explore):
  - **Esquerda**: Menu vertical com os topicos (como MOTOR, FREIOS, FAROL na Royal Enfield)
  - **Direita**: Area de preview visual que muda com transicao suave ao selecionar cada topico
- O preview mostra a imagem/mockup da tela + um tooltip/label apontando para a area relevante
- Animacao de fade/slide ao trocar entre topicos

**3. Alternativa sem screenshots (mockups CSS)**
- Como nao temos screenshots prontos, podemos criar mini-mockups visuais com CSS/HTML que representam cada area do app
- Exemplo: para "Cards de metricas", mostrar um mini-dashboard com cards simplificados
- Para "Link de indicacao", mostrar um mini-componente com o link e botao de copiar
- Isso daria um efeito visual rico sem depender de imagens externas

### Arquivos a criar/modificar

| Arquivo | Acao |
|---------|------|
| `src/components/tutorial/TutorialExplorer.tsx` | **Novo** - Layout principal estilo Explore com menu lateral + area de preview |
| `src/components/tutorial/TutorialPreview.tsx` | **Novo** - Componente que renderiza o mockup visual de cada area |
| `src/components/tutorial/previews/*.tsx` | **Novos** - Mini-mockups visuais para cada area (DashboardPreview, FinanceiroPreview, etc.) |
| `src/data/tutorialData.ts` | **Editar** - Adicionar campo `previewComponent` ou `previewImage` a cada topico |
| `src/components/tutorial/HelpCenter.tsx` | **Editar** - Integrar o novo layout Explorer como modo de visualizacao |

### Comportamento esperado

1. Usuario acessa `/ajuda`
2. Ve o layout com menu lateral (categorias/topicos) a esquerda
3. Ao clicar em um topico, a area direita mostra:
   - Um mockup visual animado da tela correspondente
   - Indicadores/setas apontando para a area relevante
   - Texto explicativo abaixo ou ao lado do preview
4. Transicoes suaves entre topicos (fade + slide)
5. No mobile: layout empilhado (menu em cima, preview embaixo)

### Decisao necessaria

Para prosseguir, preciso saber sua preferencia:

- **Opcao A**: Criar mini-mockups CSS/HTML que simulam as telas do app (100% codigo, sem imagens externas)
- **Opcao B**: Usar screenshots reais das telas (voce precisaria fornecer os prints ou eu geraria placeholders)
- **Opcao C**: Manter os cards atuais mas adicionar uma area de preview visual ao expandir cada card (menos radical, mais rapido)

### Seguranca
- Nenhum arquivo existente sera refatorado
- Apenas adicao de novos componentes e edicoes minimas nos arquivos de tutorial ja criados
- Zero impacto nas integracoes, rotas ou logica de negocio

