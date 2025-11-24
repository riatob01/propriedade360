
import React from 'react';
import { View } from '../types';
import { NAV_ITEMS } from '../constants';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isSidebarOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isSidebarOpen }) => {
  return (
    <aside className={`absolute lg:relative w-64 lg:w-64 bg-gray-800 text-white h-full shadow-xl transition-transform duration-300 ease-in-out z-30 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <i data-lucide="leaf" className="text-green-400"></i> PROPRIEDADE<span className="font-light">360</span>
        </h1>
      </div>
      <nav className="mt-6">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.view}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveView(item.view);
            }}
            className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors duration-200 ${
              activeView === item.view
                ? 'bg-green-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
      <div className="absolute bottom-0 w-full p-6">
          <div className="bg-gray-700 p-4 rounded-lg text-center shadow-lg border border-gray-600">
            <h4 className="font-semibold text-white">Gestão Inteligente</h4>
            <p className="text-xs text-gray-400 mt-1">Otimize sua produção com dados precisos.</p>
            <div className="mt-3 border-t border-gray-600 pt-2 flex justify-between items-center px-1">
                <span className="text-[10px] text-green-400 font-mono">ONLINE</span>
                <span className="text-[10px] text-gray-400 font-mono">v1.0.0</span>
            </div>
          </div>
      </div>
    </aside>
  );
};

export default Sidebar;
