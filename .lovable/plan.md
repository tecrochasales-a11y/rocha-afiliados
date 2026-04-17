
Testar end-to-end o Banner Creator no preview, focando na posição/tamanho da marca d'água Rocha Sales (canto inferior esquerdo, acima da faixa branca de seguradoras).

### Passos
1. `browser--navigate_to_sandbox` em `/banner-creator`
2. `browser--screenshot` do estado inicial
3. Verificar marca d'água com faixa de seguradoras visível
4. Alternar visibilidade das seguradoras (toggle "Mostrar seguradoras") e tirar screenshot para confirmar que a marca d'água continua bem posicionada sem a faixa branca
5. Reportar resultado (posição, tamanho, eventuais sobreposições)

Se encontrar problema visual, paro e reporto antes de qualquer alteração de código.
