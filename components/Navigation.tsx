import React from 'react';
import { AppView } from '../types';
import { Home, Plane, DollarSign } from 'lucide-react';

interface NavigationProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: 'Início', icon: <Home size={20} /> },
    { id: AppView.LOGISTICS, label: 'Roteiro', icon: <Plane size={20} /> },
    { id: AppView.EXPENSES, label: 'Gastos', icon: <DollarSign size={20} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-4 flex justify-around items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 w-16 ${
            currentView === item.id
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          {item.icon}
          <span className="text-xs mt-1 font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;