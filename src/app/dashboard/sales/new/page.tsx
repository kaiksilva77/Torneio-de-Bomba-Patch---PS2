'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface Material {
  id: string
  name: string
  priceColportor: number
}

export default function NewSalePage() {
  const router = useRouter()
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    clientName: '',
    clientContact: '',
    materialId: '',
    quantity: '1',
    paymentMethod: 'DINHEIRO',
    parcelCount: '1',
    cardFeePercent: '0',
    totalValue: '',
    date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetch('/api/materials')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setMaterials(data.materials || []))
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Erro ao criar venda')
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
              <h1 className="text-lg font-bold text-gray-900">Nova Venda</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
            <input
              type="text"
              required
              className="input-mobile"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contato</label>
            <input
              type="text"
              className="input-mobile"
              value={formData.clientContact}
              onChange={(e) => setFormData({ ...formData, clientContact: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
            <select
              required
              className="input-mobile"
              value={formData.materialId}
              onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
            >
              <option value="">Selecione</option>
              {materials.map(m => (
                <option key={m.id} value={m.id}>{m.name} - R$ {m.priceColportor.toFixed(2)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
            <input
              type="number"
              required
              min="1"
              className="input-mobile"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
            <select
              required
              className="input-mobile"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            >
              <option value="DINHEIRO">Dinheiro</option>
              <option value="CARTAO_VISTA">Cartão à vista</option>
              <option value="CARTAO_PARCELADO">Cartão parcelado</option>
              <option value="PIX">PIX</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>
          {(formData.paymentMethod === 'CARTAO_PARCELADO') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parcelas (até 12x)</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  className="input-mobile"
                  value={formData.parcelCount}
                  onChange={(e) => setFormData({ ...formData, parcelCount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Acréscimo cartão (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className="input-mobile"
                  value={formData.cardFeePercent}
                  onChange={(e) => setFormData({ ...formData, cardFeePercent: e.target.value })}
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              className="input-mobile"
              value={formData.totalValue}
              onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
            />
          </div>
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
