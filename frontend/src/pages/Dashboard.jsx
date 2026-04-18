import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ItemCard from '../components/ItemCard';
import { Layers, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import lostIllustration from '../assets/illustrations/lost_item.png';
import foundIllustration from '../assets/illustrations/found_item.png';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [myItems, setMyItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyItems();
    }, []);

    const fetchMyItems = async () => {
        try {
            // Using all items and filtering locally for simplicity in this demo.
            const res = await api.get('/items');
            const filteredItems = res.data.filter(item => item.user._id === (user.id || user._id));
            setMyItems(filteredItems);
        } catch (err) {
            toast.error("Failed to load your items");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        try {
            await api.delete(`/items/${id}`);
            toast.success("Listing deleted");
            fetchMyItems();
        } catch (err) {
            toast.error("Error deleting listing");
        }
    };

    const handleMarkReturned = async (id) => {
        try {
            await api.put(`/items/${id}`, { status: 'Returned' });
            toast.success("Item marked as returned!");
            fetchMyItems();
        } catch (err) {
            toast.error("Error updating status");
        }
    };

    return (
        <div className="app-container animate-fade-in" style={{ padding: '40px 20px', position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
            <style>{`
                .discovery-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 30px;
                }
                @media (max-width: 768px) {
                    .discovery-grid {
                        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                        gap: 15px;
                    }
                }
            `}</style>
            {/* Playful Floating Campus Elements */}
            <div style={{ position: 'absolute', top: '10%', right: '5%', opacity: 0.1, fontSize: '5rem', animation: 'float 8s infinite', pointerEvents: 'none', zIndex: 0 }}>🎓</div>
            <div style={{ position: 'absolute', top: '40%', left: '2%', opacity: 0.1, fontSize: '4rem', animation: 'float 10s infinite reverse', pointerEvents: 'none', zIndex: 0 }}>📍</div>
            <div style={{ position: 'absolute', bottom: '15%', right: '8%', opacity: 0.1, fontSize: '6rem', animation: 'float 7s infinite', pointerEvents: 'none', zIndex: 0 }}>📦</div>
            <div style={{ position: 'absolute', top: '20%', left: '80%', opacity: 0.05, fontSize: '3.5rem', animation: 'float 9s infinite ease-in-out', pointerEvents: 'none', zIndex: 0 }}>🔍</div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px', flexWrap: 'wrap' }}>
                    <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', flexShrink: 0, boxShadow: '0 8px 20px rgba(97, 80, 157, 0.3)' }}>
                        {user.name.charAt(0)}
                    </div>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <h1 style={{ 
                        marginBottom: '5px', 
                        fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', 
                        textTransform: 'capitalize', 
                        fontWeight: 900, 
                        lineHeight: 1.1, 
                        letterSpacing: '0.5px',
                        background: 'linear-gradient(135deg, #61509D, #E83E8C, #F57C00)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        display: 'inline-block'
                    }}>
                        {user.name.split(' ')[0].trim()}
                    </h1>
                    <p style={{ color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', wordBreak: 'break-all' }}>
                        <CheckCircle size={16} color="#2e7d32" flexShrink={0} /> <span>Verified <strong>{user.email}</strong></span>
                    </p>
                </div>
            </div>

            {/* User Statistics Row instead of massive cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginBottom: '40px' }}>
                <div className="glass-card hover-lift" style={{ padding: '20px', textAlign: 'center', borderRadius: '16px', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)' }}>
                    <Layers size={28} color="#61509D" style={{ marginBottom: '10px' }} />
                    <h3 style={{ fontSize: '2rem', margin: '0 0 5px 0', color: '#2C3E50', fontWeight: 800 }}>{myItems.length}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#546E7A', fontWeight: 600 }}>Active Listings</p>
                </div>
                
                <div className="glass-card hover-lift" style={{ padding: '20px', textAlign: 'center', borderRadius: '16px', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)' }}>
                    <CheckCircle size={28} color="#2e7d32" style={{ marginBottom: '10px' }} />
                    <h3 style={{ fontSize: '2rem', margin: '0 0 5px 0', color: '#2C3E50', fontWeight: 800 }}>{myItems.filter(i => i.status === 'Returned').length}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#546E7A', fontWeight: 600 }}>Items Resolved</p>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '30px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', borderBottom: '1px solid rgba(155, 142, 199, 0.2)', paddingBottom: '15px' }}>
                    <Layers size={24} /> My Postings & Activity
                </h2>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
                ) : myItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-light)' }}>
                        <p>You haven't posted any items yet.</p>
                    </div>
                ) : (
                    <div className="discovery-grid">
                        {myItems.map(item => (
                            <div key={item._id} style={{ position: 'relative' }}>
                                <ItemCard item={item} />
                                <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, display: 'flex', gap: '5px' }}>
                                    <button onClick={() => handleDelete(item._id)} style={{ backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', boxShadow: 'var(--shadow-sm)' }}>
                                        Delete
                                    </button>
                                    {item.status !== 'Returned' && (
                                        <button onClick={() => handleMarkReturned(item._id)} style={{ backgroundColor: '#2e7d32', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', boxShadow: 'var(--shadow-sm)' }}>
                                            Mark Resolved
                                        </button>
                                    )}
                                </div>

                                {/* Claims section for this item */}
                                {item.claims && item.claims.length > 0 && (
                                    <div style={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '8px', marginTop: '10px', padding: '10px', maxHeight: '150px', overflowY: 'auto' }}>
                                        <h5 style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>Claim Requests ({item.claims.length})</h5>
                                        {item.claims.map((claim, idx) => (
                                            <div key={idx} style={{ padding: '8px', backgroundColor: 'white', borderRadius: '6px', marginBottom: '5px', fontSize: '0.85rem' }}>
                                                <strong>{claim.claimerId?.name || 'Someone'}</strong> (<a href={`mailto:${claim.claimerId?.email}`}>{claim.claimerId?.email}</a>) says: <br/>
                                                <em style={{ color: 'var(--color-text-light)' }}>"{claim.message}"</em>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            </div>
        </div>
    );
};

export default Dashboard;
