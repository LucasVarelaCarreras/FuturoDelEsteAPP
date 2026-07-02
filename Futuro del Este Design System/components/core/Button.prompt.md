Pill-shaped call-to-action button — use for any primary or secondary action; brand cyan by default.

```jsx
<Button variant="primary" size="md" onClick={save}>Colaborá</Button>
<Button variant="outline" iconLeft={<PlusIcon/>}>Sumate</Button>
```

Variants: `primary` (cyan, the default CTA), `secondary` (emerald), `outline`, `ghost`, `deep` (navy). Sizes: `sm` / `md` / `lg`. Props: `full` (100% width), `iconLeft`/`iconRight`, `disabled`. Hover shifts color (never opacity); press scales to 0.97.
