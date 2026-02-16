
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  // This should compile if types are correct
  const acc = await prisma.user.findFirst();
  const prop = await prisma.property.findFirst();
  
  // This should fail
  // @ts-expect-error
  const fail = await prisma.nonExistentModel.findFirst();
}
