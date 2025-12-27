
import React from 'react';

interface NavigationProps {
  activePage: 'dashboard' | 'meals';
  onNavigate: (page: 'dashboard' | 'meals') => void;
}

const Navigation: React.FC<NavigationProps> = ({ activePage, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-sky-100 px-6 py-4 pb-8 flex justify-around items-center z-50">
      <button
        onClick={() => onNavigate('dashboard')}
        className={`flex flex-col items-center space-y-1 transition-all ${
          activePage === 'dashboard' ? 'text-sky-600' : 'text-gray-400'
        }`}
      >
        <div className={`p-2 rounded-2xl transition-all ${activePage === 'dashboard' ? 'bg-sky-100' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <span className="text-xs font-bold">Dashboard</span>
      </button>

      <button
        onClick={() => onNavigate('meals')}
        className={`flex flex-col items-center space-y-1 transition-all ${
          activePage === 'meals' ? 'text-sky-600' : 'text-gray-400'
        }`}
      >
        <div className={`p-2 rounded-2xl transition-all ${activePage === 'meals' ? 'bg-sky-100' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <span className="text-xs font-bold">Meals</span>
      </button>
    </nav>
  );
};

export default Navigation;
