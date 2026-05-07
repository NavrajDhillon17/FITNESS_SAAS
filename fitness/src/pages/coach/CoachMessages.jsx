import { useState, useEffect, useRef } from 'react';
import api from '../../api';

export default function CoachMessages() {
  const [athletes, setAthletes] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const [unreadMap, setUnreadMap] = useState({});

  useEffect(() => {
    fetchAthletes();
    fetchUnreadMap();
    const interval = setInterval(() => {
      fetchUnreadMap();
      if (selectedAthlete) {
        fetchMessages(selectedAthlete._id);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedAthlete]);

  useEffect(() => {
    if (selectedAthlete) {
      fetchMessages(selectedAthlete._id);
      markAsRead(selectedAthlete._id);
      // Immediately clear unread for this user in local state
      setUnreadMap(prev => ({ ...prev, [selectedAthlete._id]: 0 }));
    }
  }, [selectedAthlete]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchUnreadMap = async () => {
    try {
      const res = await api.get('/messages/unread-by-sender');
      setUnreadMap(res.data);
    } catch (e) {}
  };

  const markAsRead = async (userId) => {
    try {
      await api.put(`/messages/${userId}/read`);
    } catch (e) {}
  };

  const fetchAthletes = async () => {
    try {
      const res = await api.get('/coach/users');
      setAthletes(res.data);
      if (res.data.length > 0) {
        setSelectedAthlete(res.data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await api.get(`/messages/${userId}`);
      setMessages(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedAthlete) return;
    
    try {
      const res = await api.post(`/messages/${selectedAthlete._id}`, { text: newMessage });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (e) {
      console.error(e);
      alert('Error sending message');
    }
  };

  if (loading) return <div className="loader"><div className="spinner"/></div>;

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', gap: '1rem' }}>
      {/* Athlete List Sidebar */}
      <div className="tonal-container" style={{ width: '300px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem', background: 'var(--surface-variant)', borderBottom: '1px solid var(--outline-variant)' }}>
          <h3 style={{ margin: 0, fontFamily: 'Manrope,sans-serif', fontSize: '1.1rem' }}>Athletes</h3>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {athletes.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '.9rem' }}>
              No athletes assigned yet.
            </div>
          ) : (
            athletes.map(a => (
              <div 
                key={a._id} 
                onClick={() => setSelectedAthlete(a)}
                style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid var(--outline-variant)',
                  cursor: 'pointer',
                  background: selectedAthlete?._id === a._id ? 'var(--primary-container)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div className="item-avatar-initials" style={{ background: 'rgba(0,64,223,.1)', color: 'var(--primary)', width: 36, height: 36, fontSize: '1rem' }}>
                  {a.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 600, color: selectedAthlete?._id === a._id ? 'var(--on-primary-container)' : 'var(--on-surface)' }}>
                    {a.name}
                  </div>
                </div>
                {unreadMap[a._id] > 0 && (
                  <div style={{
                    background: 'var(--error)',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    marginLeft: 'auto'
                  }}>
                    {unreadMap[a._id]}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="tonal-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        {selectedAthlete ? (
          <>
            <div style={{ padding: '1rem', background: 'var(--surface-variant)', borderBottom: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="item-avatar-initials" style={{ background: 'rgba(0,64,223,.1)', color: 'var(--primary)' }}>
                {selectedAthlete.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>{selectedAthlete.name}</div>
                <div style={{ fontSize: '.75rem', color: 'var(--success)' }}>Athlete</div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--surface)' }}>
              {messages.length === 0 ? (
                <div style={{ margin: 'auto', color: 'var(--on-surface-variant)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>👋</div>
                  Send a message to start the conversation!
                </div>
              ) : (
                messages.map(m => {
                  const isCoach = m.sender !== selectedAthlete._id;
                  return (
                    <div key={m._id} style={{ alignSelf: isCoach ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                      <div style={{
                        background: isCoach ? 'var(--primary)' : 'var(--surface-container-highest)',
                        color: isCoach ? '#fff' : 'var(--on-surface)',
                        padding: '.8rem 1rem',
                        borderRadius: isCoach ? '16px 16px 0 16px' : '16px 16px 16px 0',
                        boxShadow: 'var(--shadow-sm)',
                        fontSize: '.95rem'
                      }}>
                        {m.text}
                      </div>
                      <div style={{ fontSize: '.7rem', color: 'var(--on-surface-variant)', marginTop: '4px', textAlign: isCoach ? 'right' : 'left' }}>
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
                  placeholder="Type a message to your athlete..." 
                  value={newMessage} 
                  onChange={e => setNewMessage(e.target.value)} 
                />
                <button type="submit" className="btn-primary" style={{ borderRadius: '24px', padding: '0 1.5rem' }}>Send</button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ margin: 'auto', color: 'var(--on-surface-variant)' }}>
            Select an athlete from the sidebar to view messages.
          </div>
        )}
      </div>
    </div>
  );
}
