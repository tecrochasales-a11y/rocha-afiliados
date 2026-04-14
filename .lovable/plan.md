

## Plano: descer o enquadramento da imagem para parar de cortar as pessoas

### O que vou ajustar
No `src/components/landing/HeroSection.tsx`, a imagem de fundo hoje está com `object-center`, o que ainda deixa as pessoas altas demais no enquadramento e acaba cortando a parte superior.

### Alteração proposta
Manter `object-cover` e trocar o posicionamento da imagem por um ajuste vertical mais fino, deixando o foco um pouco acima do centro da foto para que, visualmente, eles apareçam mais baixos na tela.

```tsx
/* Antes */
className="absolute inset-0 w-full h-full object-cover object-center"

/* Depois */
className="absolute inset-0 w-full h-full object-cover"
style={{ objectPosition: "center 28%" }}
```

### Resultado esperado
- As pessoas ficam menos cortadas
- A imagem continua em tela cheia
- O Hero mantém o mesmo layout, texto, botões e cards

### Observação técnica
Se no preview ainda ficar alto ou baixo demais, o ajuste fino é simples: basta variar esse valor (`24%`, `26%`, `30%`) até encaixar perfeitamente.

