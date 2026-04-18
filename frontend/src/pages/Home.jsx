import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ItemCard from '../components/ItemCard';
import { Search, Filter, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import lostIllustration from '../assets/illustrations/lost_item.png';
import foundIllustration from '../assets/illustrations/found_item.png';

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
        <div className="app-container" style={{ padding: '40px 0' }}>
            <style>{`
                .hero-container {
                    padding: 40px 30px;
                    margin-bottom: 40px;
                }
                .hero-title {
                    font-size: 2.5rem;
                    margin-bottom: 15px;
                }
                .hero-subtitle {
                    font-size: 1.1rem;
                    margin-bottom: 30px;
                }
                .float-icon {
                    position: absolute;
                    animation: float 6s ease-in-out infinite alternate;
                    pointer-events: none;
                    z-index: 1;
                    filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.15));
                }
                
                @media (max-width: 768px) {
                    .hero-container {
                        padding: 20px 15px !important;
                        margin-bottom: 25px !important;
                    }
                    .hero-title {
                        font-size: 1.6rem !important;
                        margin-bottom: 10px !important;
                        line-height: 1.2;
                    }
                    .hero-subtitle {
                        font-size: 0.9rem !important;
                        margin-bottom: 20px !important;
                    }
                    .float-icon {
                        transform: scale(0.65) !important;
                    }
                }
            `}</style>
            
            {/* Hero Section */}
            <div className="glass-card animate-fade-in hero-container" style={{ borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                
                {/* Floating Aesthetic Elements (Darker and More Numerous) */}
                <div className="float-icon" style={{ right: '10%', top: '5%', opacity: 0.4, fontSize: '4.5rem', animationDelay: '0s' }}>🔑</div>
                <div className="float-icon" style={{ right: '3%', bottom: '15%', opacity: 0.35, fontSize: '5rem', animationDelay: '-2s', animationDuration: '8s' }}>📱</div>
                <div className="float-icon" style={{ right: '25%', bottom: '10%', opacity: 0.3, fontSize: '3.5rem', animationDelay: '-4s', animationDuration: '10s' }}>⌚</div>
                <div className="float-icon" style={{ right: '40%', top: '8%', opacity: 0.35, fontSize: '3rem', animationDelay: '-1s', animationDuration: '7s' }}>👓</div>
                <div className="float-icon" style={{ left: '55%', top: '25%', opacity: 0.25, fontSize: '2.5rem', animationDelay: '-3s', animationDuration: '9s' }}>🎒</div>
                <div className="float-icon" style={{ left: '65%', bottom: '15%', opacity: 0.3, fontSize: '3rem', animationDelay: '-5s', animationDuration: '6s' }}>📚</div>
                <div className="float-icon" style={{ right: '18%', top: '45%', opacity: 0.25, fontSize: '2.5rem', animationDelay: '-1.5s', animationDuration: '8.5s' }}>🎧</div>
                
                {/* Soft glowing blob inside the hero */}
                <div style={{ position: 'absolute', right: '-10%', top: '-20%', width: '400px', height: '400px', background: 'radial-gradient(circle, var(--color-secondary) 0%, rgba(255,255,255,0) 70%)', opacity: 0.6, zIndex: 0, borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', right: '10%', bottom: '-30%', width: '350px', height: '350px', background: 'radial-gradient(circle, var(--color-tertiary) 0%, rgba(255,255,255,0) 70%)', opacity: 0.4, zIndex: 0, borderRadius: '50%' }}></div>

                <div style={{ maxWidth: '600px', position: 'relative', zIndex: 2 }}>
                    <h1 className="hero-title">Recover What's Yours. <br/><span style={{ color: 'var(--color-tertiary)' }}>Help Others Find Theirs.</span></h1>
                    <p className="hero-subtitle" style={{ color: 'var(--color-text-light)' }}>
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

            {/* Small Quick Action Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="interactive-card" style={{ backgroundColor: '#FFF0EA', borderRadius: '16px', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))', flexShrink: 0 }}>
                        <img src={lostIllustration} alt="Lost Item" style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '12px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ color: '#2C3E50', fontSize: '1.2rem', marginBottom: '4px' }}>Lost an Item?</h3>
                        <p style={{ color: '#546E7A', fontSize: '0.9rem', margin: 0, marginBottom: '8px' }}>Post it here for easy recovery</p>
                        <div>
                            <Link to="/create" style={{ display: 'inline-block', border: '1px solid #FFB74D', color: '#F57C00', background: 'transparent', padding: '4px 16px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', textDecoration: 'none', transition: 'all 0.2s' }}>
                                Post It
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="interactive-card" style={{ backgroundColor: '#FFFDF0', borderRadius: '16px', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))', flexShrink: 0 }}>
                        <img src={foundIllustration} alt="Found Item" style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '12px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ color: '#2C3E50', fontSize: '1.2rem', marginBottom: '4px' }}>Found an Item?</h3>
                        <p style={{ color: '#546E7A', fontSize: '0.9rem', margin: 0, marginBottom: '8px' }}>Reach the owner quickly</p>
                        <div>
                            <Link to="/create" style={{ display: 'inline-block', border: '1px solid #81C784', color: '#4CAF50', background: 'transparent', padding: '4px 16px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', textDecoration: 'none', transition: 'all 0.2s' }}>
                                Post It
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="mobile-flex-col" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Filter size={24} /> Discovery Hub
                </h2>
                <div className="mobile-wrap" style={{ display: 'flex', gap: '15px' }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="glass-card interactive-card" style={{ height: '350px', padding: '0', display: 'flex', flexDirection: 'column' }}>
                            <div className="skeleton" style={{ height: '200px', width: '100%', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}></div>
                            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                <div className="skeleton" style={{ height: '28px', width: '70%', marginBottom: '15px', borderRadius: '4px' }}></div>
                                <div className="skeleton" style={{ height: '16px', width: '100%', marginBottom: '8px', borderRadius: '4px' }}></div>
                                <div className="skeleton" style={{ height: '16px', width: '80%', marginBottom: 'auto', borderRadius: '4px' }}></div>
                                <div className="skeleton" style={{ height: '40px', width: '100%', borderRadius: 'var(--radius-full)', marginTop: '20px' }}></div>
                            </div>
                        </div>
                    ))}
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
