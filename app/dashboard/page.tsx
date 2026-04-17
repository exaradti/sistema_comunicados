import { AdminLayout } from '@/components/layout/admin_layout'

export default function DashboardPage() {
  return (
    <AdminLayout>
      <div className="stack">
        <h1 className="page_title">Dashboard</h1>
        <div className="grid_2">
          <div className="card">Use o menu para gerenciar funcionários, setores, unidades e comunicados.</div>
          <div className="card">A página pública de confirmação usa /confirmacao/[token].</div>
        </div>
      </div>
    </AdminLayout>
  )
}
