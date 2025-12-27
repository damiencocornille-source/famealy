
import React, { useState, useEffect } from 'react';
import { User, Family, Meal, Status, AuthState } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import MealsPage from './components/MealsPage';
import Onboarding from './components/Onboarding';
import Navigation from './components/Navigation';

const STORAGE_KEY_USER = 'familyhub_user';
const STORAGE_KEY_USERS = 'familyhub_users_list';
const STORAGE_KEY_LAST_RESET = 'famealy_last_reset_date';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'meals'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Persistence and Midnight Reset logic
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    const today = new Date().toLocaleDateString();
    const lastReset = localStorage.getItem(STORAGE_KEY_LAST_RESET);

    let currentUser: User | null = savedUser ? JSON.parse(savedUser) : null;

    // Check if we need to reset statuses because a new day has started
    if (lastReset !== today) {
      const allUsers: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
      
      // Reset all users globally
      const resetUsers = allUsers.map(u => ({ ...u, currentStatus: 'UNSET' as Status }));
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(resetUsers));
      
      // Reset current user if logged in
      if (currentUser) {
        currentUser.currentStatus = 'UNSET';
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
      }
      
      // Update reset date
      localStorage.setItem(STORAGE_KEY_LAST_RESET, today);
    }

    if (currentUser) {
      setAuthState({
        user: currentUser,
        isAuthenticated: true,
      });
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setAuthState({ user, isAuthenticated: true });
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  };

  const handleLogout = () => {
    setAuthState({ user: null, isAuthenticated: false });
    localStorage.removeItem(STORAGE_KEY_USER);
  };

  const updateUserInStorage = (updatedUser: User) => {
    setAuthState(prev => ({ ...prev, user: updatedUser }));
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    
    // Also update in the global users list for other "family members"
    const allUsers: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const updatedAllUsers = allUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedAllUsers));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (!authState.user?.familyId) {
    return <Onboarding user={authState.user!} onUpdateUser={updateUserInStorage} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-sky-50 pb-24">
      <header className="bg-white shadow-sm sticky top-0 z-10 px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-sky-600 tracking-tight">famealy</h1>
        <button 
          onClick={handleLogout}
          className="text-sm font-medium text-sky-500 hover:text-sky-700 bg-sky-50 px-3 py-1.5 rounded-full transition-colors"
        >
          Logout
        </button>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6">
        {currentPage === 'dashboard' ? (
          <Dashboard user={authState.user!} onUpdateUser={updateUserInStorage} />
        ) : (
          <MealsPage user={authState.user!} />
        )}
      </main>

      <Navigation activePage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
};

export default App;
