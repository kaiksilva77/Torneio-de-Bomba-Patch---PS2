'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Plus, Users, Building2 } from 'lucide-react'

interface Team {
  id: string
  name: string
}

interface User {
  id: string
  email: string
  name: string
  phone: string
  role: string
  teamId: string
  team: { name: string }
}

export default function AdminPage() {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [showTeamForm, setShowTeamForm] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [userForm, setUserForm] = useState({
    email: '',
    name: '',
    phone: '',
    role: 'LIDER',
    teamId: '',
    password: '',
  })

  useEffect(() => {
    loadTeams()
    loadUsers()
  }, [])

  const loadTeams = async () => {
    const res = await fetch('/api/teams')
    if (res.ok) {
      const data = await res.json()
      setTeams(data.teams || [])
    }
  }

  const loadUsers = async () => {
    const res = await fetch('/api/users')
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users || [])
    }
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: teamName }),
    })
    setTeamName('')
    setShowTeamForm(false)
    loadTeams()
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userForm),
    })
    setUserForm({ email: '', name: '', phone: '', role: 'LIDER', teamId: '', password: '' })
    setShowUserForm(false)
    loadUsers()
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Admin</h1>
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Equipes
                </h3>
                <button
                  onClick={() => setShowTeamForm(!showTeamForm)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nova
                </button>
              </div>
              {showTeamForm && (
                <form onSubmit={handleCreateTeam} className="mb-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      required
                      placeholder="Nome da equipe"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Salvar
                    </button>
                  </div>
                </form>
              )}
              <div className="space-y-2">
                {teams.map(team => (
                  <div key={team.id} className="border rounded-lg p-3 flex justify-between items-center">
                    <span className="font-medium">{team.name}</span>
                  </div>
                ))}
                {teams.length === 0 && (
                  <p className="text-gray-500 text-sm">Nenhuma equipe cadastrada</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Usuários
                </h3>
                <button
                  onClick={() => setShowUserForm(!showUserForm)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Novo
                </button>
              </div>
              {showUserForm && (
                <form onSubmit={handleCreateUser} className="mb-4 space-y-3">
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Nome"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Telefone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  />
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    <option value="LIDER">Líder</option>
                    <option value="PASTOR_EQUIPE">Pastor da Equipe</option>
                    <option value="PASTOR_UNIAO">Pastor da União</option>
                    <option value="COLPORTOR">Colportor</option>
                  </select>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={userForm.teamId}
                    onChange={(e) => setUserForm({ ...userForm, teamId: e.target.value })}
                  >
                    <option value="">Selecione equipe</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                  <input
                    type="password"
                    placeholder="Senha"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Salvar
                  </button>
                </form>
              )}
              <div className="space-y-2">
                {users.map(user => (
                  <div key={user.id} className="border rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{user.name || user.email}</p>
                      <p className="text-sm text-gray-500">{user.role} {user.team ? `- ${user.team.name}` : ''}</p>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-gray-500 text-sm">Nenhum usuário cadastrado</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
