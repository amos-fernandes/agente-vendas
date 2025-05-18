import React from 'react';
import { Bell, UserCircle } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-semibold text-gray-700">Agente Vertical de Vendas</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-200">
          <Bell size={20} className="text-gray-600" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-200">
          <UserCircle size={24} className="text-gray-600" />
        </button>
      </div>
    </header>
  );
};

export default Header;

