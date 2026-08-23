import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ teams })
  } catch (error) {
    console.error('Erro ao buscar equipes:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name } = body

    const team = await prisma.team.create({
      data: { name },
    })

    return NextResponse.json({ team })
  } catch (error) {
    console.error('Erro ao criar equipe:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
