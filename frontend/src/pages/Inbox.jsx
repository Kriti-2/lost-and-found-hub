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

    const selectChat = (chat) => {
        setSelectedChat(chat);
        socket.emit("join_room", chat._id);
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
        return chat.participants.find(p => p._id !== user._id && p._id !== user.id) || chat.participants[0];
    };

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}><Loader2 className="spin" size={40} color="var(--color-primary)" /></div>;
    }

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: '20px', maxWidth: '1200px', margin: '0 auto', background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
            
            {/* Sidebar */}
            <div style={{ width: selectedChat ? '30%' : '100%', borderRight: '1px solid #eee', display: selectedChat && window.innerWidth < 768 ? 'none' : 'block', background: '#fcfcfc' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary)' }}>Messages</h2>
                </div>
                <div style={{ overflowY: 'auto', height: 'calc(100% - 60px)' }}>
                    {chats.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-light)' }}>No active chats yet.</div>
                    ) : (
                        chats.map(chat => {
                            const otherUser = getOtherParticipant(chat);
                            const lastMsg = chat.messages[chat.messages.length - 1];
                            const isSelected = selectedChat?._id === chat._id;
                            
                            return (
                                <div 
                                    key={chat._id} 
                                    onClick={() => selectChat(chat)}
                                    style={{ padding: '15px 20px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', background: isSelected ? 'rgba(155, 142, 199, 0.1)' : 'transparent', transition: '0.2s' }}
                                    className="hover-bg-light"
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-tertiary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                            {otherUser?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{otherUser?.name}</h4>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {chat.item.name}
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
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>
                    {/* Chat Header */}
                    <div style={{ padding: '15px 20px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(155, 142, 199, 0.03)' }}>
                        <button onClick={() => setSelectedChat(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: window.innerWidth < 768 ? 'block' : 'none' }}>
                            <ArrowLeft size={20} />
                        </button>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{getOtherParticipant(selectedChat)?.name}</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>Re: {selectedChat.item.name}</p>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#fafafa' }}>
                        {selectedChat.messages.map((msg, idx) => {
                            const isMe = msg.sender === user._id || msg.sender === user.id;
                            const isAutomated = msg.content.startsWith('[Automated System]');
                            
                            return (
                                <div key={idx} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: '15px' }}>
                                    <div style={{ maxWidth: '70%', background: isAutomated ? '#f0f0f0' : (isMe ? 'var(--color-primary)' : 'white'), color: isAutomated ? '#666' : (isMe ? 'white' : 'var(--color-text)'), padding: '12px 16px', borderRadius: isMe ? '15px 15px 0 15px' : '15px 15px 15px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', fontSize: '0.9rem', fontStyle: isAutomated ? 'italic' : 'normal', border: isAutomated ? '1px dashed #ccc' : 'none' }}>
                                        {msg.content}
                                        <div style={{ fontSize: '0.65rem', color: isAutomated ? '#999' : (isMe ? 'rgba(255,255,255,0.7)' : 'var(--color-text-light)'), marginTop: '5px', textAlign: 'right' }}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: '20px', borderTop: '1px solid #eee', background: 'white' }}>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <button onClick={() => setMessage("Is this still available?")} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Is this available?</button>
                            <button onClick={() => setMessage("Where can we meet?")} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Where to meet?</button>
                        </div>
                        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="text" 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a secure message..." 
                                className="input-field"
                                style={{ flex: 1, margin: 0, borderRadius: '25px', padding: '12px 20px', border: '1px solid #ddd', background: '#f5f5f5' }}
                            />
                            <button type="submit" disabled={!message.trim()} style={{ background: message.trim() ? 'var(--color-primary)' : '#ccc', color: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: message.trim() ? 'pointer' : 'not-allowed', transition: '0.3s' }}>
                                <Send size={20} style={{ marginLeft: '3px' }} />
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div style={{ flex: 1, display: window.innerWidth < 768 ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fafafa', color: 'var(--color-text-light)' }}>
                    <MessageSquare size={60} style={{ opacity: 0.2, marginBottom: '20px' }} />
                    <h3 style={{ margin: 0 }}>Select a chat</h3>
                    <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>Choose a message thread from the sidebar</p>
                </div>
            )}
        </div>
    );
};

export default Inbox;
