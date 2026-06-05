export const CATEGORIES: Record<string, { name: string; emoji: string; color: string; light: string }> = {
  all:            { name: 'Todos',              emoji: '🌿', color: '#2e7d32', light: '#e8f5e9' },
  granolas:       { name: 'Granolas',           emoji: '🥣', color: '#e65100', light: '#fff3e0' },
  panaderia:      { name: 'Panadería',          emoji: '🍞', color: '#6d4c41', light: '#efebe9' },
  snacks:         { name: 'Snacks',             emoji: '🍿', color: '#f57f17', light: '#fffde7' },
  'frutos-secos': { name: 'Frutos Secos',       emoji: '🥜', color: '#558b2f', light: '#f1f8e9' },
  lacteos:        { name: 'Lácteos',            emoji: '🥛', color: '#0277bd', light: '#e1f5fe' },
  suplementos:    { name: 'Suplementos',        emoji: '✨', color: '#6a1b9a', light: '#f3e5f5' },
  aceites:        { name: 'Aceites & Vinagres', emoji: '🫙', color: '#00695c', light: '#e0f2f1' },
  harinas:        { name: 'Harinas & Mezclas',  emoji: '🌾', color: '#ef6c00', light: '#fff8e1' },
  cremas:         { name: 'Cremas Untables',    emoji: '🍫', color: '#4e342e', light: '#efebe9' },
  bebidas:        { name: 'Bebidas',            emoji: '💧', color: '#0097a7', light: '#e0f7fa' },
  edulcorantes:   { name: 'Edulcorantes',       emoji: '🍃', color: '#2e7d32', light: '#e8f5e9' },
}

export const PRICE_FILTERS = [
  { id: 'all', label: 'Todos los precios', ico: '💰', min: 0,     max: Infinity },
  { id: 'p1',  label: 'Hasta $10.000',     ico: '💵', min: 0,     max: 10000    },
  { id: 'p2',  label: '$10.000 – $30.000', ico: '💵', min: 10001, max: 30000    },
  { id: 'p3',  label: '$30.000 – $80.000', ico: '💵', min: 30001, max: 80000    },
  { id: 'p4',  label: 'Más de $80.000',    ico: '💎', min: 80001, max: Infinity },
]

export const CATEGORY_OPTIONS = Object.entries(CATEGORIES)
  .filter(([k]) => k !== 'all')
  .map(([k, v]) => ({ value: k, label: `${v.emoji} ${v.name}` }))
