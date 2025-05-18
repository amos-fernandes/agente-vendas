import React from 'react';
import { Empresa } from '@/types/empresa'; // Importar o tipo Empresa centralizado

interface CompanyListProps {
  empresas: Empresa[];
  onEdit: (empresa: Empresa) => void;
  onDelete: (id: number) => void;
}

const CompanyList: React.FC<CompanyListProps> = ({ empresas, onEdit, onDelete }) => {
  if (empresas.length === 0) {
    return <p className="text-gray-600">Nenhuma empresa cadastrada ainda.</p>;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
      <ul className="divide-y divide-gray-200">
        {empresas.map((empresa) => (
          <li key={empresa.id} className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="truncate">
                <p className="text-lg font-medium text-indigo-600 truncate">{empresa.nome}</p>
                <p className="text-sm text-gray-500 truncate">{empresa.setor || 'Setor não informado'} - {empresa.localizacao || 'Localização não informada'}</p>
              </div>
              <div className="ml-2 flex-shrink-0 flex space-x-2">
                <button
                  onClick={() => onEdit(empresa)}
                  className="px-3 py-1 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (empresa.id !== undefined) {
                      onDelete(empresa.id);
                    }
                  }}
                  className="px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Excluir
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CompanyList;

