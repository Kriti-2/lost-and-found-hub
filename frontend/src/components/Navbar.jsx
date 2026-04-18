import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Search, PlusCircle, User, LogOut, Package, Bell, MessageSquare, Trash2, ShieldAlert } from 'lucide-react';

const Navbar = () => {
    const { user, logout, markNotificationsAsRead, deleteNotification } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef(null);

    // Auto-close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        
        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    // Auto-close on page navigation
    useEffect(() => {
        setShowNotifications(false);
    }, [location]);

    const toggleNotifications = () => {
        const nextState = !showNotifications;
        setShowNotifications(nextState);
        if (nextState) {
            markNotificationsAsRead();
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const unreadCount = user?.notifications?.filter(n => !n.isRead).length || 0;

    return (
        <nav className="glass-nav" style={{ padding: '15px 0' }}>
            <div className="app-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'var(--color-primary)', color: 'white', padding: '8px', borderRadius: '12px' }}>
                        <Package size={24} />
                    </div>
                    <h2 className="mobile-nav-hide" style={{ margin: 0, fontSize: '1.5rem', color: 'var(--color-heading)' }}>Lost & Found Hub</h2>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Link to="/" style={{ fontWeight: 500 }} className="hover-underline mobile-nav-hide">Explore</Link>
                    
                    {user ? (
                        <>
                            <Link to="/create" className="btn btn-post" style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #61509D, #4a3b78)', color: 'white', boxShadow: '0 4px 15px rgba(97, 80, 157, 0.4)' }}>
                                <PlusCircle size={18} /> <span className="mobile-nav-hide" style={{ marginLeft: '6px' }}>Post Item</span>
                            </Link>

                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '10px', gap: '15px' }}>
                                
                                <Link to="/inbox" style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex' }} title="Secure Messages">
                                    <MessageSquare size={22} color="var(--color-text-light)" />
                                </Link>

                                <div ref={notifRef} style={{ position: 'relative', display: 'flex' }}>
                                    <button onClick={toggleNotifications} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex' }}>
                                        <Bell size={22} color="var(--color-text-light)" />
                                        {unreadCount > 0 && (
                                            <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#d32f2f', color: 'white', borderRadius: '50%', padding: '2px 5px', fontSize: '0.65rem', fontWeight: 'bold' }}>
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>
                                    
                                    {showNotifications && (
                                        <div className="notif-dropdown" style={{ position: 'absolute', top: '40px', right: '0px', width: '320px', maxWidth: 'calc(100vw - 40px)', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '15px', zIndex: 1000, maxHeight: '400px', overflowY: 'auto' }}>
                                            <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '10px', color: 'var(--color-primary)' }}>Your Inbox</h4>
                                            {(!user?.notifications || user.notifications.length === 0) ? (
                                                <p style={{ fontSize: '0.85rem', color: '#666', textAlign: 'center', margin: '20px 0' }}>No messages yet.</p>
                                            ) : (
                                                [...user.notifications].reverse().map((notif) => (
                                                    <div key={notif._id} style={{ background: notif.isRead ? 'transparent' : 'rgba(155, 142, 199, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '8px', fontSize: '0.85rem', border: '1px solid rgba(0,0,0,0.05)', position: 'relative' }}>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteNotification(notif._id);
                                                            }}
                                                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
                                                            className="delete-notif-btn"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                        <p style={{ margin: '0 0 8px 0', color: 'var(--color-text)', paddingRight: '20px' }}>
                                                            <strong>{notif.senderName}</strong> sent a claim request for your item: <strong>{notif.itemName}</strong>
                                                        </p>
                                                        <div style={{ background: 'rgba(255,255,255,0.8)', padding: '8px', borderRadius: '6px', fontStyle: 'italic', marginBottom: '8px', borderLeft: '3px solid var(--color-primary)' }}>
                                                            "{notif.message}"
                                                        </div>
                                                        <p style={{ margin: '0', fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                                                            Contact them directly: <strong>{notif.senderEmail}</strong>
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '1px solid rgba(0,0,0,0.1)', paddingLeft: '15px' }}>
                                {user.isAdmin && (
                                    <Link to="/admin" className="hover-link" style={{ display: 'flex', color: '#d32f2f' }} title="Admin Dashboard">
                                        <ShieldAlert size={20} />
                                    </Link>
                                )}
                                <Link to="/dashboard" className="hover-underline" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                    <User size={18} /> <span className="mobile-nav-hide">{user.name}</span>
                                </Link>
                                <button onClick={handleLogout} className="btn-outline" style={{ padding: '6px 12px', border: 'none', color: '#d32f2f' }}>
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <Link to="/login" className="btn btn-primary">Login</Link>
                    )}
                </div>
            </div>
            <style>{`
                .hover-link:hover { color: var(--color-primary); }
                .delete-notif-btn:hover { color: #d32f2f !important; }
                @media (max-width: 768px) {
                    .btn-post { padding: 8px !important; }
                    .notif-dropdown { right: -60px !important; }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
