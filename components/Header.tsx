
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { View } from '../types';

interface HeaderProps {
    activeView: View;
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, toggleSidebar }) => {
    const activeNavItem = NAV_ITEMS.find(item => item.view === activeView);
    const title = activeNavItem ? activeNavItem.label : 'Dashboard';

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="lg:hidden text-gray-600 dark:text-gray-300">
                    <i data-lucide="menu" className="w-6 h-6"></i>
                </button>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
            </div>
            <div className="flex items-center gap-4">
                <button className="relative text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">
                    <i data-lucide="bell" className="w-6 h-6"></i>
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </button>
                 <img src={`https://i.pravatar.cc/150?u=a042581f4e29026704d`} alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-green-500" />
            </div>
        </header>
    );
};

export default Header;
