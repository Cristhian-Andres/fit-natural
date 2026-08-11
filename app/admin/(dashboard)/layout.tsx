import AdminNav from '@/components/admin/AdminNav'

export const metadata = { title: 'Admin — Fit Natural' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      {/* pt-14 on mobile to clear the fixed top bar */}
      <main className="flex-1 overflow-auto p-4 pt-20 md:pt-0 md:p-8">
        {children}
      </main>
    </div>
  )
}
