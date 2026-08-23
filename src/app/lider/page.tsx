'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Users, DollarSign, ShoppingCart, ClipboardList, Calendar } from 'lucide-react'

interface TeamStats {
  teamName: string
  totalVendas: number
  totalCompras: number
  totalOfertas: number
  totalHoras: number
  colportores: number
}

export default function LiderPage() {
  const router = useRouter()
  const [stats, setStats] = useState<TeamStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTeamStats()
  }, [])

  const loadTeamStats = async () => {
    try {
      const [salesRes, purchasesRes, reportsRes, usersRes] = await Promise.all([
        fetch('/api/sales'),
        fetch('/api/purchases'),
        fetch('/api/reports'),
        fetch('/api/users'),
      ])

      const sales = (await salesRes.json()).sales || []
      const purchases = (await purchasesRes.json()).purchases || []
      const reports = (await reportsRes.json()).reports || []
      const users = (await usersRes.json()).users || []

      const teamMap = new Map<string, TeamStats>()

      users.filter((u: any) => u.role === 'COLPORTOR').forEach((user: any) => {
        const teamName = user.team?.name || 'Sem equipe'
        if (!teamMap.has(teamName)) {
          teamMap.set(teamName, {
            teamName,
            totalVendas: 0,
            totalCompras: 0,
            totalOfertas: 0,
            totalHoras: 0,
            colportores: 0,
          })
        }
        teamMap.get(teamName)!.colportores++
      })

      sales.filter((s: any) => s.status === 'ATIVA').forEach((sale: any) => {
        const teamName = sale.user?.team?.name || 'Sem equipe'
        const stat = teamMap.get(teamName)
        if (stat) stat.totalVendas += sale.totalValue
      })

      purchases.forEach((purchase: any) => {
        const teamName = purchase.user?.team?.name || 'Sem equipe'
        const stat = teamMap.get(teamName)
        if (stat) stat.totalCompras += purchase.total
      })

      reports.forEach((report: any) => {
        const teamName = report.user?.team?.name || 'Sem equipe'
        const stat = teamMap.get(teamName)
        if (stat) {
          stat.totalOfertas += report.ofertas
          stat.totalHoras += report.horasTrabalhadas
        }
      })

      setStats(Array.from(teamMap.values()))
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Painel de Liderança</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-red-600 hover:text-red-800"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Vendas</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      R$ {stats.reduce((sum, s) => sum + s.totalVendas, 0).toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Compras</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      R$ {stats.reduce((sum, s) => sum + s.totalCompras, 0).toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClipboardList className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Ofertas</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      R$ {stats.reduce((sum, s) => sum + s.totalOfertas, 0).toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Horas</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.reduce((sum, s) => sum + s.totalHoras, 0).toFixed(1)}h
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Desempenho por Equipe</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipe</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Colportores</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compras</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ofertas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horas</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.map((stat, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stat.teamName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.colportores}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {stat.totalVendas.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {stat.totalCompras.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {stat.totalOfertas.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.totalHoras.toFixed(1)}h</td>
                    </tr>
                  ))}
                  {stats.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        Nenhuma equipe encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
