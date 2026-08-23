declare global {
  // eslint-disable-next-line no-var
  var prisma: import('@prisma/client').PrismaClient | undefined
}

import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL || 'file:./dev.db' })

const prisma = global.prisma || new PrismaClient({ adapter })
if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma
