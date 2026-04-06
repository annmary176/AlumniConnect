import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCircle } from 'lucide-react';

export default function Notifications({ user }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  const fetchNotifs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/connections/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifs(); }, []);

  const markRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/connections/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifs(prev => prev.map(n => n.Notif_ID === id ? { ...n, Is_Read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center text-slate-500 py-12 animate-pulse">Loading notifications...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Bell size={24} className="text-indigo-600" /> Notifications
      </h2>

      {notifs.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Bell size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No notifications yet</p>
          <p className="text-sm mt-1">You'll be notified when alumni accept your connection requests.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifs.map(n => (
            <div key={n.Notif_ID} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${n.Is_Read ? 'bg-slate-50 border-slate-100' : 'bg-indigo-50 border-indigo-200 shadow-sm'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${n.Is_Read ? 'bg-slate-300' : 'bg-indigo-500 animate-pulse'}`}></div>
                <div>
                  <p className={`font-medium ${n.Is_Read ? 'text-slate-500' : 'text-slate-800'}`}>{n.Message}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(n.Created_At).toLocaleString()}</p>
                </div>
              </div>
              {!n.Is_Read && (
                <button
                  onClick={() => markRead(n.Notif_ID)}
                  className="text-indigo-600 hover:text-indigo-800 p-2 rounded-lg hover:bg-indigo-100 transition-colors"
                  title="Mark as read"
                >
                  <CheckCircle size={20} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
