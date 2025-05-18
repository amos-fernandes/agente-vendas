import axios, { AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api'; // Configure a URL base da sua API backend

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors para tratamento de erros ou tokens de autenticação podem ser adicionados aqui
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Log detalhado do erro
    if (error.response) {
      // A requisição foi feita e o servidor respondeu com um status code
      // que cai fora do range de 2xx
      console.error('Erro de resposta da API:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // A requisição foi feita mas nenhuma resposta foi recebida
      console.error('Nenhuma resposta recebida da API:', error.request);
    } else {
      // Algo aconteceu ao configurar a requisição que acionou um erro
      console.error('Erro ao configurar requisição para API:', error.message);
    }
    return Promise.reject(error);
  }
);

// Funções genéricas para chamadas API
export const fetchGetData = async (endpoint: string) => {
  try {
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    // O interceptor já loga, aqui podemos re-lançar ou tratar especificamente
    throw error;
  }
};

export const postData = async (endpoint: string, data: any) => {
  try {
    const response = await apiClient.post(endpoint, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const putData = async (endpoint: string, data: any) => {
  try {
    const response = await apiClient.put(endpoint, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteData = async (endpoint: string) => {
  try {
    const response = await apiClient.delete(endpoint);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --- Serviço de Leads (Empresas e Contatos) ---
export const empresaService = {
  getAll: () => fetchGetData('/leads/empresas'),
  getById: (id: number) => fetchGetData(`/leads/empresas/${id}`),
  create: (data: any) => postData('/leads/empresas', data),
  update: (id: number, data: any) => putData(`/leads/empresas/${id}`, data),
  delete: (id: number) => deleteData(`/leads/empresas/${id}`),
  identificar: (data: any) => postData('/leads/empresas/identificar', data),
};

export const contatoService = {
  getAllByEmpresa: (empresaId: number) => fetchGetData(`/leads/empresas/${empresaId}/contatos`),
  getById: (id: number) => fetchGetData(`/leads/contatos/${id}`),
  create: (empresaId: number, data: any) => postData(`/leads/empresas/${empresaId}/contatos`, data),
  update: (id: number, data: any) => putData(`/leads/contatos/${id}`, data),
  delete: (id: number) => deleteData(`/leads/contatos/${id}`),
  extrair: (empresaId: number) => postData(`/leads/empresas/${empresaId}/extrair-contatos`, {}),
  validarEmail: (email: string) => postData('/leads/validar-email', { email }),
};

// --- Serviço de Campanhas de E-mail ---
export const listaEmailService = {
  getAll: () => fetchGetData('/campaigns/listas-email'),
  create: (data: any) => postData('/campaigns/listas-email', data),
  // ... outros endpoints (getById, update, delete, addContato, removeContato)
};

export const templateEmailService = {
  getAll: () => fetchGetData('/campaigns/templates-email'),
  create: (data: any) => postData('/campaigns/templates-email', data),
  // ... outros endpoints
};

export const campanhaEmailService = {
  getAll: () => fetchGetData('/campaigns/campanhas-email'),
  create: (data: any) => postData('/campaigns/campanhas-email', data),
  enviar: (id: number) => postData(`/campaigns/campanhas-email/${id}/enviar`, {}),
  // ... outros endpoints
};

// --- Serviço de Redes Sociais ---
export const contaSocialService = {
  getAll: () => fetchGetData('/social/contas-sociais'),
  create: (data: any) => postData('/social/contas-sociais', data),
  // ... outros endpoints
};

export const postagemSocialService = {
  getAllByConta: (contaId: number) => fetchGetData(`/social/postagens-sociais/conta/${contaId}`),
  create: (data: any) => postData('/social/postagens-sociais', data),
  publicar: (id: number) => postData(`/social/postagens-sociais/${id}/publicar`, {}),
  processarAgendadas: () => postData('/social/scheduler/processar-postagens', {}),
  // ... outros endpoints
};

// --- Serviço de Geração de Vídeos ---
export const mediaAssetService = {
  getAll: () => fetchGetData('/videos/media-assets'),
  create: (formData: FormData) => apiClient.post('/videos/media-assets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res: AxiosResponse) => res.data),
  // ... outros endpoints
};

export const videoTemplateService = {
  getAll: () => fetchGetData('/videos/video-templates'),
  create: (data: any) => postData('/videos/video-templates', data),
  // ... outros endpoints
};

export const videoGeradoService = {
  getAll: () => fetchGetData('/videos/videos-gerados'),
  create: (data: any) => postData('/videos/videos-gerados', data),
  retry: (id: number) => postData(`/videos/videos-gerados/${id}/retry`, {}),
  // ... outros endpoints
};

export default apiClient;

