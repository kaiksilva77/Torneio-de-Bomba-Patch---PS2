'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User, Calendar, DollarSign, ShoppingCart, ClipboardList } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  teamId: string | null
  segment: string | null
}

interface Campaign {
  id: string
  startDate: string
  endDate: string
  workDays: number
  metaVenda: number
  metaCompra: number
  metaOfertas: number
  metaHoras: number
}

interface Sale {
  id: string
  clientName: string
  totalValue: number
  paymentMethod: string
  status: string
  date: string
}

interface Purchase {
  id: string
  total: number
  quantity: number
  date: string
  material: { name: string }
}

interface Report {
  id: string
  date: string
  ofertas: number
  horasTrabalhadas: number
  valorVendaAvista: number
  valorAReceber: number
  valorCompra: number
}

export default function DashboardClient({ user }: { user: User }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [campRes, salesRes, purchasesRes, reportsRes] = await Promise.all([
        fetch('/api/campaigns/current'),
        fetch('/api/sales'),
        fetch('/api/purchases'),
        fetch('/api/reports'),
      ])

      if (campRes.ok) {
        const data = await campRes.json()
        setCampaign(data.campaign)
      }
      if (salesRes.ok) {
        const data = await salesRes.json()
        setSales(data.sales || [])
      }
      if (purchasesRes.ok) {
        const data = await purchasesRes.json()
        setPurchases(data.purchases || [])
      }
      if (reportsRes.ok) {
        const data = await reportsRes.json()
        setReports(data.reports || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const totalVendas = sales
    .filter(s => s.status === 'ATIVA')
    .reduce((sum, s) => sum + s.totalValue, 0)

  const totalCompras = purchases.reduce((sum, p) => sum + p.total, 0)
  const totalOfertas = reports.reduce((sum, r) => sum + r.ofertas, 0)
  const totalHoras = reports.reduce((sum, r) => sum + r.horasTrabalhadas, 0)

  const dailySaleMeta = campaign?.metaVenda && campaign?.workDays 
    ? campaign.metaVenda / campaign.workDays 
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Colportagem</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.name}</span>
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
        <div className="mb-6">
          <nav className="flex space-x-4">
            {[
              { key: 'overview', label: 'Visão Geral' },
              { key: 'campaign', label: 'Campanha' },
              { key: 'sales', label: 'Vendas' },
              { key: 'purchases', label: 'Compras' },
              { key: 'reports', label: 'Relatórios' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === tab.key
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        {loading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Vendas</dt>
                            <dd className="text-lg font-medium text-gray-900">R$ {totalVendas.toFixed(2)}</dd>
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
                            <dd className="text-lg font-medium text-gray-900">R$ {totalCompras.toFixed(2)}</dd>
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
                            <dd className="text-lg font-medium text-gray-900">R$ {totalOfertas.toFixed(2)}</dd>
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
                            <dt className="text-sm font-medium text-gray-500 truncate">Horas Trabalhadas</dt>
                            <dd className="text-lg font-medium text-gray-900">{totalHoras.toFixed(1)}h</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {campaign && (
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Meta Diária de Venda</h3>
                      <div className="mt-2">
                        <div className="text-3xl font-bold text-gray-900">
                          R$ {dailySaleMeta.toFixed(2)}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Meta total: R$ {campaign.metaVenda.toFixed(2)} / {campaign.workDays} dias
                        </p>
                        <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-indigo-600 h-2.5 rounded-full"
                            style={{ width: `${Math.min((totalVendas / campaign.metaVenda) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {((totalVendas / campaign.metaVenda) * 100).toFixed(1)}% da meta atingida
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'campaign' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Campanha</h3>
                  {campaign ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Início</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(campaign.startDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Fim</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(campaign.endDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Dias de trabalho</label>
                        <p className="mt-1 text-sm text-gray-900">{campaign.workDays}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Meta Venda Total</label>
                        <p className="mt-1 text-sm text-gray-900">R$ {campaign.metaVenda.toFixed(2)}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Nenhuma campanha configurada</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'sales' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Vendas</h3>
                    <button
                      onClick={() => router.push('/dashboard/sales/new')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Nova Venda
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagamento</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sales.map(sale => (
                          <tr key={sale.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.clientName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {sale.totalValue.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.paymentMethod}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                sale.status === 'ATIVA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {sale.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(sale.date).toLocaleDateString('pt-BR')}
                            </td>
                          </tr>
                        ))}
                        {sales.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                              Nenhuma venda registrada
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'purchases' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Compras</h3>
                    <button
                      onClick={() => router.push('/dashboard/purchases/new')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Nova Compra
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtd</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {purchases.map(purchase => (
                          <tr key={purchase.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {purchase.material?.name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {purchase.total.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(purchase.date).toLocaleDateString('pt-BR')}
                            </td>
                          </tr>
                        ))}
                        {purchases.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                              Nenhuma compra registrada
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Relatórios Diários</h3>
                    <button
                      onClick={() => router.push('/dashboard/reports/new')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Novo Relatório
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ofertas</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horas</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venda à vista</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">A receber</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compra</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reports.map(report => (
                          <tr key={report.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(report.date).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {report.ofertas.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.horasTrabalhadas.toFixed(1)}h</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {report.valorVendaAvista.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {report.valorAReceber.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {report.valorCompra.toFixed(2)}</td>
                          </tr>
                        ))}
                        {reports.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                              Nenhum relatório registrado
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
