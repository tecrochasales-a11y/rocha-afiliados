

## Plano: Módulo Criador de Banner Card com QR Code

### Análise
- O QR Code é derivado do `tracking_code` do perfil: `{origin}/ref/{tracking_code}`
- Usa `qrcode.react` (já instalado)
- Auth e profile já disponíveis via `useAuth()`
- Nenhuma alteração em tabelas, RLS, integrações ou páginas existentes

### Implementação (2 arquivos novos, 1 edição mínima)

#### 1. Novo `src/pages/BannerCreator.tsx`

Página completa com editor de banner card:

**Painel esquerdo — Controles de edição:**
- Inputs: título, subtítulo, descrição, frase de destaque, CTA
- Seletor de layout (3-4 variações: QR à direita, QR centralizado, QR no topo, layout horizontal)
- Seletor de alinhamento de texto (esquerda, centro, direita)
- Seletor de esquema de cores (dourado/escuro padrão, claro, escuro puro, azul corporativo)
- Botões: Baixar PNG, Compartilhar

**Painel direito — Preview em tempo real:**
- Card 1080x1350px (proporção de post Instagram)
- Título, subtítulo, descrição renderizados conforme inputs
- QR Code automático via `useAuth().profile.tracking_code`
- Rodapé com imagem stock (imagem padrão do sistema ou placeholder elegante)
- Identidade visual Rocha Sales (cores dourado #C9A84C, fonte Playfair Display)

**Exportação:**
- Usa `html-to-canvas` (ou canvas nativo) para gerar PNG do card
- Download direto no dispositivo
- Opção de compartilhar via Web Share API

**Segurança do QR Code:**
- Usa apenas `useAuth().profile.tracking_code` da sessão logada
- Nenhuma query extra ao banco
- Fallback visual se tracking_code ausente

**Responsivo:**
- Em mobile, controles acima e preview abaixo (empilhado)

#### 2. Edição em `src/App.tsx`

Adicionar uma única rota:
```tsx
<Route path="/banner-creator" element={<ProtectedRoute><BannerCreator /></ProtectedRoute>} />
```

#### 3. Acesso no Dashboard

Adicionar um botão/link discreto no Dashboard (na seção do link de indicação) para acessar `/banner-creator`, sem alterar layout ou lógica existente.

### Dependência
- Instalar `html2canvas` para exportar o card como imagem PNG

### O que NÃO será alterado
- Nenhuma tabela ou RLS
- Nenhuma integração/webhook
- Nenhuma página existente (exceto link de acesso no Dashboard)
- Nenhuma lógica de autenticação
- Nenhum componente existente

### Layouts disponíveis

```text
Layout 1 (Clássico)      Layout 2 (Centralizado)    Layout 3 (Horizontal)
┌──────────────────┐     ┌──────────────────┐       ┌──────────────────┐
│  TÍTULO          │     │     TÍTULO       │       │ TÍTULO   [QR]    │
│  Subtítulo       │     │    Subtítulo     │       │ Subtítulo        │
│  Descrição       │     │                  │       │ Descrição        │
│            [QR]  │     │      [QR]        │       │ CTA              │
│  CTA             │     │                  │       │                  │
│ ─────────────────│     │      CTA         │       │ ─────────────────│
│  [imagem rodapé] │     │ [imagem rodapé]  │       │  [imagem rodapé] │
└──────────────────┘     └──────────────────┘       └──────────────────┘
```

### Arquivos
- **Novo**: `src/pages/BannerCreator.tsx`
- **Editado**: `src/App.tsx` (1 rota), `src/pages/Dashboard.tsx` (1 botão de acesso)

