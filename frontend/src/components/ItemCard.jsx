import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, AlertTriangle } from 'lucide-react';
import api, { IMAGE_BASE_URL } from '../utils/api';
import { toast } from 'react-toastify';

const ItemCard = ({ item }) => {
    
    // Helper to format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleReport = async () => {
        if (!window.confirm("Are you sure you want to report this item? It will be reviewed by our system.")) return;
        try {
            await api.post(`/items/${item._id}/report`);
            toast.success("Item reported successfully. Thank you for keeping our hub safe!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to report item");
        }
    };

    return (
        <div className="glass-card animate-fade-in interactive-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', padding: 0 }}>
            <div style={{ aspectRatio: '1 / 1', width: '100%', backgroundColor: 'var(--color-bg)', position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
                {item.image ? (
                    <img 
                        src={item.image.startsWith('http') ? item.image : `${IMAGE_BASE_URL}${item.image.startsWith('/') ? item.image.substring(1) : item.image}`} 
                        alt={item.name} 
                        className="card-img-zoom"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                            e.target.onerror = null; // prevents looping
                            e.target.src = 'https://placehold.co/600x400/f3f4f6/a8a29e?text=Image+Unavailable';
                        }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-tertiary)' }}>
                        <Tag size={48} opacity={0.5} />
                    </div>
                )}
                
                <button 
                    onClick={handleReport}
                    style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '50%', padding: '6px', color: '#d32f2f', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }} 
                    title="Report Suspicious Item"
                    className="hover-lift"
                >
                    <AlertTriangle size={18} />
                </button>
                
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <span className={`badge ${item.status === 'Lost' ? 'badge-lost' : item.status === 'Found' ? 'badge-found' : 'badge-returned'}`}>
                        {item.status}
                    </span>
                </div>
                <div style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
                    <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.8)', color: 'var(--color-primary)' }}>
                        {item.type}
                    </span>
                </div>
            </div>
            
            <div style={{ padding: '12px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-heading)' }}>{item.name}</h3>
                
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: 'var(--color-text-light)', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} color="var(--color-primary)" style={{ flexShrink: 0 }} /> 
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} color="var(--color-primary)" style={{ flexShrink: 0 }} /> 
                        <span>{formatDate(item.date)}</span>
                    </div>
                </div>
                
                <Link to={`/items/${item._id}`} className="btn btn-outline" style={{ width: '100%', textAlign: 'center', padding: '5px', fontSize: '0.8rem', borderRadius: '8px' }}>
                    View details
                </Link>
            </div>
        </div>
    );
};

export default ItemCard;
