import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCheck, UserX, Inbox } from 'lucide-react';

export default function ConnectionRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/connections/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (requestId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/connections/${requestId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(prev => prev.filter(r => r.Request_ID !== requestId));
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    }
  };

  if (loading) return <div className="text-center text-slate-500 py-12 animate-pulse">Loading requests...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Inbox size={24} className="text-indigo-600" /> Connection Requests
      </h2>

      {requests.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Inbox size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No pending requests</p>
          <p className="text-sm mt-1">When students send you connection requests, they'll appear here.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map(r => (
            <div key={r.Request_ID} className="bg-white rounded-xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                  {r.Full_Name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{r.Full_Name}</h3>
                  <p className="text-sm text-slate-500">{r.Email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(r.Request_ID, 'Accepted')}
                  className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-700 font-medium rounded-lg transition-colors"
                >
                  <UserCheck size={18} /> Accept
                </button>
                <button
                  onClick={() => handleAction(r.Request_ID, 'Rejected')}
                  className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 font-medium rounded-lg transition-colors"
                >
                  <UserX size={18} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
