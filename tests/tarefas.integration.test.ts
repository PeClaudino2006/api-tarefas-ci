import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { iniciarBanco, pool } from '../src/db.js';

describe('API de tarefas com PostgreSQL', () => {
  beforeAll(async () => {
    await iniciarBanco();
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE TABLE tarefas RESTART IDENTITY');
  });

  afterAll(async () => {
    await pool.end();
  });

  it('GET /health confirma a conexão com o banco', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', banco: 'conectado' });
  });

  it('POST /tarefas cria a tarefa e grava no banco', async () => {
    const res = await request(app)
      .post('/tarefas')
      .send({ titulo: 'Estudar CI' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ titulo: 'Estudar CI', concluida: false });

    const { rows } = await pool.query('SELECT titulo FROM tarefas');
    expect(rows).toHaveLength(1);
    expect(rows[0].titulo).toBe('Estudar CI');
  });

  it('POST /tarefas com título vazio retorna 400', async () => {
    const res = await request(app).post('/tarefas').send({ titulo: '  ' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ erro: 'O título não pode ser vazio.' });
  });

  it('GET /tarefas lista as tarefas gravadas', async () => {
    await pool.query('INSERT INTO tarefas (titulo) VALUES ($1), ($2)', [
      'Primeira',
      'Segunda',
    ]);
    const res = await request(app).get('/tarefas');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].titulo).toBe('Primeira');
  });

  it('PATCH /tarefas/:id/concluir marca a tarefa como concluída', async () => {
    const criada = await pool.query(
      'INSERT INTO tarefas (titulo) VALUES ($1) RETURNING id',
      ['Concluir'],
    );
    const id = criada.rows[0].id;
    const res = await request(app).patch(`/tarefas/${id}/concluir`);
    expect(res.status).toBe(200);
    expect(res.body.concluida).toBe(true);
  });

  it('DELETE /tarefas/:id remove a tarefa', async () => {
    const criada = await pool.query(
      'INSERT INTO tarefas (titulo) VALUES ($1) RETURNING id',
      ['Apagar'],
    );
    const id = criada.rows[0].id;
    const res = await request(app).delete(`/tarefas/${id}`);
    expect(res.status).toBe(204);

    const { rows } = await pool.query('SELECT id FROM tarefas');
    expect(rows).toHaveLength(0);
  });

  it('GET /tarefas/:id inexistente retorna 404', async () => {
    const res = await request(app).get('/tarefas/9999');
    expect(res.status).toBe(404);
  });
});
