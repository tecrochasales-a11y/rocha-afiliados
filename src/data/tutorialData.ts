export interface TutorialTopic {
  id: string;
  category: string;
  icon: string;
  title: string;
  description: string;
  howToUse: string;
  tips: string[];
  notes?: string;
}

export const tutorialCategories = [
  { key: "all", label: "Todos" },
  { key: "visao-geral", label: "Visão Geral" },
  { key: "dashboard", label: "Dashboard" },
  { key: "financeiro", label: "Financeiro" },
  { key: "indicacoes", label: "Indicações" },
  { key: "perfil", label: "Perfil" },
  { key: "dicas", label: "Dicas Rápidas" },
  { key: "problemas", label: "Problemas Comuns" },
];

export const tutorialTopics: TutorialTopic[] = [
  // Visão Geral
  {
    id: "visao-plataforma",
    category: "visao-geral",
    icon: "LayoutDashboard",
    title: "O que é a plataforma?",
    description: "A plataforma é um sistema completo de programa de afiliados. Você pode indicar pessoas, acompanhar seus leads e receber comissões por cada conversão realizada.",
    howToUse: "Após fazer login, você terá acesso ao seu painel com todas as informações: métricas, link de indicação, leads e financeiro.",
    tips: [
      "Mantenha seu perfil sempre atualizado",
      "Acompanhe seus leads diariamente",
      "Compartilhe seu link de indicação nas redes sociais",
    ],
    notes: "A plataforma é atualizada constantemente com novas funcionalidades.",
  },
  {
    id: "como-funciona-afiliados",
    category: "visao-geral",
    icon: "Users",
    title: "Como funciona o programa de afiliados?",
    description: "Você recebe um link exclusivo de indicação. Quando alguém se cadastra ou preenche um formulário através do seu link, esse lead é registrado no seu painel. Se o lead for convertido, você recebe uma comissão.",
    howToUse: "1. Copie seu link de indicação no Dashboard\n2. Compartilhe com pessoas interessadas\n3. Acompanhe o status dos leads no painel\n4. Receba comissões quando os leads forem convertidos",
    tips: [
      "Quanto mais leads qualificados, maiores suas chances de conversão",
      "Leads qualificados são aqueles que realmente têm interesse no produto",
    ],
  },

  // Dashboard
  {
    id: "dashboard-metricas",
    category: "dashboard",
    icon: "BarChart3",
    title: "Cards de métricas",
    description: "No topo do Dashboard, você encontra cards com suas principais métricas: total de leads, leads convertidos, leads perdidos e saldo disponível.",
    howToUse: "Basta acessar o Dashboard após o login. Os cards são atualizados automaticamente conforme novos leads são registrados e processados.",
    tips: [
      "Verifique suas métricas diariamente para acompanhar o progresso",
      "Compare os números para entender sua taxa de conversão",
    ],
  },
  {
    id: "dashboard-link",
    category: "dashboard",
    icon: "Link",
    title: "Link de indicação",
    description: "Seu link exclusivo de indicação aparece no Dashboard. Qualquer pessoa que acessar esse link será vinculada ao seu cadastro como afiliado.",
    howToUse: "Clique no botão 'Copiar' ao lado do link para copiá-lo. Em seguida, compartilhe via WhatsApp, redes sociais, e-mail ou qualquer outro canal.",
    tips: [
      "Compartilhe o link em grupos relevantes",
      "Use o QR Code para compartilhar presencialmente",
      "Personalize sua mensagem ao compartilhar",
    ],
  },
  {
    id: "dashboard-leads",
    category: "dashboard",
    icon: "ClipboardList",
    title: "Tabela de leads",
    description: "A tabela de leads mostra todos os leads gerados através do seu link de indicação, com informações como nome, status, data e produto.",
    howToUse: "Role a página do Dashboard para baixo para ver a tabela. Você pode visualizar o status de cada lead (pendente, contactado, qualificado, convertido ou perdido).",
    tips: [
      "Acompanhe o status dos leads regularmente",
      "Leads pendentes podem levar algum tempo para serem processados",
    ],
  },

  // Financeiro
  {
    id: "financeiro-comissoes",
    category: "financeiro",
    icon: "DollarSign",
    title: "Comissões",
    description: "Na página Financeiro, você visualiza todas as suas comissões: pendentes, aprovadas e pagas. As comissões são geradas automaticamente quando um lead é convertido.",
    howToUse: "Acesse 'Financeiro' no menu lateral. Você verá cards com o total recebido, a receber e o saldo disponível para saque.",
    tips: [
      "As comissões são processadas após a confirmação do pagamento pelo cliente",
      "O valor da comissão depende do produto e da porcentagem configurada",
    ],
  },
  {
    id: "financeiro-saque",
    category: "financeiro",
    icon: "Wallet",
    title: "Como solicitar saque?",
    description: "Quando você tiver saldo disponível, pode solicitar um saque via PIX. O valor será transferido para a chave PIX cadastrada no seu perfil.",
    howToUse: "1. Certifique-se de ter uma chave PIX cadastrada no Perfil\n2. Acesse Financeiro\n3. Clique em 'Solicitar Saque'\n4. Informe o valor\n5. Aguarde a aprovação",
    tips: [
      "Mantenha sua chave PIX sempre atualizada",
      "O prazo de processamento do saque pode variar",
      "Verifique o valor mínimo para saque",
    ],
    notes: "Saques são processados manualmente pela equipe administrativa.",
  },

  // Indicações
  {
    id: "indicacoes-compartilhar",
    category: "indicacoes",
    icon: "Share2",
    title: "Como compartilhar seu link",
    description: "Você pode compartilhar seu link de indicação de diversas formas: copiando o link, usando o QR Code ou compartilhando diretamente via redes sociais.",
    howToUse: "No Dashboard, use o botão 'Copiar' para copiar o link, ou gere um QR Code para compartilhar presencialmente.",
    tips: [
      "WhatsApp é um dos canais mais eficientes para compartilhar",
      "Use o QR Code em eventos presenciais",
      "Crie uma mensagem personalizada ao enviar o link",
    ],
  },
  {
    id: "indicacoes-qrcode",
    category: "indicacoes",
    icon: "QrCode",
    title: "QR Code",
    description: "O QR Code é gerado automaticamente a partir do seu link de indicação. Basta a pessoa escanear o código para acessar o formulário de cadastro vinculado a você.",
    howToUse: "No Dashboard, clique em 'QR Code' para visualizar e baixar seu código. Compartilhe em materiais impressos, redes sociais ou presencialmente.",
    tips: [
      "Imprima o QR Code para usar em atendimentos presenciais",
      "Funciona com a câmera do celular, sem necessidade de app especial",
    ],
  },
  {
    id: "indicacoes-acompanhar",
    category: "indicacoes",
    icon: "Eye",
    title: "Acompanhar leads",
    description: "Todos os leads gerados pelo seu link ficam registrados no Dashboard. Você pode acompanhar o status de cada um em tempo real.",
    howToUse: "Acesse o Dashboard e veja a tabela de leads. Os status possíveis são: Pendente, Contactado, Qualificado, Convertido e Perdido.",
    tips: [
      "Leads convertidos geram comissões automaticamente",
      "Leads perdidos não geram comissão",
    ],
  },

  // Perfil
  {
    id: "perfil-dados",
    category: "perfil",
    icon: "UserCog",
    title: "Dados cadastrais",
    description: "Na página de Perfil, você pode visualizar e editar seus dados pessoais: nome, e-mail, telefone, CPF e foto de perfil.",
    howToUse: "Acesse 'Perfil' no menu. Edite os campos desejados e clique em 'Salvar' para atualizar suas informações.",
    tips: [
      "Mantenha seus dados sempre atualizados",
      "O e-mail é usado para login e recuperação de senha",
    ],
  },
  {
    id: "perfil-pix",
    category: "perfil",
    icon: "KeyRound",
    title: "Chave PIX",
    description: "A chave PIX é necessária para receber seus saques. Cadastre-a no seu perfil antes de solicitar qualquer saque.",
    howToUse: "Acesse Perfil, encontre o campo 'Chave PIX', insira sua chave e salve.",
    tips: [
      "Use uma chave PIX que você tenha fácil acesso",
      "Pode ser CPF, e-mail, telefone ou chave aleatória",
      "Verifique se a chave está correta antes de salvar",
    ],
    notes: "Saques serão enviados para a chave cadastrada. Erros na chave podem atrasar o pagamento.",
  },
  {
    id: "perfil-senha",
    category: "perfil",
    icon: "Lock",
    title: "Alteração de senha",
    description: "Você pode alterar sua senha a qualquer momento por questões de segurança.",
    howToUse: "Acesse Perfil, clique em 'Alterar Senha', informe a nova senha e confirme.",
    tips: [
      "Use uma senha forte com letras, números e caracteres especiais",
      "Não compartilhe sua senha com ninguém",
    ],
  },

  // Dicas Rápidas
  {
    id: "dicas-conversao",
    category: "dicas",
    icon: "TrendingUp",
    title: "Como converter mais leads",
    description: "Aumentar sua taxa de conversão depende da qualidade dos leads que você indica e da forma como compartilha seu link.",
    howToUse: "Foque em pessoas que realmente têm interesse no produto. Explique os benefícios antes de enviar o link.",
    tips: [
      "Qualidade é mais importante que quantidade",
      "Conheça bem o produto que está indicando",
      "Tire dúvidas dos seus leads antes que eles preencham o formulário",
      "Acompanhe os resultados para ajustar sua estratégia",
    ],
  },
  {
    id: "dicas-redes",
    category: "dicas",
    icon: "Globe",
    title: "Boas práticas nas redes sociais",
    description: "As redes sociais são um ótimo canal para gerar leads. Use-as estrategicamente para maximizar seus resultados.",
    howToUse: "Publique conteúdos relevantes sobre o produto, use stories, faça posts com seu link e interaja com os interessados.",
    tips: [
      "Não faça spam — compartilhe com contexto",
      "Use depoimentos e resultados como prova social",
      "Responda comentários e mensagens rapidamente",
    ],
  },

  // Problemas Comuns
  {
    id: "problema-login",
    category: "problemas",
    icon: "AlertCircle",
    title: "Não consigo fazer login",
    description: "Se você está com dificuldade para acessar sua conta, pode ser um problema de senha ou e-mail incorreto.",
    howToUse: "1. Verifique se o e-mail está correto\n2. Tente redefinir a senha em 'Esqueci minha senha'\n3. Verifique se não há espaços extras no e-mail\n4. Se o problema persistir, entre em contato com o suporte",
    tips: [
      "Use o mesmo e-mail cadastrado originalmente",
      "Verifique a caixa de spam ao redefinir a senha",
    ],
  },
  {
    id: "problema-lead",
    category: "problemas",
    icon: "AlertTriangle",
    title: "Lead não aparece no painel",
    description: "Em alguns casos, pode haver um pequeno atraso para o lead aparecer no seu painel.",
    howToUse: "Aguarde alguns minutos e atualize a página. Se o lead não aparecer após 24h, entre em contato com o suporte informando os dados da indicação.",
    tips: [
      "Verifique se a pessoa usou seu link corretamente",
      "O lead só é registrado quando o formulário é preenchido completamente",
    ],
  },
  {
    id: "problema-saque",
    category: "problemas",
    icon: "Ban",
    title: "Saque não foi processado",
    description: "Saques são processados manualmente e podem levar alguns dias úteis para serem concluídos.",
    howToUse: "Verifique o status do saque na página Financeiro. Se estiver como 'Pendente', aguarde. Se estiver como 'Rejeitado', verifique o motivo e corrija antes de solicitar novamente.",
    tips: [
      "Confira se sua chave PIX está correta no Perfil",
      "Verifique se atende ao valor mínimo de saque",
      "Em caso de dúvidas, entre em contato com o suporte",
    ],
  },
];
