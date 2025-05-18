import React, { useState, useEffect, useCallback } from 'react';
import CompanyList from "@/features/leads/components/CompanyList";
import CompanyForm from "@/features/leads/components/CompanyForm";
import LeadsOverview from "@/features/leads/components/LeadsOverview";
import { empresaService } from "@/services/apiService";
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Empresa } from '@/types/empresa'; // Importar o tipo Empresa centralizado

const LeadsPage: React.FC = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarEmpresas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await empresaService.getAll();
      setEmpresas(data || []); // Garante que seja um array
    } catch (err) {
      console.error('Falha ao carregar empresas:', err);
      setError('Não foi possível carregar as empresas. Tente novamente mais tarde.');
      setEmpresas([]); // Limpa empresas em caso de erro
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    carregarEmpresas();
  }, [carregarEmpresas]);

  const handleAbrirFormNovaEmpresa = () => {
    setEmpresaSelecionada(null);
    setIsFormOpen(true);
  };

  const handleAbrirFormEditarEmpresa = (empresa: Empresa) => {
    setEmpresaSelecionada(empresa);
    setIsFormOpen(true);
  };

  const handleFecharForm = () => {
    setIsFormOpen(false);
    setEmpresaSelecionada(null);
  };

  const handleSalvarEmpresa = async (empresaParaSalvar: Omit<Empresa, 'id'> | Empresa) => {
    try {
      if ('id' in empresaParaSalvar && empresaParaSalvar.id) {
        await empresaService.update(empresaParaSalvar.id, empresaParaSalvar);
      } else {
        await empresaService.create(empresaParaSalvar);
      }
      handleFecharForm();
      carregarEmpresas(); // Recarrega a lista após salvar
    } catch (err) {
      console.error('Falha ao salvar empresa:', err);
      setError('Não foi possível salvar a empresa. Verifique os dados e tente novamente.');
      // Não fechar o form em caso de erro para o usuário poder corrigir
    }
  };

  const handleDeletarEmpresa = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      try {
        await empresaService.delete(id);
        carregarEmpresas(); // Recarrega a lista após deletar
      } catch (err) {
        console.error('Falha ao deletar empresa:', err);
        setError('Não foi possível excluir a empresa.');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Gerenciamento de Leads</h1>
        <Button onClick={handleAbrirFormNovaEmpresa} variant="default">
          <PlusCircle size={18} className="mr-2" />
          Adicionar Empresa
        </Button>
      </div>

      {isFormOpen && (
        <div className="mb-6">
          <CompanyForm
            empresaInicial={empresaSelecionada}
            onSubmit={handleSalvarEmpresa}
            onCancel={handleFecharForm}
            isEditMode={!!empresaSelecionada}
          />
        </div>
      )}

      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">Erro: {error}</p>}
      
      <LeadsOverview />

      {isLoading ? (
        <p className="text-gray-600 mt-6">Carregando empresas...</p>
      ) : (
        <CompanyList
          empresas={empresas}
          onEdit={handleAbrirFormEditarEmpresa}
          onDelete={handleDeletarEmpresa}
        />
      )}
    </div>
  );
};

export default LeadsPage;

