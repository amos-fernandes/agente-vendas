import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import leadRoutes from './routes'; // Rotas de leads
import campaignRoutes from './campaignRoutes'; // Rotas de campanhas de e-mail
import socialMediaRoutes from './socialMediaRoutes'; // Rotas de redes sociais
import videoRoutes from './videoRoutes'; // Importar as rotas de vídeo

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

app.use(express.json());

// Rota de teste
app.get('/', (req: Request, res: Response) => {
  res.send('Servidor Express + TypeScript está rodando!');
});

// Usar as rotas definidas
app.use('/api/leads', leadRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/social', socialMediaRoutes);
app.use('/api/videos', videoRoutes); // Adicionar rotas de vídeo

async function main() {
  // Lógica de inicialização, se necessário
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    // Desconexão do Prisma Client é gerenciada no graceful shutdown
  });

const server = app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server')
  server.close(async () => {
    console.log('HTTP server closed')
    await prisma.$disconnect()
    console.log('Prisma client disconnected')
    process.exit(0)
  })
})

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server')
  server.close(async () => {
    console.log('HTTP server closed')
    await prisma.$disconnect()
    console.log('Prisma client disconnected')
    process.exit(0)
  })
})