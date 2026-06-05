import AdminNav from '@/components/admin/AdminNav'

export const metadata = { title: 'Admin — Fit Natural' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <main className="flex-1 overflow-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  )
}
