import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { IMAGE_BASE_URL } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { MapPin, Calendar, User as UserIcon, MessageSquare, ShieldCheck, Tag } from 'lucide-react';

const ItemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [claimMessage, setClaimMessage] = useState('');
    const [showClaimModal, setShowClaimModal] = useState(false);

    useEffect(() => {
        fetchItemDetails();
    }, [id]);

    const fetchItemDetails = async () => {
        try {
            const res = await api.get(`/items/${id}`);
            setItem(res.data);
        } catch (err) {
            toast.error("Item not found");
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post(`/items/${id}/claim`, { message: claimMessage });
            toast.success(res.data.message);
            setShowClaimModal(false);
            fetchItemDetails(); // refresh
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send claim request");
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>Loading...</div>;
    if (!item) return null;

    const isOwner = user && item.user?._id === (user.id || user._id);
    const hasClaimed = user && item.claims.some(claim => claim.claimerId?._id === (user.id || user._id));

    return (
        <div className="app-container animate-fade-in" style={{ padding: '40px 20px' }}>
            <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', overflow: 'hidden' }}>
                <div style={{ flex: '1 1 40%', minWidth: '300px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px' }}>
                    {item.image ? (
                        <img 
                            src={item.image.startsWith('http') ? item.image : `${IMAGE_BASE_URL}${item.image.startsWith('/') ? item.image.substring(1) : item.image}`} 
                            alt={item.name} 
                            style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }} 
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/f3f4f6/a8a29e?text=Image+Unavailable'; }}
                        />
                    ) : (
                        <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-tertiary)' }}>
                            <Tag size={100} opacity={0.3} />
                        </div>
                    )}
                </div>
                
                <div style={{ flex: '1 1 50%', minWidth: '320px', padding: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                            <span className="badge" style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-text)', marginBottom: '10px' }}>{item.type}</span>
                            <span className={`badge ${item.status === 'Lost' ? 'badge-lost' : item.status === 'Found' ? 'badge-found' : 'badge-returned'}`} style={{ marginLeft: '10px' }}>
                                Status: {item.status}
                            </span>
                            <h1 style={{ fontSize: '2.5rem', marginTop: '10px' }}>{item.name}</h1>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', color: 'var(--color-text-light)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={18} color="var(--color-primary)" /> {item.location}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={18} color="var(--color-primary)" /> {new Date(item.date).toLocaleDateString()}</div>
                    </div>
                    
                    <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '12px', borderLeft: '4px solid var(--color-primary)' }}>
                        <h4 style={{ marginBottom: '10px' }}>Description</h4>
                        <p style={{ lineHeight: '1.6' }}>{item.description}</p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px', padding: '15px', border: '1px solid rgba(155, 142, 199, 0.2)', borderRadius: '12px' }}>
                        <div style={{ backgroundColor: 'var(--color-tertiary)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContents: 'center' }}>
                            <UserIcon size={20} style={{ margin: 'auto' }} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 600 }}>Posted by {item.user?.name || 'Deleted User'}</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Verified Institution Student <ShieldCheck size={14} color="#2e7d32" style={{ verticalAlign: 'middle' }} /></p>
                        </div>
                    </div>
                    
                    {/* Actions */}
                    {isOwner ? (
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button onClick={() => navigate(`/edit/${item._id}`)} className="btn btn-secondary" style={{ flexGrow: 1 }}>Edit Listing</button>
                            {item.status !== 'Returned' && (
                                <button onClick={async () => {
                                    try {
                                        await api.put(`/items/${item._id}`, { status: 'Returned' });
                                        toast.success("Item marked as returned!");
                                        fetchItemDetails();
                                    } catch (err) { toast.error("Error updating status"); }
                                }} className="btn btn-outline" style={{ flexGrow: 1, borderColor: '#2e7d32', color: '#2e7d32' }}>Mark as Returned</button>
                            )}
                        </div>
                    ) : item.status !== 'Returned' && (
                        <div>
                            {hasClaimed ? (
                                <div style={{ padding: '15px', backgroundColor: '#e3f2fd', color: '#1565c0', borderRadius: '12px', textAlign: 'center', fontWeight: '500' }}>
                                    Claim request sent! Waiting for response from owner.
                                </div>
                            ) : (
                                <button onClick={() => { user ? setShowClaimModal(true) : navigate('/login') }} className="btn btn-primary" style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}>
                                    <MessageSquare size={20} /> {item.type === 'Lost' ? "I Found This!" : "This is Mine!"}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showClaimModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContents: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '30px', margin: 'auto', backgroundColor: '#fff' }}>
                        <h3 style={{ marginBottom: '20px' }}>Claim Request</h3>
                        <p style={{ marginBottom: '20px', color: 'var(--color-text-light)' }}>Send a message to the owner. Be descriptive so they can verify it's you.</p>
                        <form onSubmit={handleClaim}>
                            <textarea 
                                className="input-field" 
                                style={{ width: '100%', marginBottom: '20px' }} 
                                rows="4" 
                                placeholder="E.g., I'm the owner. My ID ends in 459 and there's a sticker on the back..."
                                value={claimMessage}
                                onChange={(e) => setClaimMessage(e.target.value)}
                                required
                            />
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button type="button" onClick={() => setShowClaimModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Send Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemDetails;
