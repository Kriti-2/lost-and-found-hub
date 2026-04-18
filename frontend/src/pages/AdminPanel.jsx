import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api, { IMAGE_BASE_URL } from '../utils/api';
import { ShieldAlert, Trash2, Eye, EyeOff, Users, Package } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminPanel = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({ users: 0, items: 0 });
    const [usersList, setUsersList] = useState([]);
    const [itemsList, setItemsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');

    useEffect(() => {
        if (!user?.isAdmin) {
            toast.error("Access denied");
            navigate('/');
            return;
        }
        fetchAdminData();
    }, [user, navigate]);

    const fetchAdminData = async () => {
        try {
            const [usersRes, itemsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/items')
            ]);
            setUsersList(usersRes.data);
            setItemsList(itemsRes.data);
            setStats({ users: usersRes.data.length, items: itemsRes.data.length });
        } catch (err) {
            toast.error("Failed to load admin data");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure? This will delete the user and ALL their items.")) return;
        try {
            await api.delete(`/admin/users/${id}`);
            toast.success("User deleted");
            fetchAdminData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete user");
        }
    };

    const handleToggleAdmin = async (id) => {
        try {
            await api.patch(`/admin/users/${id}/toggle-admin`);
            toast.success("Admin status updated");
            fetchAdminData();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm("Are you sure you want to delete this listing permanently?")) return;
        try {
            await api.delete(`/admin/items/${id}`);
            toast.success("Item deleted");
            fetchAdminData();
        } catch (err) {
            toast.error("Failed to delete item");
        }
    };

    const handleToggleHideItem = async (id) => {
        try {
            await api.patch(`/admin/items/${id}/toggle-hide`);
            toast.success("Visibility updated");
            fetchAdminData();
        } catch (err) {
            toast.error("Failed to update visibility");
        }
    };

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading Admin Panel...</div>;

    return (
        <div className="app-container animate-fade-in" style={{ padding: '40px 20px' }}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', color: '#d32f2f' }}>
                <ShieldAlert size={32} /> Security & Admin Dashboard
            </h1>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                <div className="glass-card" style={{ padding: '20px', flex: 1, textAlign: 'center', borderTop: '4px solid #61509D' }}>
                    <Users size={32} color="#61509D" style={{ marginBottom: '10px' }} />
                    <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{stats.users}</h2>
                    <p style={{ color: 'var(--color-text-light)', margin: 0 }}>Total Registered Users</p>
                </div>
                <div className="glass-card" style={{ padding: '20px', flex: 1, textAlign: 'center', borderTop: '4px solid #f57c00' }}>
                    <Package size={32} color="#f57c00" style={{ marginBottom: '10px' }} />
                    <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{stats.items}</h2>
                    <p style={{ color: 'var(--color-text-light)', margin: 0 }}>Total Listed Items</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
                >
                    Manage Users
                </button>
                <button 
                    onClick={() => setActiveTab('items')}
                    className={`btn ${activeTab === 'items' ? 'btn-primary' : 'btn-outline'}`}
                >
                    Manage Items / Moderation
                </button>
            </div>

            <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
                {activeTab === 'users' ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(155, 142, 199, 0.2)', textAlign: 'left' }}>
                                <th style={{ padding: '15px' }}>Name</th>
                                <th style={{ padding: '15px' }}>Email</th>
                                <th style={{ padding: '15px' }}>Role</th>
                                <th style={{ padding: '15px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersList.map((u) => (
                                <tr key={u._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                    <td style={{ padding: '15px' }}>{u.name}</td>
                                    <td style={{ padding: '15px' }}>{u.email}</td>
                                    <td style={{ padding: '15px' }}>
                                        <span className="badge" style={{ backgroundColor: u.isAdmin ? '#d32f2f' : '#e0e0e0', color: u.isAdmin ? 'white' : '#333' }}>
                                            {u.isAdmin ? 'Admin' : 'Student'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                                        {u.email !== user.email && (
                                            <>
                                                <button onClick={() => handleToggleAdmin(u._id)} className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>
                                                    {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                                </button>
                                                <button onClick={() => handleDeleteUser(u._id)} className="btn" style={{ background: '#d32f2f', color: 'white', padding: '5px 10px', fontSize: '0.8rem' }}>
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(155, 142, 199, 0.2)', textAlign: 'left' }}>
                                <th style={{ padding: '15px' }}>Item</th>
                                <th style={{ padding: '15px' }}>Type/Status</th>
                                <th style={{ padding: '15px' }}>Posted By</th>
                                <th style={{ padding: '15px' }}>Flags</th>
                                <th style={{ padding: '15px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemsList.map((item) => (
                                <tr key={item._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', background: item.isHidden ? '#fff3e0' : 'transparent' }}>
                                    <td style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {item.image && (
                                            <img 
                                                src={item.image.startsWith('http') ? item.image : `${IMAGE_BASE_URL}${item.image.startsWith('/') ? item.image.substring(1) : item.image}`} 
                                                alt={item.name} 
                                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} 
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/f3f4f6/a8a29e?text=X'; }}
                                            />
                                        )}
                                        <div style={{ width: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.name}>{item.name}</div>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <span className="badge" style={{ marginBottom: '5px' }}>{item.type}</span><br />
                                        <span style={{ fontSize: '0.8rem', color: '#666' }}>{item.status}</span>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontSize: '0.9rem' }}>{item.user?.name || 'Unknown'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{item.user?.email}</div>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        {item.reports.length > 0 && <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>{item.reports.length} Reports</span>}
                                        {item.isHidden && <span className="badge" style={{ backgroundColor: '#f57c00', color: 'white', display: 'block', marginTop: '5px' }}>Hidden</span>}
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => handleToggleHideItem(item._id)} className="btn btn-outline" style={{ padding: '6px' }} title="Toggle Visibility">
                                                {item.isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>
                                            <button onClick={() => handleDeleteItem(item._id)} className="btn" style={{ background: '#d32f2f', color: 'white', padding: '6px' }} title="Delete Post">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
