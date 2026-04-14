

## Plano: Forçar modo escuro para teste

### Alteração — `src/hooks/useTheme.tsx` (linha 4-7)

Mudar o valor inicial padrão para `"dark"` em vez de ler do `localStorage` ou preferência do sistema:

```tsx
const [theme, setTheme] = useState<"light" | "dark">(() => {
  return "dark";
});
```

Isso força o site a abrir em modo escuro. Quando terminar o teste, reverteremos para a lógica original.

