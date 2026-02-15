import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma = globalForPrisma.prisma;

if (!prisma) {
    prisma = new PrismaClient();
} else {
    // Check if new models are missing (hacky check for dev environment)
    // This helps avoid restarting the server when new models are added
    if (!('role' in prisma)) {
        console.log('Detected stale Prisma client, recreating...');
        prisma = new PrismaClient();
    }
}

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export { prisma };
export default prisma;
