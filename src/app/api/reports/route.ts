import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const where = user.role === 'COLPORTOR'
      ? { userId: user.id }
      : user.teamId
        ? { user: { teamId: user.teamId } }
        : {}

    const reports = await prisma.dailyReport.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 100,
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Erro ao buscar relatórios:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { date, ofertas, horasTrabalhadas, valorVendaAvista, valorAReceber, valorCompra } = body

    const report = await prisma.dailyReport.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: new Date(date).toISOString().split('T')[0],
        },
      },
      update: {
        ofertas: Number(ofertas),
        horasTrabalhadas: Number(horasTrabalhadas),
        valorVendaAvista: Number(valorVendaAvista),
        valorAReceber: Number(valorAReceber),
        valorCompra: Number(valorCompra),
      },
      create: {
        userId: user.id,
        date: new Date(date),
        ofertas: Number(ofertas),
        horasTrabalhadas: Number(horasTrabalhadas),
        valorVendaAvista: Number(valorVendaAvista),
        valorAReceber: Number(valorAReceber),
        valorCompra: Number(valorCompra),
      },
    })

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Erro ao criar relatório:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
