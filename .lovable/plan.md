

## Plano: Criar conta temporária com acesso admin

Como não é possível criar usuários diretamente no banco (a tabela `auth.users` é gerenciada internamente), o caminho mais rápido é:

### Etapas

1. **Habilitar auto-confirm de email temporariamente** — para que você não precise verificar email
2. **Você se cadastra** em `/cadastro` com as credenciais que preferir (ex: `teste@teste.com` / `Teste123!`)
3. **Atribuir role admin** ao seu usuário via inserção na tabela `user_roles`
4. **Desabilitar auto-confirm** novamente para manter a segurança

Com a role `admin`, você terá acesso a todas as áreas: admin (`/admin`), gestor e afiliado.

### Observação
Preciso que você me diga o email que vai usar no cadastro para eu conseguir atribuir a role correta depois.

