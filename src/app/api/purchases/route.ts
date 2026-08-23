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

    const purchases = await prisma.purchase.findMany({
      where,
      include: { material: true },
      orderBy: { date: 'desc' },
      take: 100,
    })

    return NextResponse.json({ purchases })
  } catch (error) {
    console.error('Erro ao buscar compras:', error)
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
    const { materialId, quantity, unitCost, date } = body

    const total = Number(quantity) * Number(unitCost)

    const purchase = await prisma.purchase.create({
      data: {
        userId: user.id,
        materialId,
        quantity: Number(quantity),
        unitCost: Number(unitCost),
        total,
        date: date ? new Date(date) : new Date(),
      },
      include: { material: true },
    })

    return NextResponse.json({ purchase })
  } catch (error) {
    console.error('Erro ao criar compra:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
