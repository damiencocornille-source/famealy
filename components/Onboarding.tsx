
import React, { useState } from 'react';
import { User, Family } from '../types';

interface OnboardingProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ user, onUpdateUser, onLogout }) => {
  const [mode, setMode] = useState<'selection' | 'create' | 'join'>('selection');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const handleCreateFamily = (e: React.FormEvent) => {
    e.preventDefault();
    const families: Family[] = JSON.parse(localStorage.getItem('familyhub_families') || '[]');
    const newFamily: Family = {
      id: Math.random().toString(36).substr(2, 9),
      name: familyName,
      inviteCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
    };
    localStorage.setItem('familyhub_families', JSON.stringify([...families, newFamily]));
    onUpdateUser({ ...user, familyId: newFamily.id });
  };

  const handleJoinFamily = (e: React.FormEvent) => {
    e.preventDefault();
    const families: Family[] = JSON.parse(localStorage.getItem('familyhub_families') || '[]');
    const targetFamily = families.find(f => f.inviteCode === inviteCode.toUpperCase());
    
    if (targetFamily) {
      onUpdateUser({ ...user, familyId: targetFamily.id });
    } else {
      alert('Invalid invitation code. Please check with your family!');
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col p-4">
      <div className="flex justify-between items-center mb-12 pt-4">
        <h1 className="text-2xl font-bold text-sky-600">famealy</h1>
        <button onClick={onLogout} className="text-sm font-medium text-sky-500">Logout</button>
      </div>

      <div className="flex-1 max-w-sm mx-auto w-full">
        {mode === 'selection' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Hi, {user.name}!</h2>
              <p className="text-gray-500 mt-2">How would you like to get started?</p>
            </div>
            
            <button
              onClick={() => setMode('create')}
              className="w-full bg-white border-2 border-sky-100 hover:border-sky-500 p-8 rounded-3xl shadow-sm transition-all group text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-sky-100 p-4 rounded-2xl group-hover:bg-sky-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Create a Family</h3>
                  <p className="text-gray-500 text-sm">Start a new group and invite others.</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMode('join')}
              className="w-full bg-white border-2 border-sky-100 hover:border-sky-500 p-8 rounded-3xl shadow-sm transition-all group text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-sky-100 p-4 rounded-2xl group-hover:bg-sky-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Join a Family</h3>
                  <p className="text-gray-500 text-sm">Enter a code sent by a family member.</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreateFamily} className="space-y-6">
            <button onClick={() => setMode('selection')} className="text-sky-600 font-semibold flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">New Family</h2>
            <p className="text-gray-500 mb-6">What should we call your family?</p>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              required
              autoFocus
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-sky-500 outline-none text-xl font-medium"
              placeholder="e.g. The Smiths"
            />
            <button
              type="submit"
              className="w-full bg-sky-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-sky-100 transform active:scale-95 transition-all"
            >
              Let's Go!
            </button>
          </form>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoinFamily} className="space-y-6">
            <button onClick={() => setMode('selection')} className="text-sky-600 font-semibold flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Join Family</h2>
            <p className="text-gray-500 mb-6">Enter the 6-character invitation code.</p>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              required
              autoFocus
              maxLength={6}
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-sky-500 outline-none text-2xl font-bold text-center tracking-widest uppercase"
              placeholder="A1B2C3"
            />
            <button
              type="submit"
              className="w-full bg-sky-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-sky-100 transform active:scale-95 transition-all"
            >
              Join Group
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
