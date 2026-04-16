

## Plano: Tornar o Criador de Banner visível no Dashboard

### Problema
O botão "Criar Banner" está escondido dentro da seção colapsável "Visualizar Link", tornando-o difícil de encontrar.

### Solução
Adicionar um card dedicado para o Criador de Banner na área principal do Dashboard, visível sem precisar expandir nada. Será posicionado logo após o card "Seu Link de Indicação", como um card de ação rápida.

### Alteração em `src/pages/Dashboard.tsx`

Após o card "Seu Link de Indicação" (linha ~461), adicionar um card de acesso ao Banner Creator:

```tsx
{/* Banner Creator Card */}
<Link to="/banner-creator" className="block mb-8">
  <div className="bg-card rounded-xl p-5 border border-border shadow-soft hover-lift cursor-pointer transition-all hover:border-primary/30">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Layout className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-foreground">Criar Banner Personalizado</h3>
          <p className="text-sm text-muted-foreground">Crie artes promocionais com seu QR Code</p>
        </div>
      </div>
      <ExternalLink className="w-5 h-5 text-muted-foreground" />
    </div>
  </div>
</Link>
```

O botão pequeno dentro da seção colapsável será mantido como atalho secundário.

### Arquivo alterado
- `src/pages/Dashboard.tsx` — adicionar card de acesso ao Banner Creator

