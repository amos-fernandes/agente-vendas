import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="mt-4 text-2xl text-gray-600">Página Não Encontrada</p>
      <p className="mt-2 text-gray-500">
        Desculpe, a página que você está procurando não existe.
      </p>
      <Link
        to="/"
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Voltar para o Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;

