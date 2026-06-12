'use client'

import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { SerializedProduct } from '@/types'
import { fmt } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants'

interface Props {
  products: SerializedProduct[]
}

const CHART_COLORS = ['#558b2f', '#7cb342', '#9ccc65', '#aed581', '#c5e1a5', '#dcedc8', '#ef6c00', '#0277bd', '#6a1b9a', '#00695c', '#0097a7', '#e65100']

export default function Dashboard({ products }: Props) {
  const metrics = useMemo(() => {
    const total = products.length
    const active = products.filter(p => p.active).length
    const inactive = total - active
    const noStock = products.filter(p => p.stock === 0).length
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length
    const totalUnits = products.reduce((acc, p) => acc + (p.stock ?? 0), 0)

    let inventoryValue = 0
    let totalCost = 0
    let marginSum = 0
    let marginCount = 0

    products.forEach(p => {
      const minPrice = p.variants.length > 0 ? Math.min(...p.variants.map(v => v.price)) : 0
      inventoryValue += minPrice * (p.stock ?? 0)
      totalCost += (p.costPrice ?? 0) * (p.stock ?? 0)
      if (minPrice > 0 && (p.costPrice ?? 0) > 0) {
        marginSum += ((minPrice - (p.costPrice ?? 0)) / minPrice) * 100
        marginCount++
      }
    })

    const grossProfit = inventoryValue - totalCost
    const avgMargin = marginCount > 0 ? marginSum / marginCount : 0

    return { total, active, inactive, noStock, lowStock, totalUnits, inventoryValue, totalCost, grossProfit, avgMargin }
  }, [products])

  const categoryData = useMemo(() =>
    Object.entries(
      products.reduce<Record<string, number>>((acc, p) => {
        acc[p.category] = (acc[p.category] ?? 0) + 1
        return acc
      }, {})
    )
      .map(([key, value]) => ({ name: CATEGORIES[key]?.name ?? key, value, emoji: CATEGORIES[key]?.emoji ?? '📦' }))
      .sort((a, b) => b.value - a.value),
    [products]
  )

  const stockData = useMemo(() =>
    [...products]
      .sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0))
      .slice(0, 10)
      .map(p => ({ name: p.name.length > 22 ? p.name.slice(0, 20) + '…' : p.name, stock: p.stock ?? 0 })),
    [products]
  )

  const marginData = useMemo(() =>
    products
      .filter(p => p.variants.length > 0 && (p.costPrice ?? 0) > 0)
      .map(p => {
        const minPrice = Math.min(...p.variants.map(v => v.price))
        return {
          name: p.name.length > 22 ? p.name.slice(0, 20) + '…' : p.name,
          margen: minPrice > 0 ? Math.round(((minPrice - (p.costPrice ?? 0)) / minPrice) * 100) : 0,
          ganancia: minPrice - (p.costPrice ?? 0),
        }
      })
      .sort((a, b) => b.margen - a.margen)
      .slice(0, 10),
    [products]
  )

  const profitByCategory = useMemo(() =>
    Object.entries(
      products.reduce<Record<string, { ganancia: number; count: number }>>((acc, p) => {
        const minPrice = p.variants.length > 0 ? Math.min(...p.variants.map(v => v.price)) : 0
        const g = minPrice - (p.costPrice ?? 0)
        if (!acc[p.category]) acc[p.category] = { ganancia: 0, count: 0 }
        acc[p.category].ganancia += g * (p.stock ?? 0)
        acc[p.category].count++
        return acc
      }, {})
    )
      .map(([key, v]) => ({ name: CATEGORIES[key]?.name ?? key, ganancia: v.ganancia, count: v.count }))
      .filter(d => d.ganancia > 0)
      .sort((a, b) => b.ganancia - a.ganancia),
    [products]
  )

  const noStockProducts = products.filter(p => p.stock === 0)
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5)

  return (
    <div className="space-y-5">

      {/* ── KPIs fila 1 ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon="📦" label="Total productos" value={metrics.total} sub={`${metrics.active} activos · ${metrics.inactive} inactivos`} color="brand" />
        <KpiCard icon="🏪" label="Unidades en stock" value={metrics.totalUnits.toLocaleString('es-CO')} sub="unidades disponibles" color="brand" />
        <KpiCard icon="⚠️" label="Sin stock" value={metrics.noStock} sub={metrics.lowStock > 0 ? `${metrics.lowStock} con poco stock` : 'ninguno con poco'} color={metrics.noStock > 0 ? 'red' : 'green'} />
        <KpiCard icon="🎯" label="Margen promedio" value={`${metrics.avgMargin.toFixed(1)}%`} sub="ganancia / precio venta" color="brand" />
      </div>

      {/* ── KPIs fila 2 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard icon="💰" label="Valor en inventario" value={fmt(metrics.inventoryValue)} sub="precio venta × unidades" color="brand" large />
        <KpiCard icon="💸" label="Costo total" value={fmt(metrics.totalCost)} sub="precio costo × unidades" color="gray" large />
        <KpiCard
          icon={metrics.grossProfit >= 0 ? '📈' : '📉'}
          label="Ganancia potencial"
          value={fmt(metrics.grossProfit)}
          sub="si se vende todo el stock"
          color={metrics.grossProfit >= 0 ? 'green' : 'red'}
          large
        />
      </div>

      {/* ── Charts fila 1 ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Categorías — Pie */}
        <ChartCard title="Productos por categoría">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                label={({ name, value }) => `${name} (${value})`}
                labelLine={false}
              >
                {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: unknown) => [`${v}`, 'Productos']} />
              <Legend formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Stock por producto — Bar horizontal */}
        <ChartCard title="Stock por producto (Top 10)">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stockData} layout="vertical" margin={{ left: 0, right: 20, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#374151' }} width={110} />
              <Tooltip formatter={(v: unknown) => [`${v}`, 'Unidades']} />
              <Bar dataKey="stock" fill="#7cb342" radius={[0, 4, 4, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Charts fila 2 ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Margen de ganancia */}
        {marginData.length > 0 && (
          <ChartCard title="Margen de ganancia por producto (%)">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={marginData} margin={{ left: 0, right: 16, top: 4, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#374151' }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} unit="%" />
                <Tooltip formatter={(v: unknown) => [`${v}%`, 'Margen']} />
                <Bar dataKey="margen" radius={[4, 4, 0, 0]} maxBarSize={32}>
                  {marginData.map((entry, i) => (
                    <Cell key={i} fill={entry.margen >= 30 ? '#558b2f' : entry.margen >= 15 ? '#7cb342' : '#aed581'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Ganancia potencial por categoría */}
        {profitByCategory.length > 0 && (
          <ChartCard title="Ganancia potencial por categoría (COP)">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={profitByCategory} margin={{ left: 0, right: 16, top: 4, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#374151' }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: unknown) => [fmt(Number(v)), 'Ganancia']} />
                <Bar dataKey="ganancia" fill="#558b2f" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* ── Alertas ── */}
      {(noStockProducts.length > 0 || lowStockProducts.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {noStockProducts.length > 0 && (
            <AlertCard
              title="🔴 Productos agotados"
              items={noStockProducts}
              badgeText="Sin stock"
              badgeClass="bg-red-100 text-red-600"
              borderClass="border-red-100"
              bgClass="bg-red-50"
            />
          )}
          {lowStockProducts.length > 0 && (
            <AlertCard
              title="🟡 Poco stock"
              items={lowStockProducts}
              badgeText={(p) => `${p.stock} uds`}
              badgeClass="bg-amber-100 text-amber-700"
              borderClass="border-amber-100"
              bgClass="bg-amber-50"
            />
          )}
        </div>
      )}
    </div>
  )
}

/* ── Sub-components ── */

function KpiCard({ icon, label, value, sub, color, large }: {
  icon: string; label: string; value: string | number
  sub: string; color: 'brand' | 'green' | 'red' | 'gray'; large?: boolean
}) {
  const bg = { brand: 'bg-brand-50 text-brand-700', green: 'bg-green-50 text-green-700', red: 'bg-red-50 text-red-600', gray: 'bg-gray-100 text-gray-500' }
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-medium mb-1 leading-tight">{label}</p>
          <p className={`font-bold text-gray-900 truncate ${large ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'}`}>{value}</p>
          <p className="text-xs text-gray-400 mt-0.5 leading-tight">{sub}</p>
        </div>
        <span className={`text-xl p-2 rounded-xl flex-shrink-0 ${bg[color]}`}>{icon}</span>
      </div>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 md:p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      {children}
    </div>
  )
}

function AlertCard({ title, items, badgeText, badgeClass, borderClass, bgClass }: {
  title: string
  items: SerializedProduct[]
  badgeText: string | ((p: SerializedProduct) => string)
  badgeClass: string
  borderClass: string
  bgClass: string
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      <div className="space-y-2 max-h-52 overflow-y-auto">
        {items.map(p => (
          <div key={p.id} className={`flex items-center justify-between py-2 px-3 ${bgClass} rounded-xl border ${borderClass}`}>
            <span className="text-sm text-gray-700 truncate flex-1">{p.emoji} {p.name}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${badgeClass}`}>
              {typeof badgeText === 'function' ? badgeText(p) : badgeText}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
