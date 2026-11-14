import { describe, expect, it } from 'vitest';
import { normalizarTitulo, validarTitulo } from '../src/validacao.js';

describe('validarTitulo', () => {
  it('aceita um título válido', () => {
    expect(validarTitulo('Estudar CI')).toBeNull();
  });
  it('rejeita valor que não é texto', () => {
    expect(validarTitulo(123)).not.toBeNull();
  });
  it('rejeita título vazio ou só com espaços', () => {
    expect(validarTitulo('   ')).toBe('O título não pode ser vazio.');
  });
  it('rejeita título com mais de 100 caracteres', () => {
    expect(validarTitulo('a'.repeat(101))).toBe(
      'O título deve ter no máximo 100 caracteres.',
    );
  });
});

describe('normalizarTitulo', () => {
  it('remove espaços das pontas', () => {
    expect(normalizarTitulo('  Estudar  ')).toBe('Estudar');
  });
});
