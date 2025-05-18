// Definição centralizada do tipo Empresa
export interface Empresa {
  id?: number; // ID é opcional, pois não existe ao criar uma nova empresa
  nome: string;
  setor?: string;
  localizacao?: string;
  numeroFuncionarios?: number;
  website?: string;
  // Adicionar createdAt e updatedAt se forem relevantes e retornados pela API
}

