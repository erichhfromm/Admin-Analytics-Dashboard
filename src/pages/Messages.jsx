import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import { Send, Search, Check, CheckCheck } from 'lucide-react';
import { getMessages, sendMessage as sendMessageApi, getUsers } from '../services/api';
import clsx from 'clsx';

const Messages = () => {
  const [contacts, setContacts] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [msgInput, setMsgInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await getUsers('', 'All', 'createdAt', 'desc', 1, 100);
        const users = res.users || [];
        const colors = ['bg-indigo-500', 'bg-slate-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-sky-500'];
        const mapped = users.map((u, i) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          avatar: u.name.charAt(0).toUpperCase(),
          color: colors[i % colors.length],
          online: u.status === 'Active'
        }));
        setContacts(mapped);
        if(mapped.length > 0) setActiveChat(mapped[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!activeChat) return;
    const fetchMessages = async () => {
      const data = await getMessages(activeChat);
      setMessages(data.map(m => ({ 
        id: m._id, 
        text: m.content, 
        sender: m.receiverId === activeChat ? 'me' : 'them', 
        time: new Date(m.timestamp || m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      })));
      setLoading(false);
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [activeChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const activeUser = contacts.find(c => c.id === activeChat);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeUser) return;
    
    const newMessage = { 
      receiverId: activeUser.id, 
      content: msgInput 
    };
    
    try {
      const saved = await sendMessageApi(newMessage);
      setMessages([...messages, {
        id: saved._id,
        text: saved.content,
        sender: 'me',
        time: new Date(saved.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setMsgInput('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sidebar Chat List */}
      <Card className="w-80 flex flex-col !p-0 hidden md:flex border-[var(--border-color)]">
        <div className="p-4 border-b border-[var(--border-color)]">
          <h2 className="text-xl font-bold text-[var(--text-main)] mb-4">Messages</h2>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {contacts.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => { setActiveChat(chat.id); setLoading(true); }}
              className={clsx(
                "w-full text-left p-4 flex items-start gap-3 border-b border-[var(--border-color)]/50 cursor-pointer transition-colors",
                activeChat === chat.id ? "bg-[var(--primary)]/5 dark:bg-[var(--primary)]/10" : "hover:bg-[var(--bg-color)]"
              )}
            >
              <div className="relative flex-shrink-0">
                <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm ${chat.color}`}>
                  {chat.avatar}
                </div>
                {chat.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[var(--surface-color)] rounded-full"></span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="text-sm font-semibold text-[var(--text-main)] truncate">{chat.name}</h4>
                </div>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {chat.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col !p-0 border-[var(--border-color)]">
        {/* Chat Header */}
        <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--surface-color)] z-10">
          {activeUser ? (
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm ${activeUser.color}`}>
                {activeUser.avatar}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-main)]">{activeUser.name}</h3>
                <p className="text-xs text-[var(--text-muted)]">{activeUser.online ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-[var(--text-muted)]">Select a conversation</div>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[var(--bg-color)]">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin" />
            </div>
          ) : messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl p-3 ${
                  msg.sender === 'me' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-main)] rounded-tl-none'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                  <div className={`flex items-center gap-1 mt-1 text-[10px] ${msg.sender === 'me' ? 'text-indigo-100 justify-end' : 'text-[var(--text-muted)]'}`}>
                    {msg.time}
                    {msg.sender === 'me' && <CheckCheck size={12} />}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] opacity-50">
              <p className="text-sm font-medium">No messages yet.</p>
              <p className="text-xs">Start the conversation!</p>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-[var(--surface-color)] border-t border-[var(--border-color)]">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] px-4 py-2.5 rounded-full text-sm focus:outline-none focus:border-[var(--primary)] transition-all"
            />
            <button 
              type="submit"
              disabled={!msgInput.trim()}
              className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default Messages;
