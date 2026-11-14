export function validarTitulo(titulo: unknown): string | null {
  if (typeof titulo !== 'string') {
    return 'O título é obrigatório e deve ser um texto.';
  }
  const limpo = titulo.trim();
  if (limpo.length === 0) {
    return 'O título não pode ser vazio.';
  }
  if (limpo.length > 100) {
    return 'O título deve ter no máximo 100 caracteres.';
  }
  return null;
}

export function normalizarTitulo(titulo: string): string {
  return titulo.trim();
}
