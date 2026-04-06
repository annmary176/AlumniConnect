import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Users, TrendingUp } from 'lucide-react';

export default function Mentorship({ user }) {
  const [sessions, setSessions] = useState([]);
  const [newSession, setNewSession] = useState({ topic: '', sessionTime: '', meetingLink: '' });

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/sessions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(res.data);
    } catch (err) { }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/sessions', newSession, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Session created successfully!');
      fetchSessions();
      setNewSession({ topic: '', sessionTime: '', meetingLink: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create session');
    }
  };

  const handleBookSession = async (sessionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/sessions/${sessionId}/book`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Session booked successfully!');
      fetchSessions();
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed');
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl">
      {/* Main Panel */}
      <div className="md:col-span-2 space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
          <Calendar className="text-indigo-600" />
          <span>Available Mentorship Sessions</span>
        </h2>

        <div className="grid gap-4">
          {sessions.map(session => (
            <div key={session.Session_ID} className="bg-white rounded-xl shadow-sm hover:shadow-lg p-6 border border-slate-100 transition-all">
              <div className="flex justify-between items-start flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-indigo-900">{session.Topic}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${session.Status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {session.Status === 'Available' ? 'Available' : 'Booked'}
                    </span>
                  </div>
                  <p className="text-slate-500 flex items-center mt-1">
                    <Users size={16} className="mr-2" />
                    {session.Alumni_Name}
                  </p>
                  <p className="text-slate-500 mt-2 font-medium">
                    {new Date(session.Session_Time).toLocaleString()}
                  </p>
                </div>
                {user.type === 'Student' && session.Status === 'Available' && (
                  <button 
                    onClick={() => handleBookSession(session.Session_ID)}
                    className="bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap shadow-sm"
                  >
                    Book Slot
                  </button>
                )}
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="text-center p-8 text-slate-500 glass-panel">No sessions currently.</div>
          )}
        </div>
      </div>

      {/* Side Panel (Alumni Actions or Student Graph) */}
      <div className="space-y-6">
        {user.type === 'Alumni' && (
          <div className="glass-panel p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Post a Session</h2>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
                <input type="text" required value={newSession.topic} onChange={e => setNewSession({...newSession, topic: e.target.value})} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Resume Review" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
                <input type="datetime-local" required value={newSession.sessionTime} onChange={e => setNewSession({...newSession, sessionTime: e.target.value})} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Link</label>
                <input type="url" value={newSession.meetingLink} onChange={e => setNewSession({...newSession, meetingLink: e.target.value})} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://zoom.us/..." />
              </div>
              <button type="submit" className="w-full primary-gradient py-2 rounded-lg font-semibold">Create Session</button>
            </form>
          </div>
        )}


      </div>
    </div>
  );
}
