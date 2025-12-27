import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

import { User, Status, AuthState } from "./types";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import MealsPage from "./components/MealsPage";
import Onboarding from "./components/Onboarding";
import Navigation from "./components/Navigation";

const STORAGE_KEY_USER = "familyhub_user";
const STORAGE_KEY_USERS = "familyhub_users_list";
const STORAGE_KEY_LAST_RESET = "famealy_last_reset_date";

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  const [currentPage, setCurrentPage] = useState<"dashboard" | "meals">("dashboard");
  const [isLoading, setIsLoading] = useState(true);

  // 1) Au chargement : récupérer session Supabase + hydrater ton "User app" depuis localStorage
  useEffect(() => {
    let isMounted = true;

    async function init() {
      // A) Reset quotidien (ta logique existante)
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      const today = new Date().toLocaleDateString();
      const lastReset = localStorage.getItem(STORAGE_KEY_LAST_RESET);

      let currentUser: User | null = savedUser ? JSON.parse(savedUser) : null;

      if (lastReset !== today) {
        const allUsers: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || "[]");

        const resetUsers = allUsers.map((u) => ({
          ...u,
          currentStatus: "UNSET" as Status,
        }));

        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(resetUsers));

        if (currentUser) {
          currentUser.currentStatus = "UNSET";
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
        }

        localStorage.setItem(STORAGE_KEY_LAST_RESET, today);
      }

      // B) Session Supabase (source de vérité pour l'auth)
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;

      if (!isMounted) return;

      if (!sessionUser) {
        setAuthState({ user: null, isAuthenticated: false });
        setIsLoading(false);
        return;
      }

      // C) Construire un User pour ton app :
      // - On garde l'id Supabase (uuid) comme id
      // - On garde name depuis user_metadata si présent
      // - On récupère familyId depuis localStorage si tu l'avais déjà
      const hydratedUser: User = {
        id: sessionUser.id,
        email: sessionUser.email ?? "",
        name: (sessionUser.user_metadata?.name as string) || currentUser?.name || "User",
        currentStatus: currentUser?.currentStatus || ("UNSET" as Status),
        familyId: currentUser?.familyId,
      } as User;

      // On synchronise aussi localStorage pour que ton app continue de marcher
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(hydratedUser));

      setAuthState({
        user: hydratedUser,
        isAuthenticated: true,
      });

      setIsLoading(false);
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2) Écouter les changements d'auth Supabase (login/logout)
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;

      if (!sessionUser) {
        setAuthState({ user: null, isAuthenticated: false });
        localStorage.removeItem(STORAGE_KEY_USER);
        return;
      }

      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      const currentUser: User | null = savedUser ? JSON.parse(savedUser) : null;

      const hydratedUser: User = {
        id: sessionUser.id,
        email: sessionUser.email ?? "",
        name: (sessionUser.user_metadata?.name as string) || currentUser?.name || "User",
        currentStatus: currentUser?.currentStatus || ("UNSET" as Status),
        familyId: currentUser?.familyId,
      } as User;

      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(hydratedUser));

      setAuthState({
        user: hydratedUser,
        isAuthenticated: true,
      });
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogin = (user: User) => {
    // Après login Supabase, Login.tsx appelle onLogin(user)
    // Ici, on garde juste la synchro local + state
    setAuthState({ user, isAuthenticated: true });
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthState({ user: null, isAuthenticated: false });
    localStorage.removeItem(STORAGE_KEY_USER);
  };

  const updateUserInStorage = (updatedUser: User) => {
    setAuthState((prev) => ({ ...prev, user: updatedUser }));
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));

    const allUsers: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || "[]");
    const updatedAllUsers = allUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u));
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
    return (
      <Onboarding
        user={authState.user!}
        onUpdateUser={updateUserInStorage}
        onLogout={handleLogout}
      />
    );
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
        {currentPage === "dashboard" ? (
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
