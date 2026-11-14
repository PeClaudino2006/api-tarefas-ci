import { app } from './app.js';
import { iniciarBanco } from './db.js';

const PORT = Number(process.env.PORT) || 3000;

async function main(): Promise<void> {
  await iniciarBanco();
  app.listen(PORT, () => {
    console.log(`Servidor ouvindo em http://localhost:${PORT}`);
  });
}

main().catch((erro) => {
  console.error('Falha ao iniciar a aplicação:', erro);
  process.exit(1);
});
