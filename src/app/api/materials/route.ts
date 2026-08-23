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

    const materials = await prisma.material.findMany({
      where: user.role === 'ADMIN' ? {} : { ...where, createdBy: user.id },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ materials })
  } catch (error) {
    console.error('Erro ao buscar materiais:', error)
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
    const { name, priceColportor, priceColportorTithe, pricePublic, buyPrice } = body

    const material = await prisma.material.create({
      data: {
        name,
        priceColportor: Number(priceColportor),
        priceColportorTithe: Number(priceColportorTithe),
        pricePublic: Number(pricePublic),
        buyPrice: Number(buyPrice),
        createdBy: user.id,
      },
    })

    return NextResponse.json({ material })
  } catch (error) {
    console.error('Erro ao criar material:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
