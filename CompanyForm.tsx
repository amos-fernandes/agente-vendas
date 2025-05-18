import React, { useState, useEffect } from 'react';
import { Empresa } from '@/types/empresa'; // Importar o tipo Empresa centralizado

interface CompanyFormProps {
  empresaInicial?: Empresa | null;
  onSubmit: (empresa: Empresa) => void;
  onCancel: () => void;
  isEditMode: boolean;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ empresaInicial, onSubmit, onCancel, isEditMode }) => {
  const [empresa, setEmpresa] = useState<Empresa>(
    empresaInicial || { nome: '', setor: '', localizacao: '', numeroFuncionarios: 0, website: '' }
  );

  useEffect(() => {
    if (empresaInicial) {
      setEmpresa(empresaInicial);
    } else {
      setEmpresa({ nome: '', setor: '', localizacao: '', numeroFuncionarios: 0, website: '' });
    }
  }, [empresaInicial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmpresa(prev => ({ ...prev, [name]: name === 'numeroFuncionarios' ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(empresa);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-xl font-semibold text-gray-700">{isEditMode ? 'Editar Empresa' : 'Adicionar Nova Empresa'}</h2>
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
        <input
          type="text"
          name="nome"
          id="nome"
          value={empresa.nome}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="setor" className="block text-sm font-medium text-gray-700">Setor</label>
        <input
          type="text"
          name="setor"
          id="setor"
          value={empresa.setor}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="localizacao" className="block text-sm font-medium text-gray-700">Localização</label>
        <input
          type="text"
          name="localizacao"
          id="localizacao"
          value={empresa.localizacao}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="numeroFuncionarios" className="block text-sm font-medium text-gray-700">Número de Funcionários</label>
        <input
          type="number"
          name="numeroFuncionarios"
          id="numeroFuncionarios"
          value={empresa.numeroFuncionarios || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
        <input
          type="url"
          name="website"
          id="website"
          value={empresa.website || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isEditMode ? 'Salvar Alterações' : 'Adicionar Empresa'}
        </button>
      </div>
    </form>
  );
};

export default CompanyForm;

