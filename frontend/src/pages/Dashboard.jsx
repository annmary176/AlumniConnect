import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Briefcase, Users, MessageSquare, UserPlus, Bell } from 'lucide-react';
import Mentorship from './Mentorship';
import Jobs from './Jobs';
import AlumniDirectory from './AlumniDirectory';
import Chat from './Chat';
import ConnectionRequests from './ConnectionRequests';
import Notifications from './Notifications';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Mentorship');
  const [chatTarget, setChatTarget] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center text-slate-500 text-xl font-medium animate-pulse">Loading App...</div>;

  const tabs = [
    { id: 'Mentorship', icon: Calendar, label: 'Mentorship' },
    { id: 'Jobs', icon: Briefcase, label: 'Job Board' },
    ...(user.type === 'Student' ? [{ id: 'Directory', icon: Users, label: 'Alumni Directory' }] : []),
    { id: 'Chat', icon: MessageSquare, label: 'Messages' },
    ...(user.type === 'Alumni' ? [{ id: 'Requests', icon: UserPlus, label: 'Requests' }] : []),
    ...(user.type === 'Student' ? [{ id: 'Notifications', icon: Bell, label: 'Notifications' }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc]">
      
      {/* Sidebar Layout */}
      <div className="w-full md:w-64 bg-white border-r border-slate-200 shadow-sm flex flex-col z-20">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Users className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">AlumniConnect</h1>
          </div>
        </div>
        
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Logged in as</p>
          <p className="font-bold text-slate-800 break-words">{user.name}</p>
          <span className="inline-block mt-1 bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">
            {user.type} User
          </span>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'Chat') setChatTarget(null);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
        <div className="p-4 border-t border-slate-100">
          <button onClick={logout} className="w-full flex items-center justify-center space-x-2 text-slate-600 hover:text-red-500 bg-slate-50 hover:bg-red-50 px-4 py-3 rounded-xl transition-all font-medium border border-transparent hover:border-red-100">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Render Area */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto relative">
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-[0.15] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-[0.15] pointer-events-none"></div>
        
        <div className="relative z-10 w-full max-w-6xl mx-auto">
          {activeTab === 'Mentorship' && <Mentorship user={user} />}
          {activeTab === 'Jobs' && <Jobs user={user} />}
          {activeTab === 'Directory' && <AlumniDirectory user={user} setActiveTab={setActiveTab} setChatTarget={setChatTarget} />}
          {activeTab === 'Chat' && <Chat user={user} defaultTarget={chatTarget} setChatTarget={setChatTarget} />}
          {activeTab === 'Requests' && <ConnectionRequests user={user} />}
          {activeTab === 'Notifications' && <Notifications user={user} />}
        </div>
      </div>

    </div>
  );
}
