
import React, { useState, useEffect } from 'react';
import { User, Family, Status } from '../types';

interface DashboardProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onUpdateUser }) => {
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<User[]>([]);

  useEffect(() => {
    // Load family details
    const families: Family[] = JSON.parse(localStorage.getItem('familyhub_families') || '[]');
    const currentFam = families.find(f => f.id === user.familyId);
    if (currentFam) setFamily(currentFam);

    // Load members
    const fetchMembers = () => {
      const allUsers: User[] = JSON.parse(localStorage.getItem('familyhub_users_list') || '[]');
      const familyMembers = allUsers.filter(u => u.familyId === user.familyId);
      setMembers(familyMembers);
    };

    fetchMembers();
    // Simulate real-time by polling (every 3 seconds)
    const interval = setInterval(fetchMembers, 3000);
    return () => clearInterval(interval);
  }, [user.familyId]);

  const updateStatus = (newStatus: Status) => {
    const updatedUser = { ...user, currentStatus: newStatus };
    onUpdateUser(updatedUser);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Family Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-50">
        <h2 className="text-3xl font-bold text-gray-800">{family?.name || 'My Family'}</h2>
        <div className="mt-2 flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-400">Invite Code:</span>
          <code className="bg-sky-50 text-sky-600 px-2 py-0.5 rounded font-bold text-sm tracking-wider">
            {family?.inviteCode}
          </code>
        </div>
      </div>

      {/* User Status Selector */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-sky-600 uppercase tracking-wider px-2">Your Status Today</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => updateStatus('HOME')}
            className={`flex flex-col items-center justify-center p-6 rounded-3xl transition-all border-2 ${
              user.currentStatus === 'HOME'
                ? 'bg-sky-600 text-white border-sky-600 shadow-lg scale-[1.02]'
                : 'bg-white text-gray-600 border-sky-50 hover:border-sky-200'
            }`}
          >
            <span className="text-3xl mb-2">🏠</span>
            <span className="font-bold">Home</span>
            <span className="text-xs opacity-70">Eating at home</span>
          </button>
          <button
            onClick={() => updateStatus('AWAY')}
            className={`flex flex-col items-center justify-center p-6 rounded-3xl transition-all border-2 ${
              user.currentStatus === 'AWAY'
                ? 'bg-sky-600 text-white border-sky-600 shadow-lg scale-[1.02]'
                : 'bg-white text-gray-600 border-sky-50 hover:border-sky-200'
            }`}
          >
            <span className="text-3xl mb-2">🚗</span>
            <span className="font-bold">Away</span>
            <span className="text-xs opacity-70">Eating out</span>
          </button>
        </div>
      </div>

      {/* Member List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-sky-600 uppercase tracking-wider px-2">Family Members</h3>
        <div className="space-y-3">
          {members.map(member => (
            <div key={member.id} className="bg-white p-5 rounded-2xl border border-sky-50 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold text-xl uppercase">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{member.name} {member.id === user.id && '(You)'}</h4>
                  <p className="text-sm text-gray-400">
                    {member.currentStatus === 'HOME' ? 'Eating at home' : member.currentStatus === 'AWAY' ? 'Not eating at home' : 'Waiting for status...'}
                  </p>
                </div>
              </div>
              <div>
                {member.currentStatus === 'HOME' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                    HOME
                  </span>
                ) : member.currentStatus === 'AWAY' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-1.5"></span>
                    AWAY
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                    PENDING
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
