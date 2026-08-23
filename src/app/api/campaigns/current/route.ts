import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const campaign = await prisma.campaign.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Erro ao buscar campanha:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COLPORTOR') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const { startDate, endDate, workDays, metaVenda, metaCompra, metaOfertas, metaHoras } = body

    const campaign = await prisma.campaign.create({
      data: {
        userId: user.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        workDays: Number(workDays),
        metaVenda: Number(metaVenda),
        metaCompra: Number(metaCompra),
        metaOfertas: Number(metaOfertas),
        metaHoras: Number(metaHoras),
      },
    })

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Erro ao criar campanha:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
