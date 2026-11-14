import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('A variável de ambiente DATABASE_URL não foi definida.');
}

export const pool = new Pool({ connectionString });

export async function iniciarBanco(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tarefas (
      id SERIAL PRIMARY KEY,
      titulo VARCHAR(100) NOT NULL,
      concluida BOOLEAN NOT NULL DEFAULT FALSE,
      criada_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}
