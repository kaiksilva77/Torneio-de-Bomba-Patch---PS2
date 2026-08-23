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

    const sales = await prisma.sale.findMany({
      where,
      include: { material: true },
      orderBy: { date: 'desc' },
      take: 100,
    })

    return NextResponse.json({ sales })
  } catch (error) {
    console.error('Erro ao buscar vendas:', error)
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
    const { clientName, clientContact, materialId, quantity, paymentMethod, parcelCount, cardFeePercent, totalValue, date } = body

    const material = materialId ? await prisma.material.findUnique({ where: { id: materialId } }) : null
    const cost = material ? material.buyPrice * Number(quantity) : 0
    const profit = Number(totalValue) - cost
    const tithe = profit * 0.1
    const netProfit = profit - tithe

    const sale = await prisma.sale.create({
      data: {
        userId: user.id,
        clientName,
        clientContact,
        materialId: materialId || null,
        quantity: Number(quantity),
        paymentMethod: paymentMethod as any,
        parcelCount: Number(parcelCount) || 1,
        cardFeePercent: Number(cardFeePercent) || 0,
        totalValue: Number(totalValue),
        cost,
        profit,
        tithe,
        netProfit,
        date: date ? new Date(date) : new Date(),
      },
      include: { material: true },
    })

    return NextResponse.json({ sale })
  } catch (error) {
    console.error('Erro ao criar venda:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
