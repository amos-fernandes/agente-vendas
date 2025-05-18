import React from 'react';
import { NavLink } from 'react-router-dom'; // Assumindo que react-router-dom será usado para navegação
import { LayoutDashboard, Users, Mail, Send, Video, Settings } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Leads', path: '/leads', icon: Users },
    { name: 'Campanhas', path: '/campaigns', icon: Mail },
    { name: 'Redes Sociais', path: '/social-media', icon: Send },
    { name: 'Vídeos', path: '/videos', icon: Video },
    { name: 'Configurações', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-2xl font-semibold">Menu Principal</h2>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 transition-colors ${
                isActive ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">&copy; 2025 Agente de Vendas</p>
      </div>
    </aside>
  );
};

export default Sidebar;

