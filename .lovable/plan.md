

## Plano: Reverter tema para modo claro (padrão)

### Alteração — `src/hooks/useTheme.tsx`

Mudar o valor inicial de `"dark"` para `"light"`:

```tsx
const [theme, setTheme] = useState<"light" | "dark">(() => {
  return "light";
});
```

O site voltará a abrir no modo claro por padrão.

