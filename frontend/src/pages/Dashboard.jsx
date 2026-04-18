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
        <div className="app-container animate-fade-in" style={{ padding: '40px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px', flexWrap: 'wrap' }}>
                <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', flexShrink: 0 }}>
                    {user.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <h1 style={{ marginBottom: '5px', fontSize: 'clamp(1.8rem, 6vw, 2.5rem)', color: 'var(--color-primary)', textTransform: 'capitalize', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.5px' }}>
                        <span style={{ color: 'var(--color-heading)' }}>{user.name.split(' ')[0].trim()}'s</span> Dashboard
                    </h1>
                    <p style={{ color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', wordBreak: 'break-all' }}>
                        <CheckCircle size={16} color="#2e7d32" flexShrink={0} /> <span>Verified <strong>{user.email}</strong></span>
                    </p>
                </div>
            </div>

            {/* Quick Action Banner Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                
                {/* Lost Item Card */}
                <div className="interactive-card" style={{ backgroundColor: '#FFF0EA', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <div style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                        <img src={lostIllustration} alt="Lost Item" style={{ width: '120px', height: '120px', objectFit: 'contain', borderRadius: '12px' }} />
                    </div>
                    <div style={{ flex: '1 1 200px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h3 style={{ color: '#2C3E50', fontSize: '1.4rem', marginBottom: '8px', fontWeight: 800 }}>Lost an Item?</h3>
                        <p style={{ color: '#546E7A', fontSize: '0.95rem', margin: 0, maxWidth: '250px' }}>Post a lost item here so the campus can help you find it.</p>
                        <div style={{ marginTop: '15px' }}>
                            <Link to="/create" style={{ display: 'inline-block', border: '2px solid #FFB74D', color: '#F57C00', background: 'transparent', padding: '6px 20px', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 'bold', textDecoration: 'none', transition: 'all 0.2s' }}>
                                Post It
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Found Item Card */}
                <div className="interactive-card" style={{ backgroundColor: '#FFFDF0', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <div style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                        <img src={foundIllustration} alt="Found Item" style={{ width: '120px', height: '120px', objectFit: 'contain', borderRadius: '12px' }} />
                    </div>
                    <div style={{ flex: '1 1 200px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h3 style={{ color: '#2C3E50', fontSize: '1.4rem', marginBottom: '8px', fontWeight: 800 }}>Found an Item?</h3>
                        <p style={{ color: '#546E7A', fontSize: '0.95rem', margin: 0, maxWidth: '250px' }}>Post a found item here so the owner can securely claim it.</p>
                        <div style={{ marginTop: '15px' }}>
                            <Link to="/create" style={{ display: 'inline-block', border: '2px solid #81C784', color: '#4CAF50', background: 'transparent', padding: '6px 20px', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 'bold', textDecoration: 'none', transition: 'all 0.2s' }}>
                                Post It
                            </Link>
                        </div>
                    </div>
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
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
    );
};

export default Dashboard;
