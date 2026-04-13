

## Plano: Animações automáticas nos previews do tutorial

### Objetivo
Transformar os mockups estáticos atuais em animações CSS que simulam o uso real do app — elementos aparecendo progressivamente, cursores se movendo, botões sendo "clicados", dados carregando, etc.

### O que muda

Reescrever os 5 arquivos de preview existentes, adicionando animações com `useState` + `useEffect` + CSS transitions/keyframes. Nenhum arquivo fora da pasta `tutorial/previews/` será alterado.

### Animações por preview

**DashboardPreview.tsx**
- `DashboardMetricsPreview`: Cards aparecem um a um com stagger (delay escalonado). Valores numéricos fazem "contagem" de 0 ao valor final.
- `DashboardLinkPreview`: Link aparece, depois um cursor animado se move até o botão "Copiar", o botão pisca simulando clique, e aparece um tooltip "Copiado!".
- `DashboardLeadsPreview`: Linhas da tabela aparecem uma a uma de cima para baixo com fade-in.

**FinanceiroPreview.tsx**
- `ComissoesPreview`: Valores fazem contagem animada. Cards de comissões entram com slide-up escalonado.
- `SaquePreview`: Campos preenchem automaticamente (texto digitado caractere a caractere). Botão "Solicitar Saque" pulsa ao final.

**IndicacoesPreview.tsx**
- `CompartilharPreview`: Cursor simulado clica no botão copiar, depois mostra tooltip de sucesso.
- `QRCodePreview`: QR Code aparece com scale-in animado.
- `AcompanharLeadsPreview`: Status dos leads mudam progressivamente (Pendente → Contactado → Convertido).

**PerfilPreview.tsx**
- `DadosCadastraisPreview`: Campos aparecem sequencialmente, simulando preenchimento.
- `PixKeyPreview`: Chave PIX é "digitada" com efeito typewriter.
- `AlterarSenhaPreview`: Dots de senha aparecem progressivamente, botão "Salvar" fica ativo ao final.

**GenericPreview.tsx**
- `PlataformaPreview`: Passos 1→2→3 se destacam sequencialmente com glow.
- `AfiliadosPreview`: Steps aparecem um a um com checkmark animado.
- `ProblemaLoginPreview`: Checkboxes são marcados automaticamente um a um.
- Outros: Fade-in escalonado nos itens de lista.

### Técnica
- `useEffect` com `setInterval`/`setTimeout` para controlar timing
- CSS `transition` + classes dinâmicas para suavidade
- Animações reiniciam quando o tópico é selecionado (via `key` prop no `TutorialExplorer`)
- Loop automático: animação reinicia após completar (ciclo contínuo)
- Zero dependências novas — apenas React state + CSS

### Arquivos modificados
| Arquivo | Tipo |
|---------|------|
| `src/components/tutorial/previews/DashboardPreview.tsx` | Reescrever |
| `src/components/tutorial/previews/FinanceiroPreview.tsx` | Reescrever |
| `src/components/tutorial/previews/IndicacoesPreview.tsx` | Reescrever |
| `src/components/tutorial/previews/PerfilPreview.tsx` | Reescrever |
| `src/components/tutorial/previews/GenericPreview.tsx` | Reescrever |
| `src/components/tutorial/TutorialExplorer.tsx` | Pequena edição — adicionar `key={topic.id}` no preview para forçar remount e reiniciar animações |

### Segurança
- Apenas arquivos dentro de `src/components/tutorial/previews/` são alterados
- Nenhuma integração, rota ou lógica de negócio é tocada
- As exportações mantêm os mesmos nomes — sem breaking changes

