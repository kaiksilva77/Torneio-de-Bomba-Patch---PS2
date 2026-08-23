import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL || 'file:./dev.db' })

const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10)

  const teams = await prisma.team.createMany({
    data: [
      { name: 'Equipe Alpha' },
      { name: 'Equipe Beta' },
    ],
  })

  const alphaTeam = await prisma.team.findFirst({ where: { name: 'Equipe Alpha' } })
  const betaTeam = await prisma.team.findFirst({ where: { name: 'Equipe Beta' } })

  await prisma.user.createMany({
    data: [
      {
        email: 'admin@colportagem.com',
        name: 'Administrador',
        password: hashedPassword,
        role: 'ADMIN',
      },
      {
        email: 'lider.alpha@colportagem.com',
        name: 'Líder Alpha',
        password: hashedPassword,
        role: 'LIDER',
        teamId: alphaTeam?.id,
      },
      {
        email: 'pastor.alpha@colportagem.com',
        name: 'Pastor Alpha',
        password: hashedPassword,
        role: 'PASTOR_EQUIPE',
        teamId: alphaTeam?.id,
      },
      {
        email: 'lider.beta@colportagem.com',
        name: 'Líder Beta',
        password: hashedPassword,
        role: 'LIDER',
        teamId: betaTeam?.id,
      },
      {
        email: 'pastor.beta@colportagem.com',
        name: 'Pastor Beta',
        password: hashedPassword,
        role: 'PASTOR_EQUIPE',
        teamId: betaTeam?.id,
      },
      {
        email: 'uniao@colportagem.com',
        name: 'Pastor da União',
        password: hashedPassword,
        role: 'PASTOR_UNIAO',
      },
      {
        email: 'colp1@colportagem.com',
        name: 'João Colportor',
        password: hashedPassword,
        role: 'COLPORTOR',
        teamId: alphaTeam?.id,
        segment: 'Jovens',
      },
      {
        email: 'colp2@colportagem.com',
        name: 'Maria Colportor',
        password: hashedPassword,
        role: 'COLPORTOR',
        teamId: betaTeam?.id,
        segment: 'Adultos',
      },
    ],
  })

  const users = await prisma.user.findMany()
  const admin = users.find(u => u.role === 'ADMIN')
  const colp1 = users.find(u => u.email === 'colp1@colportagem.com')
  const colp2 = users.find(u => u.email === 'colp2@colportagem.com')

  await prisma.material.createMany({
    data: [
      {
        name: 'Livro: Caminho de Vida',
        priceColportor: 15.0,
        priceColportorTithe: 17.0,
        pricePublic: 25.0,
        buyPrice: 7.5,
        createdBy: admin!.id,
      },
      {
        name: 'Livro: Esperança',
        priceColportor: 20.0,
        priceColportorTithe: 22.0,
        pricePublic: 30.0,
        buyPrice: 10.0,
        createdBy: admin!.id,
      },
      {
        name: 'Revista: Luz',
        priceColportor: 5.0,
        priceColportorTithe: 5.5,
        pricePublic: 8.0,
        buyPrice: 2.5,
        createdBy: admin!.id,
      },
    ],
  })

  const materials = await prisma.material.findMany()
  const livro1 = materials.find(m => m.name === 'Livro: Caminho de Vida')!
  const livro2 = materials.find(m => m.name === 'Livro: Esperança')!
  const revista = materials.find(m => m.name === 'Revista: Luz')!

  if (colp1) {
    await prisma.campaign.create({
      data: {
        userId: colp1.id,
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-09-30'),
        workDays: 20,
        metaVenda: 2000,
        metaCompra: 1000,
        metaOfertas: 300,
        metaHoras: 120,
      },
    })

    await prisma.sale.create({
      data: {
        userId: colp1.id,
        materialId: livro1.id,
        clientName: 'Cliente Exemplo 1',
        quantity: 2,
        paymentMethod: 'DINHEIRO',
        totalValue: 30.0,
        cost: 15.0,
        profit: 15.0,
        tithe: 1.5,
        netProfit: 13.5,
        date: new Date('2025-09-05'),
      },
    })

    await prisma.purchase.create({
      data: {
        userId: colp1.id,
        materialId: livro1.id,
        quantity: 5,
        unitCost: 7.5,
        total: 37.5,
        date: new Date('2025-09-05'),
      },
    })

    await prisma.dailyReport.create({
      data: {
        userId: colp1.id,
        date: new Date('2025-09-05'),
        ofertas: 50,
        horasTrabalhadas: 8,
        valorVendaAvista: 30,
        valorAReceber: 0,
        valorCompra: 37.5,
      },
    })
  }

  if (colp2) {
    await prisma.campaign.create({
      data: {
        userId: colp2.id,
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-09-30'),
        workDays: 18,
        metaVenda: 1500,
        metaCompra: 750,
        metaOfertas: 200,
        metaHoras: 100,
      },
    })

    await prisma.sale.create({
      data: {
        userId: colp2.id,
        materialId: revista.id,
        clientName: 'Cliente Exemplo 2',
        quantity: 3,
        paymentMethod: 'PIX',
        totalValue: 15.0,
        cost: 7.5,
        profit: 7.5,
        tithe: 0.75,
        netProfit: 6.75,
        date: new Date('2025-09-06'),
      },
    })

    await prisma.dailyReport.create({
      data: {
        userId: colp2.id,
        date: new Date('2025-09-06'),
        ofertas: 30,
        horasTrabalhadas: 6,
        valorVendaAvista: 15,
        valorAReceber: 0,
        valorCompra: 0,
      },
    })
  }

  console.log('Seed executado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
