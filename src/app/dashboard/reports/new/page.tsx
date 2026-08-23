'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function NewReportPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    ofertas: '0',
    horasTrabalhadas: '0',
    valorVendaAvista: '0',
    valorAReceber: '0',
    valorCompra: '0',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Erro ao criar relatório')
        return
      }

      router.push('/dashboard')
    } catch {
      alert('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-3 text-gray-600 hover:text-gray-900 p-2 -ml-2"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-lg font-bold text-gray-900">Novo Relatório</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input
              type="date"
              required
              className="input-mobile"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ofertas (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              className="input-mobile"
              value={formData.ofertas}
              onChange={(e) => setFormData({ ...formData, ofertas: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horas Trabalhadas</label>
            <input
              type="number"
              step="0.1"
              required
              className="input-mobile"
              value={formData.horasTrabalhadas}
              onChange={(e) => setFormData({ ...formData, horasTrabalhadas: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venda à vista (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              className="input-mobile"
              value={formData.valorVendaAvista}
              onChange={(e) => setFormData({ ...formData, valorVendaAvista: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor a receber (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              className="input-mobile"
              value={formData.valorAReceber}
              onChange={(e) => setFormData({ ...formData, valorAReceber: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Compra (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              className="input-mobile"
              value={formData.valorCompra}
              onChange={(e) => setFormData({ ...formData, valorCompra: e.target.value })}
            />
          </div>
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-mobile flex-1 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-mobile flex-1 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
