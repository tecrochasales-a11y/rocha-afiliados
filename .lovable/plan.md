## Objetivo

Remover da janela "Pré-visualizar e baixar" do criador de banner os blocos de diagnóstico técnico, mantendo apenas o que o usuário precisa ver: o QR que será embutido e o banner final composto.

## O que será ocultado

No diálogo de pré-visualização em `src/pages/BannerCreator.tsx` (linhas ~1616–1687), todo o bloco `<div className="rounded-lg border border-border bg-muted/30 p-4 ...">` será removido da renderização. Isso engloba:

- Checklist de debug do QR export (itens OK / Falhou)
- Resumo rápido (QR target, data-export-ignore, tamanhos de canvas)
- Pixels na área do QR (antes/depois, posição)
- Log técnico do export (JSON)
- Problemas detectados (lista de issues)

## O que continua visível

- "QR Code que será embutido" — imagem do QR isolado, para conferência visual
- "Banner final composto" — imagem do PNG final que será baixado
- Botões de ação (Cancelar / Confirmar download)

## O que NÃO muda

- Toda a lógica de geração (`renderExportQrCanvas`, `captureBannerCanvasWithRetry`, composição em canvas novo) permanece intacta.
- O objeto `debug` continua sendo computado internamente (mantém a possibilidade de reativar o painel no futuro sem retrabalho), apenas deixa de ser renderizado na UI.
- O fluxo "Pré-visualizar → Confirmar download" continua igual.

## Arquivos editados

- `src/pages/BannerCreator.tsx` — remoção do bloco JSX do painel de debug dentro do `Dialog` de pré-visualização.
