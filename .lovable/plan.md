# Notificações por e-mail — Rocha Sales

## Decisões confirmadas
- Envio pelo **Gmail**, seguindo a referência enviada.
- Destinatário único de todos os avisos: **andersonmenez@gmail.com**. Não enviar aos demais gestores.
- Manter as notificações atuais dentro do app e os avisos via n8n/WhatsApp.

## Análise do documento
O documento fornece uma boa base: envio centralizado, mensagens HTML e texto, registro de envios, teste e proteção contra duplicidades. Porém, descreve outro aplicativo, com propostas, etapas e prazos que não existem neste sistema. Vamos adaptar esses conceitos, sem copiar suas regras de pendências, horários de 9h/13h/17h, prazo de emissão ou rascunhos com anexos.

## Avisos incluídos
| Evento | Quando avisar Anderson |
|---|---|
| Novo afiliado | Cadastro de um afiliado efetivamente registrado, por senha ou Google; uma vez por cadastro, não a cada login |
| Novo lead | Nova indicação salva, por qualquer caminho de entrada |
| Progresso do lead | Mudança real entre pendente, contatado, qualificado, convertido e perdido |
| Pagamento do cliente | Mudança real de status de pagamento |
| Comissões | Criação e mudanças de status, incluindo liberação, cancelamento/restauração e pagamento; identificar parcela quando houver |
| Saques | Nova solicitação e aprovação, rejeição ou pagamento |
| Vínculo ao PDV | Atribuição ou troca do PDV do afiliado |
| Campanhas | Criação, ativação ou desativação; não enviar publicidade aos afiliados |
| Outros avisos existentes | Notificações operacionais registradas no app, sem repetir eventos já cobertos acima |

Alterações sem mudança de estado, consultas, logins e ajustes visuais não geram avisos. A instalação começa a registrar novos eventos; não enviar o histórico antigo automaticamente.

## O que será instalado
1. **Conectar a conta remetente Gmail.** Há uma conexão disponível chamada “rs gmail”; a escolha/autorização será feita no cartão de conexão após aprovação do plano. Confirmar a conta real remetente e a permissão de envio. Anderson é o destinatário, não necessariamente o remetente.
2. **Capturar os eventos automaticamente**, inclusive alterações pelo administrador, gestor, formulário público e integrações. Salvar o evento junto à alteração para não perder avisos se o navegador fechar.
3. **Enviar em segundo plano**, com tentativas posteriores para falhas temporárias e proteção contra duplicidades. Falha do e-mail não deve impedir cadastros, leads ou pagamentos.
4. **Criar mensagens com a identidade Rocha Sales**, contendo evento, nome relevante, afiliado, PDV quando disponível, situação anterior/nova, data e link para a página protegida correspondente. Não incluir senha, CPF completo, chave PIX ou dados desnecessários.
5. **Adicionar uma área administrativa “Notificações por e-mail”**, com histórico, filtros por evento/status, detalhes de falhas, e-mail de teste e reenvio controlado de falhas. Destinatário único visível, sem preferências individuais ou listas de e-mails.

## Detalhes técnicos
- Adaptar para React/Vite + funções da Lovable Cloud; não copiar arquivos de servidor/rotas do outro projeto para `src`.
- Enviar pela API Gmail através da conexão autorizada, somente no servidor, com escopo `gmail.send`; não solicitar `gmail.compose`, pois não haverá rascunhos.
- Verificar o esquema e os gatilhos efetivamente ativos antes da migração; os arquivos locais não garantem o estado atual do banco.
- Registrar eventos em uma outbox persistente no banco por gatilhos de INSERT e mudanças específicas de UPDATE. Evitar eventos duplicados entre captura de domínio e notificações já existentes.
- Processar a outbox com uma única função e agendamento autenticado. Usar reserva atômica, identificação única por evento/destinatário e tentativas com atraso crescente; registrar fila, processamento, envio aceito pelo Gmail e erro final. Não afirmar entrega na caixa de entrada apenas pela aceitação da API.
- Não prometer entrega exatamente uma vez: timeout depois de o Gmail aceitar pode deixar o resultado incerto. Marcar essa situação para revisão, sem reenvio cego.
- Resolver o destinatário exclusivamente no servidor; não aceitar endereço ou conteúdo arbitrário do navegador. Histórico/configurações/testes acessíveis somente a administradores; tabelas com permissões explícitas e RLS.
- Cadastro deve considerar o papel definitivo de afiliado e a criação gradual do perfil, evitando classificar uma conta administrativa como novo afiliado. Alterações de parcelas devem manter contexto para não parecerem conversões repetidas.
- Preservar as integrações e notificações atuais, sem alterar os fluxos de autenticação.

## Validação antes de ativar
- Testes das regras: destinatário exclusivo Anderson, um evento por cadastro, mudanças reais de status, não duplicar eventos, restrição administrativa e retentativas.
- Enviar teste para Anderson e verificar a aceitação pelo Gmail e o histórico; confirmar recebimento real com o usuário.
- Exercitar cadastro, indicação real de teste, mudança de status, pagamento, comissão e saque; verificar os avisos correspondentes e os links. Fazer testes com dados identificados e sem efetuar pagamentos reais.
- Ativar envios operacionais após validar a conexão e os testes; respeitar limites e políticas de envio do Google.

## Fora deste escopo
Notificações aos gestores/afiliados por e-mail, campanhas em massa, anexos, cópia retroativa do histórico e alertas agendados de propostas do documento de referência.

## Dependência para instalação
Autorizar a conta Gmail remetente no cartão de conexão. Nenhuma alteração no funcionamento do app ou envio foi feito durante esta análise.