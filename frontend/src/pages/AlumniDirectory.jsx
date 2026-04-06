import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MessageCircle, UserPlus, Check, Clock } from 'lucide-react';

export default function AlumniDirectory({ user, setActiveTab, setChatTarget }) {
  const [alumni, setAlumni] = useState([]);
  const [search, setSearch] = useState('');
  const [connectionStatuses, setConnectionStatuses] = useState({});

  const token = localStorage.getItem('token');

  useEffect(() => { handleSearch(); }, []);

  const handleSearch = async (e) => {
    e?.preventDefault();
    try {
      const res = await axios.get(`http://localhost:5000/api/alumni/search?q=${search}`);
      setAlumni(res.data);
      // Fetch connection status for each alumni
      res.data.forEach(a => fetchStatus(a.User_ID));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStatus = async (alumniId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/connections/status/${alumniId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConnectionStatuses(prev => ({ ...prev, [alumniId]: res.data.status }));
    } catch (err) {
      console.error(err);
    }
  };

  const sendRequest = async (alumniId) => {
    try {
      await axios.post('http://localhost:5000/api/connections/send', { alumniId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConnectionStatuses(prev => ({ ...prev, [alumniId]: 'Pending' }));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send request');
    }
  };

  const startChat = (id, name) => {
    setChatTarget({ id, name });
    setActiveTab('Chat');
  };

  const renderConnectButton = (alumniId) => {
    const status = connectionStatuses[alumniId];
    if (status === 'Accepted') {
      return (
        <button disabled className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-50 text-emerald-600 font-medium rounded-lg cursor-default">
          <Check size={16} /> Connected
        </button>
      );
    }
    if (status === 'Pending') {
      return (
        <button disabled className="flex-1 flex items-center justify-center gap-1 py-2 bg-amber-50 text-amber-600 font-medium rounded-lg cursor-default">
          <Clock size={16} /> Pending
        </button>
      );
    }
    return (
      <button
        onClick={() => sendRequest(alumniId)}
        className="flex-1 flex items-center justify-center gap-1 py-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-medium rounded-lg transition-colors"
      >
        <UserPlus size={16} /> Connect
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Alumni Directory</h2>
      <form onSubmit={handleSearch} className="flex space-x-2">
        <input type="text" placeholder="Search by name, company, or job title..." className="flex-1 px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 hover:border-indigo-300 outline-none transition-all" value={search} onChange={e => setSearch(e.target.value)} />
        <button type="submit" className="primary-gradient text-white px-6 py-3 rounded-lg flex items-center shadow-lg"><Search size={20} className="mr-2"/> Search</button>
      </form>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alumni.map(a => (
          <div key={a.User_ID} className="glass-panel p-6 shadow-xl border-t-2 border-t-indigo-400">
            <h3 className="text-lg font-bold text-slate-800">{a.Full_Name}</h3>
            <p className="text-indigo-600 font-medium">{a.Job_Title} @ {a.Company_Name}</p>
            <p className="text-sm text-slate-500 mt-1">{a.Years_Experience} years exp</p>
            {user.id !== a.User_ID && (
              <div className="mt-4 flex gap-2">
                {renderConnectButton(a.User_ID)}
                <button 
                  onClick={() => startChat(a.User_ID, a.Full_Name)} 
                  className="flex-1 flex justify-center items-center gap-1 py-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-medium rounded-lg transition-colors"
                >
                  <MessageCircle size={16} /> Message
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
