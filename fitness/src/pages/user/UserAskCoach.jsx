import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

export default function UserAskCoach() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user?.assignedCoach) {
      fetchMessages();
      markAsRead();
      const interval = setInterval(() => {
        fetchMessages();
        markAsRead();
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const markAsRead = async () => {
    try {
      await api.put(`/messages/${user.assignedCoach}/read`);
    } catch (e) {}
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/${user.assignedCoach}`);
      setMessages(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user.assignedCoach) return;
    
    try {
      const res = await api.post(`/messages/${user.assignedCoach}`, { text: newMessage });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (e) {
      console.error(e);
      alert('Error sending message');
    }
  };

  if (loading) return <div className="loader"><div className="spinner"/></div>;

  if (!user?.assignedCoach) {
    return (
      <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
        <div className="page-header" style={{ marginBottom: '1rem' }}>
          <div>
            <div className="section-heading">Ask Coach</div>
            <div className="section-sub">Direct messaging with your assigned coach</div>
          </div>
        </div>
        <div className="tonal-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="empty-state">
            <div className="icon">💬</div>
            <p>You haven't been assigned a coach yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div>
          <div className="section-heading">Ask Coach</div>
          <div className="section-sub">Direct messaging with your assigned coach</div>
        </div>
      </div>

      <div className="tonal-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem', background: 'var(--surface-variant)', borderBottom: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="item-avatar-initials" style={{ background: 'rgba(0,64,223,.1)', color: 'var(--primary)' }}>C</div>
          <div>
            <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>Your Coach</div>
            <div style={{ fontSize: '.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} /> Online
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--surface)' }}>
          {messages.length === 0 ? (
            <div style={{ margin: 'auto', color: 'var(--on-surface-variant)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>👋</div>
              Send a message to your coach to start the conversation!
            </div>
          ) : (
            messages.map(m => {
              const isUser = m.sender === user._id;
              return (
                <div key={m._id} style={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                  <div style={{
                    background: isUser ? 'var(--primary)' : 'var(--surface-container-highest)',
                    color: isUser ? '#fff' : 'var(--on-surface)',
                    padding: '.8rem 1rem',
                    borderRadius: isUser ? '16px 16px 0 16px' : '16px 16px 16px 0',
                    boxShadow: 'var(--shadow-sm)',
                    fontSize: '.95rem'
                  }}>
                    {m.text}
                  </div>
                  <div style={{ fontSize: '.7rem', color: 'var(--on-surface-variant)', marginTop: '4px', textAlign: isUser ? 'right' : 'left' }}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: '1rem', background: 'var(--surface-variant)', borderTop: '1px solid var(--outline-variant)' }}>
          <form onSubmit={sendMessage} style={{ display: 'flex', gap: '.8rem' }}>
            <input 
              className="field-input" 
              style={{ margin: 0, flex: 1, borderRadius: '24px', padding: '.8rem 1.2rem' }} 
              placeholder="Type your message..." 
              value={newMessage} 
              onChange={e => setNewMessage(e.target.value)} 
            />
            <button type="submit" className="btn-primary" style={{ borderRadius: '24px', padding: '0 1.5rem' }}>Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
