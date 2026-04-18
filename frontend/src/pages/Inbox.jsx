import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { Send, ArrowLeft, Loader2, MessageSquare } from 'lucide-react';
import api, { IMAGE_BASE_URL } from '../utils/api';

const socket = io(IMAGE_BASE_URL);

const Inbox = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchChats = async () => {
            try {
                const res = await api.get('/chat');
                setChats(res.data);
                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching chats", err);
                setIsLoading(false);
            }
        };

        fetchChats();
    }, [user, navigate]);

    useEffect(() => {
        socket.on("receive_message", (data) => {
            if (selectedChat && data.room === selectedChat._id) {
                setSelectedChat(prev => ({
                    ...prev,
                    messages: [...prev.messages, data.message]
                }));
            }
            
            // Also update the preview in the side panel
            setChats(prevChats => prevChats.map(c => {
                if (c._id === data.room) {
                    return { ...c, messages: [...c.messages, data.message] };
                }
                return c;
            }));
        });

        return () => {
            socket.off("receive_message");
        };
    }, [selectedChat]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedChat?.messages]);

    // Handle mobile browser/hardware back button gracefully
    useEffect(() => {
        const handlePopState = (e) => {
            if (selectedChat) {
                // Intercept the back button and close the chat instead of leaving the page
                setSelectedChat(null);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [selectedChat]);

    const selectChat = (chat) => {
        setSelectedChat(chat);
        socket.emit("join_room", chat._id);
        
        // Push a state to the history stack so the hardware back button has something to pop
        if (window.innerWidth < 768) {
            window.history.pushState({ chatOpen: true }, '');
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedChat) return;

        try {
            const res = await api.post(`/chat/${selectedChat._id}/message`, { content: message });
            
            const newMessage = res.data;
            
            // Send via socket
            socket.emit("send_message", { room: selectedChat._id, message: newMessage });
            
            // Update local state
            setSelectedChat(prev => ({
                ...prev,
                messages: [...prev.messages, newMessage]
            }));
            
            setChats(prevChats => prevChats.map(c => {
                if (c._id === selectedChat._id) {
                    return { ...c, messages: [...c.messages, newMessage] };
                }
                return c;
            }));

            setMessage('');
        } catch (err) {
            console.error("Error sending message", err);
        }
    };

    const getOtherParticipant = (chat) => {
        // Find the participant that is NOT the current logged in user
        return chat.participants.find(p => p && p._id !== user._id && p._id !== user.id) || chat.participants[0] || {};
    };

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}><Loader2 className="spin" size={40} color="var(--color-primary)" /></div>;
    }

    return (
        <div className="glass-card animate-fade-in" style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: '0px', maxWidth: '1200px', margin: '20px auto', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.7)', position: 'relative' }}>
            
            {/* Sidebar */}
            <div style={{ position: 'relative', width: window.innerWidth < 768 ? '100%' : '35%', minWidth: '300px', borderRight: '1px solid rgba(155, 142, 199, 0.2)', display: selectedChat && window.innerWidth < 768 ? 'none' : 'flex', flexDirection: 'column', background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', overflow: 'hidden' }}>
                
                {/* Artistic background blobs for the sidebar */}
                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(97, 80, 157, 0.15) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }}></div>
                <div style={{ position: 'absolute', bottom: '10%', right: '-15%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(232, 62, 140, 0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }}></div>

                <div style={{ padding: '25px', borderBottom: '1px solid rgba(155, 142, 199, 0.1)', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #61509D, #E83E8C)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 10px rgba(97,80,157,0.3)', transform: 'rotate(-5deg)' }}>
                        <MessageSquare size={20} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.6rem', background: 'linear-gradient(135deg, var(--color-primary), var(--color-heading))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 900, letterSpacing: '-0.5px' }}>My Messages</h2>
                </div>
                <div className="chat-scroll" style={{ overflowY: 'auto', flex: 1, padding: '15px 0', position: 'relative', zIndex: 1 }}>
                    {chats.length === 0 ? (
                        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-light)' }}>No active chats yet.</div>
                    ) : (
                        chats.map(chat => {
                            const otherUser = getOtherParticipant(chat);
                            const isSelected = selectedChat?._id === chat._id;
                            
                            return (
                                <div 
                                    key={chat._id} 
                                    onClick={() => selectChat(chat)}
                                    className={`chat-list-item interactive-card ${isSelected ? 'selected' : ''}`}
                                    style={{ 
                                        margin: '0 15px 12px 15px', 
                                        padding: '16px', 
                                        cursor: 'pointer', 
                                        background: isSelected ? 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,1))' : 'rgba(255,255,255,0.5)', 
                                        borderRadius: '16px', 
                                        boxShadow: isSelected ? '0 8px 20px rgba(97,80,157,0.12)' : '0 2px 8px rgba(0,0,0,0.02)',
                                        border: isSelected ? '1px solid rgba(97,80,157,0.4)' : '1px solid rgba(155,142,199,0.15)',
                                        position: 'relative',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-tertiary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(155,142,199,0.3)', flexShrink: 0 }}>
                                            {(otherUser?.name?.[0] || '?').toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h4 style={{ margin: '0 0 5px 0', fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: isSelected ? '800' : '600', color: '#2C3E50' }}>{otherUser?.name || 'Unknown User'}</h4>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: isSelected ? 'var(--color-primary)' : 'var(--color-text-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {chat.item?.name || 'Deleted Item'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Area */}
            {selectedChat ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(255,255,255,0.1)' }}>
                    {/* Chat Header */}
                    <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(155, 142, 199, 0.2)', display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', zIndex: 10 }}>
                        <button onClick={() => {
                            if (window.innerWidth < 768) {
                                window.history.back(); // Pops the state we pushed, triggering popstate event -> setSelectedChat(null)
                            } else {
                                setSelectedChat(null);
                            }
                        }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: window.innerWidth < 768 ? 'flex' : 'none', color: 'var(--color-heading)', padding: '5px', borderRadius: '50%', backgroundColor: 'rgba(155,142,199,0.1)' }}>
                            <ArrowLeft size={22} />
                        </button>
                        <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-tertiary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(97, 80, 157, 0.3)' }}>
                            {(getOtherParticipant(selectedChat)?.name?.[0] || '?').toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 800, color: '#2C3E50' }}>{getOtherParticipant(selectedChat)?.name || 'Unknown User'}</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: '600' }}>Re: {selectedChat.item?.name || 'Deleted Item'}</p>
                        </div>
                    </div>

                    {/* Messages Area - Appliying creative dot-grid pattern */}
                    <div className="chat-scroll" style={{ flex: 1, padding: '25px', overflowY: 'auto', backgroundColor: '#F8F9FA', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%2361509D\' fill-opacity=\'0.06\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '15px 15px' }}>
                        {selectedChat.messages.map((msg, idx) => {
                            const isMe = msg.sender === user._id || msg.sender === user.id;
                            const isAutomated = msg.content.startsWith('[Automated System]');
                            
                            return (
                                <div key={idx} className="chat-bubble" style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: '20px', animationDelay: `${Math.min(idx * 0.05, 0.5)}s` }}>
                                    <div style={{ 
                                        maxWidth: '75%', 
                                        background: isAutomated ? 'rgba(255,255,255,0.7)' : (isMe ? 'linear-gradient(135deg, var(--color-primary), var(--color-heading))' : 'white'), 
                                        color: isAutomated ? '#666' : (isMe ? 'white' : 'var(--color-text)'), 
                                        padding: '14px 20px', 
                                        borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px', 
                                        boxShadow: isMe ? '0 5px 15px rgba(155,142,199,0.3)' : '0 4px 10px rgba(0,0,0,0.05)', 
                                        fontSize: '0.95rem', 
                                        fontStyle: isAutomated ? 'italic' : 'normal', 
                                        border: isAutomated ? '1px dashed var(--color-tertiary)' : 'none',
                                        lineHeight: '1.4'
                                    }}>
                                        {msg.content}
                                        <div style={{ fontSize: '0.7rem', color: isAutomated ? '#999' : (isMe ? 'rgba(255,255,255,0.7)' : 'var(--color-text-light)'), marginTop: '8px', textAlign: 'right' }}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: '20px 25px', borderTop: '1px solid rgba(155, 142, 199, 0.2)', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <button type="button" onClick={() => setMessage("Is this still available?")} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '20px' }}>Is this available?</button>
                            <button type="button" onClick={() => setMessage("Where can we meet?")} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '20px' }}>Where to meet?</button>
                        </div>
                        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <input 
                                type="text" 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a secure message..." 
                                className="input-field"
                                style={{ flex: 1, margin: 0, borderRadius: '25px', padding: '14px 22px', border: 'none', background: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '1rem' }}
                            />
                            <button type="submit" disabled={!message.trim()} style={{ background: message.trim() ? 'linear-gradient(135deg, #61509D, #E83E8C)' : '#d1cdda', color: 'white', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: message.trim() ? 'pointer' : 'not-allowed', transition: '0.3s', boxShadow: message.trim() ? '0 4px 15px rgba(232,62,140,0.4)' : 'none', flexShrink: 0 }}>
                                <Send size={22} style={{ marginLeft: '2px', transform: message.trim() ? 'scale(1.1)' : 'scale(1)', transition: '0.3s' }} />
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div style={{ flex: 1, display: window.innerWidth < 768 ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.6))', position: 'relative', overflow: 'hidden' }}>
                    {/* Quirky background floating elements */}
                    <div style={{ position: 'absolute', top: '20%', left: '20%', opacity: 0.1, animation: 'float 8s infinite' }}>🔍</div>
                    <div style={{ position: 'absolute', bottom: '25%', right: '15%', opacity: 0.1, animation: 'float 10s infinite reverse', fontSize: '3rem' }}>📍</div>
                    <div style={{ position: 'absolute', top: '15%', right: '25%', opacity: 0.1, animation: 'float 7s infinite', fontSize: '2.5rem' }}>📦</div>
                    <div style={{ position: 'absolute', bottom: '15%', left: '30%', opacity: 0.1, animation: 'float 9s infinite', fontSize: '2.5rem' }}>👣</div>
                    
                    <div className="pulse-icon-container" style={{ background: 'linear-gradient(135deg, #fff, #f0e6ff)', border: '3px dashed var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: '3rem' }}>🕵️</div>
                    </div>
                    <h3 style={{ margin: '30px 0 10px', fontSize: '1.8rem', color: 'var(--color-heading)', position: 'relative', zIndex: 1 }}>The Detective's Desk</h3>
                    <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text-light)', maxWidth: '300px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        Grab your magnifying glass! Select a conversation on the left to reunite a lost treasure with its owner.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Inbox;
