import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag } from 'lucide-react';

const ItemCard = ({ item }) => {
    
    // Helper to format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="glass-card animate-fade-in" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', transition: 'transform 0.3s ease' }}>
            <div style={{ height: '200px', backgroundColor: 'var(--color-bg)', position: 'relative' }}>
                {item.image ? (
                    <img 
                        src={`http://localhost:5000${item.image}`} 
                        alt={item.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-tertiary)' }}>
                        <Tag size={48} opacity={0.5} />
                    </div>
                )}
                
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
            
            <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '10px', fontSize: '1.25rem' }}>{item.name}</h3>
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: '15px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                </p>
                
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} color="var(--color-primary)" /> {item.location}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} color="var(--color-primary)" /> {formatDate(item.date)}
                    </div>
                </div>
                
                <Link to={`/items/${item._id}`} className="btn btn-outline" style={{ width: '100%', textAlign: 'center' }}>
                    View & Claim
                </Link>
            </div>
        </div>
    );
};

export default ItemCard;
