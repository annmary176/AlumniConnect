import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Send, UserCircle } from 'lucide-react';

export default function Chat({ user, defaultTarget, setChatTarget }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [socket, setSocket] = useState(null);
  const [contacts, setContacts] = useState([]);
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    if (!defaultTarget) {
      axios.get(`http://localhost:5000/api/chat/contacts/${user.id}`)
        .then(res => setContacts(res.data))
        .catch(console.error);
      return;
    }
    
    // Fetch History
    axios.get(`http://localhost:5000/api/chat/history/${user.id}/${defaultTarget.id}`)
      .then(res => setMessages(res.data))
      .catch(console.error);

    // Setup Socket
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    
    newSocket.emit('join', user.id);
    
    newSocket.on('receiveMessage', (msg) => {
      // only record if it's relevant to our current chat
      if ((msg.Sender_ID === defaultTarget.id && msg.Receiver_ID === user.id) || 
          (msg.Sender_ID === user.id && msg.Receiver_ID === defaultTarget.id)) {
        setMessages(prev => [...prev, msg]);
      }
    });

    return () => newSocket.close();
  }, [user.id, defaultTarget]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!socket || !messageText.trim() || !defaultTarget) return;
    socket.emit('sendMessage', { senderId: user.id, receiverId: defaultTarget.id, content: messageText });
    setMessageText('');
  };

  if (!defaultTarget) {
    return (
      <div className="p-8 glass-panel h-[75vh] flex flex-col shadow-xl">
        <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Your Conversations</h3>
        {contacts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <Send size={40} className="text-slate-300 mb-4" />
            <p>No messages yet.</p>
            {user.type === 'Student' && <p className="text-sm mt-2">Select an Alumni from the Directory to start chatting!</p>}
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto">
            {contacts.map(c => (
              <button 
                key={c.id} 
                onClick={() => setChatTarget(c)} 
                className="w-full flex items-center p-4 bg-white rounded-xl border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-4">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-slate-800 block leading-tight">{c.name}</span>
                  <span className="text-xs text-indigo-500 font-medium">Click to open chat</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[75vh] bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-indigo-200/40 overflow-hidden relative">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-4 border-b flex items-center shadow-lg z-10 w-full cursor-pointer hover:bg-opacity-90" onClick={() => setChatTarget(null)} title="Back to Contacts">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-700 font-bold mr-3">
          {defaultTarget.name.charAt(0)}
        </div>
        <div>
          <h3 className="font-bold text-white leading-tight">{defaultTarget.name}</h3>
          <p className="text-indigo-100 text-xs text-left">← Back to all chats</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: '#f0f4f8' }}>
        {messages.map((m, i) => {
          const isMe = m.Sender_ID === user.id;
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-4 py-3 text-[15px] shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-slate-200 rounded-2xl rounded-tl-sm text-slate-800'}`}>
                {m.Content}
                <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {new Date(m.Sent_At).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={send} className="p-3 bg-white border-t flex space-x-2">
        <input type="text" className="flex-1 px-5 py-3 border border-slate-200 bg-slate-50 rounded-full outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner" placeholder="Type a message..." value={messageText} onChange={(e) => setMessageText(e.target.value)} />
        <button type="submit" className="primary-gradient w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
          <Send size={20} className="ml-[-2px]" />
        </button>
      </form>
    </div>
  );
}
