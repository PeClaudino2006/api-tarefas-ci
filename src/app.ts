import express from 'express';
import { pool } from './db.js';
import { normalizarTitulo, validarTitulo } from './validacao.js';

export const app = express();
app.use(express.json());

const COLUNAS = 'id, titulo, concluida, criada_em';

app.get('/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.status(200).json({ status: 'ok', banco: 'conectado' });
});

app.get('/tarefas', async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT ${COLUNAS} FROM tarefas ORDER BY id`,
  );
  res.status(200).json(rows);
});

app.get('/tarefas/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ erro: 'ID inválido.' });
    return;
  }
  const { rows } = await pool.query(
    `SELECT ${COLUNAS} FROM tarefas WHERE id = $1`,
    [id],
  );
  if (rows.length === 0) {
    res.status(404).json({ erro: 'Tarefa não encontrada.' });
    return;
  }
  res.status(200).json(rows[0]);
});

app.post('/tarefas', async (req, res) => {
  const titulo: unknown = req.body?.titulo;
  const erro = validarTitulo(titulo);
  if (erro) {
    res.status(400).json({ erro });
    return;
  }
  const { rows } = await pool.query(
    `INSERT INTO tarefas (titulo) VALUES ($1) RETURNING ${COLUNAS}`,
    [normalizarTitulo(titulo as string)],
  );
  res.status(201).json(rows[0]);
});

app.patch('/tarefas/:id/concluir', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ erro: 'ID inválido.' });
    return;
  }
  const { rows } = await pool.query(
    `UPDATE tarefas SET concluida = TRUE WHERE id = $1 RETURNING ${COLUNAS}`,
    [id],
  );
  if (rows.length === 0) {
    res.status(404).json({ erro: 'Tarefa não encontrada.' });
    return;
  }
  res.status(200).json(rows[0]);
});

app.delete('/tarefas/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ erro: 'ID inválido.' });
    return;
  }
  const { rowCount } = await pool.query('DELETE FROM tarefas WHERE id = $1', [
    id,
  ]);
  if (rowCount === 0) {
    res.status(404).json({ erro: 'Tarefa não encontrada.' });
    return;
  }
  res.status(204).send();
});

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  },
);
