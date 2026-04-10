import { useState, useEffect } from 'react';
import api from '../utils/api';
import ItemCard from '../components/ItemCard';
import { Search, Filter, Loader } from 'lucide-react';
import { toast } from 'react-toastify';

const Home = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchItems();
    }, [search, typeFilter, statusFilter]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            let queryParams = [];
            if (search) queryParams.push(`search=${search}`);
            if (typeFilter) queryParams.push(`type=${typeFilter}`);
            if (statusFilter) queryParams.push(`status=${statusFilter}`);
            
            const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
            const res = await api.get(`/items${queryString}`);
            setItems(res.data);
        } catch (err) {
            toast.error("Failed to load items");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container" style={{ padding: '40px 20px' }}>
            {/* Hero Section */}
            <div className="glass-card animate-fade-in" style={{ padding: '40px', marginBottom: '40px', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ maxWidth: '600px', position: 'relative', zIndex: 2 }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>Recover What's Yours. <br/><span style={{ color: 'var(--color-tertiary)' }}>Help Others Find Theirs.</span></h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--color-text-light)', marginBottom: '30px' }}>
                        The official, secure Lost & Found system for SRMIST. Verified students only. 
                        Safe, fast, and reliable campus recovery.
                    </p>
                    
                    {/* Search Bar inside Hero */}
                    <div style={{ display: 'flex', gap: '10px', background: 'white', padding: '8px', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0 15px', color: 'var(--color-text-light)' }}>
                            <Search size={20} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search by keyword, location..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ flexGrow: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '1rem', fontFamily: 'inherit' }}
                        />
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Filter size={24} /> Discovery Hub
                </h2>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <select 
                        className="input-field" 
                        value={typeFilter} 
                        onChange={(e) => setTypeFilter(e.target.value)}
                        style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', background: 'white', boxShadow: 'var(--shadow-sm)' }}
                    >
                        <option value="">All Types</option>
                        <option value="Lost">Lost Items</option>
                        <option value="Found">Found Items</option>
                    </select>
                    
                    <select 
                        className="input-field" 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', background: 'white', boxShadow: 'var(--shadow-sm)' }}
                    >
                        <option value="">All Statuses</option>
                        <option value="Lost">Lost</option>
                        <option value="Found">Found</option>
                        <option value="Returned">Returned</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '50px', color: 'var(--color-primary)' }}>
                    <Loader className="animate-spin" size={40} style={{ animation: 'spin 1s linear infinite' }} />
                    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                </div>
            ) : items.length === 0 ? (
                <div className="glass-card" style={{ padding: '50px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                    <Search size={48} opacity={0.3} style={{ marginBottom: '15px' }} />
                    <h3>No items found</h3>
                    <p>Try adjusting your search criteria or filters.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                    {items.map((item, idx) => (
                        <div key={item._id} className={`animate-fade-in delay-${(idx % 3 + 1) * 100}`}>
                            <ItemCard item={item} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
