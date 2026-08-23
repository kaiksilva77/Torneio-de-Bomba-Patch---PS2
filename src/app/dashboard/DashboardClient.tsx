'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, DollarSign, ShoppingCart, ClipboardList, Calendar, Menu, X } from 'lucide-react'

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
  const [menuOpen, setMenuOpen] = useState(false)
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

  const tabs = [
    { key: 'overview', label: 'Visão Geral' },
    { key: 'campaign', label: 'Campanha' },
    { key: 'sales', label: 'Vendas' },
    { key: 'purchases', label: 'Compras' },
    { key: 'reports', label: 'Relatórios' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14">
            <div className="flex items-center">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="mr-3 text-gray-600 hover:text-gray-900 p-2 -ml-2"
              >
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <h1 className="text-lg font-bold text-gray-900">Colportagem</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 hidden sm:block">{user.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-red-600 hover:text-red-800 p-2"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="bg-white border-b sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key)
                  setMenuOpen(false)
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  activeTab === tab.key
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 pb-24">
        {loading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="card-mobile">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-3 w-0 flex-1">
                        <dl>
                          <dt className="text-xs font-medium text-gray-500 truncate">Vendas</dt>
                          <dd className="text-base font-medium text-gray-900">R$ {totalVendas.toFixed(2)}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="card-mobile">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ShoppingCart className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-3 w-0 flex-1">
                        <dl>
                          <dt className="text-xs font-medium text-gray-500 truncate">Compras</dt>
                          <dd className="text-base font-medium text-gray-900">R$ {totalCompras.toFixed(2)}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="card-mobile">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ClipboardList className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-3 w-0 flex-1">
                        <dl>
                          <dt className="text-xs font-medium text-gray-500 truncate">Ofertas</dt>
                          <dd className="text-base font-medium text-gray-900">R$ {totalOfertas.toFixed(2)}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="card-mobile">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Calendar className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-3 w-0 flex-1">
                        <dl>
                          <dt className="text-xs font-medium text-gray-500 truncate">Horas</dt>
                          <dd className="text-base font-medium text-gray-900">{totalHoras.toFixed(1)}h</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {campaign && (
                  <div className="card-mobile">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Meta Diária de Venda</h3>
                    <div className="text-2xl font-bold text-gray-900">
                      R$ {dailySaleMeta.toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Meta total: R$ {campaign.metaVenda.toFixed(2)} / {campaign.workDays} dias
                    </p>
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${Math.min((totalVendas / campaign.metaVenda) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {((totalVendas / campaign.metaVenda) * 100).toFixed(1)}% da meta atingida
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'campaign' && (
              <div className="card-mobile">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Campanha</h3>
                {campaign ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Início</label>
                      <p className="text-sm text-gray-900">
                        {new Date(campaign.startDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Fim</label>
                      <p className="text-sm text-gray-900">
                        {new Date(campaign.endDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Dias de trabalho</label>
                      <p className="text-sm text-gray-900">{campaign.workDays}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Meta Venda Total</label>
                      <p className="text-sm text-gray-900">R$ {campaign.metaVenda.toFixed(2)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Nenhuma campanha configurada</p>
                )}
              </div>
            )}

            {activeTab === 'sales' && (
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/dashboard/sales/new')}
                  className="btn-mobile w-full text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Nova Venda
                </button>
                <div className="space-y-3">
                  {sales.map(sale => (
                    <div key={sale.id} className="card-mobile">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{sale.clientName}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(sale.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          sale.status === 'ATIVA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {sale.status}
                        </span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-lg font-bold text-gray-900">R$ {sale.totalValue.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{sale.paymentMethod}</p>
                      </div>
                    </div>
                  ))}
                  {sales.length === 0 && (
                    <div className="card-mobile text-center">
                      <p className="text-gray-500 text-sm">Nenhuma venda registrada</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'purchases' && (
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/dashboard/purchases/new')}
                  className="btn-mobile w-full text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Nova Compra
                </button>
                <div className="space-y-3">
                  {purchases.map(purchase => (
                    <div key={purchase.id} className="card-mobile">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {purchase.material?.name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Qtd: {purchase.quantity} • {new Date(purchase.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-gray-900">R$ {purchase.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  {purchases.length === 0 && (
                    <div className="card-mobile text-center">
                      <p className="text-gray-500 text-sm">Nenhuma compra registrada</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/dashboard/reports/new')}
                  className="btn-mobile w-full text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Novo Relatório
                </button>
                <div className="space-y-3">
                  {reports.map(report => (
                    <div key={report.id} className="card-mobile">
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        {new Date(report.date).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-xs text-gray-500">Ofertas:</span>
                          <p className="font-medium">R$ {report.ofertas.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Horas:</span>
                          <p className="font-medium">{report.horasTrabalhadas.toFixed(1)}h</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Venda à vista:</span>
                          <p className="font-medium">R$ {report.valorVendaAvista.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">A receber:</span>
                          <p className="font-medium">R$ {report.valorAReceber.toFixed(2)}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-xs text-gray-500">Compra:</span>
                          <p className="font-medium">R$ {report.valorCompra.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {reports.length === 0 && (
                    <div className="card-mobile text-center">
                      <p className="text-gray-500 text-sm">Nenhum relatório registrado</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:hidden z-50">
        <div className="grid grid-cols-5">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center py-2 px-1 text-xs ${
                activeTab === tab.key
                  ? 'text-indigo-600'
                  : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              <span className="text-lg mb-0.5">
                {tab.key === 'overview' && '📊'}
                {tab.key === 'campaign' && '📅'}
                {tab.key === 'sales' && '💰'}
                {tab.key === 'purchases' && '🛒'}
                {tab.key === 'reports' && '📋'}
              </span>
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
