import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { IMAGE_BASE_URL } from '../utils/api';
import { toast } from 'react-toastify';
import { Upload, Save, ArrowLeft, Camera } from 'lucide-react';

const CreateItem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        type: 'Lost',
        name: '',
        description: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Lost'
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            fetchItem();
        }
    }, [id]);

    const fetchItem = async () => {
        try {
            const res = await api.get(`/items/${id}`);
            const item = res.data;
            setFormData({
                type: item.type,
                name: item.name,
                description: item.description,
                location: item.location,
                date: new Date(item.date).toISOString().split('T')[0],
                status: item.status
            });
            if (item.image) {
                setImagePreview(item.image.startsWith('http') ? item.image : `${IMAGE_BASE_URL}${item.image.startsWith('/') ? item.image.substring(1) : item.image}`);
            }
        } catch (err) {
            toast.error("Failed to load item for editing");
            navigate('/dashboard');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            if (isEditMode) {
                await api.put(`/items/${id}`, data);
                toast.success('Item updated successfully');
            } else {
                await api.post('/items', data);
                toast.success('Item posted successfully');
            }
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error saving item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container" style={{ padding: '40px 20px', maxWidth: '800px', position: 'relative' }}>
            
            {/* Extended Scattered Floating Background Elements */}
            <div style={{ position: 'absolute', left: '-25vw', top: '10%', opacity: 0.2, fontSize: '5.5rem', animation: 'float 8s ease-in-out infinite', zIndex: -1, pointerEvents: 'none' }}>🔍</div>
            <div style={{ position: 'absolute', right: '-20vw', top: '5%', opacity: 0.15, fontSize: '4.5rem', animation: 'float 7s ease-in-out infinite reverse', zIndex: -1, pointerEvents: 'none' }}>📝</div>
            <div style={{ position: 'absolute', left: '-30vw', top: '40%', opacity: 0.15, fontSize: '6rem', animation: 'float 12s ease-in-out infinite', zIndex: -1, pointerEvents: 'none' }}>🎒</div>
            <div style={{ position: 'absolute', right: '-28vw', top: '35%', opacity: 0.2, fontSize: '5rem', animation: 'float 9s ease-in-out infinite reverse', zIndex: -1, pointerEvents: 'none' }}>🔑</div>
            <div style={{ position: 'absolute', left: '-15vw', bottom: '10%', opacity: 0.25, fontSize: '4.5rem', animation: 'float 9s ease-in-out infinite', zIndex: -1, pointerEvents: 'none' }}>🏷️</div>
            <div style={{ position: 'absolute', right: '-18vw', bottom: '15%', opacity: 0.2, fontSize: '5.5rem', animation: 'float 10s ease-in-out infinite reverse', zIndex: -1, pointerEvents: 'none' }}>📦</div>
            <div style={{ position: 'absolute', right: '5vw', top: '75%', opacity: 0.15, fontSize: '3.5rem', animation: 'float 6s ease-in-out infinite', zIndex: -1, pointerEvents: 'none' }}>💡</div>
            <div style={{ position: 'absolute', left: '10vw', top: '80%', opacity: 0.12, fontSize: '3rem', animation: 'float 7s ease-in-out infinite reverse', zIndex: -1, pointerEvents: 'none' }}>📱</div>
            <div style={{ position: 'absolute', right: '-35vw', bottom: '5%', opacity: 0.15, fontSize: '6.5rem', animation: 'float 11s ease-in-out infinite', zIndex: -1, pointerEvents: 'none' }}>⌚</div>

            <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ border: 'none', padding: '0', marginBottom: '20px', background: 'transparent' }}>
                <ArrowLeft size={20} /> Back
            </button>
            
            <div className="glass-card animate-fade-in interactive-card" style={{ padding: '40px', position: 'relative', zIndex: 1 }}>
                <h2 style={{ marginBottom: '30px' }}>{isEditMode ? 'Edit Item Listing' : 'Create New Listing'}</h2>
                
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div className="input-group">
                            <label className="input-label">Listing Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="input-field" required>
                                <option value="Lost">I Lost Something</option>
                                <option value="Found">I Found Something</option>
                            </select>
                        </div>
                        
                        {isEditMode && (
                            <div className="input-group">
                                <label className="input-label">Current Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="input-field" required>
                                    <option value="Lost">Lost</option>
                                    <option value="Found">Found</option>
                                    <option value="Returned">Returned (Resolved)</option>
                                </select>
                            </div>
                        )}
                    </div>
                    
                    <div className="input-group">
                        <label className="input-label">Item Name</label>
                        <input name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="e.g., Apple AirPods Pro, Student ID Card" required />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="input-field" rows="4" placeholder="Provide detailed identifiers like colors, scratches, inner contents..." required></textarea>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div className="input-group">
                            <label className="input-label">Location (Lost/Found)</label>
                            <input name="location" value={formData.location} onChange={handleChange} className="input-field" placeholder="e.g., Library 2nd Floor, Canteen" required />
                        </div>
                        
                        <div className="input-group">
                            <label className="input-label">Date (Lost/Found)</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} className="input-field" required />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginTop: '10px' }}>
                        <label className="input-label">Upload Image (Optional but highly recommended)</label>
                        
                        <div style={{ border: '2px dashed rgba(155, 142, 199, 0.4)', borderRadius: '16px', padding: '30px', textAlign: 'center', background: 'rgba(255,255,255,0.5)', position: 'relative' }}>
                            <input 
                                id="fileInput"
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange} 
                                style={{ display: 'none' }}
                            />
                            <input 
                                id="cameraInput"
                                type="file" 
                                accept="image/*" 
                                capture="environment"
                                onChange={handleImageChange} 
                                style={{ display: 'none' }}
                            />
                            
                            {imagePreview ? (
                                <div>
                                    <img src={imagePreview} alt="Preview" style={{ maxHeight: '200px', borderRadius: '8px', margin: '0 auto 15px' }} />
                                    <div>
                                        <button type="button" onClick={() => { setImagePreview(null); setImageFile(null); }} className="btn btn-outline" style={{ padding: '8px 15px', color: '#d32f2f', borderColor: '#d32f2f' }}>Remove Image</button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ color: 'var(--color-primary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '15px' }}>
                                        <button type="button" onClick={() => document.getElementById('fileInput').click()} style={{ background: 'transparent', border: '2px solid var(--color-primary)', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-primary)', transition: '0.2s', boxShadow: 'var(--shadow-sm)' }}>
                                            <Upload size={28} />
                                        </button>
                                        <button type="button" onClick={() => document.getElementById('cameraInput').click()} style={{ background: 'var(--color-primary)', border: 'none', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', transition: '0.2s', boxShadow: 'var(--shadow-md)' }}>
                                            <Camera size={28} />
                                        </button>
                                    </div>
                                    <p style={{ fontWeight: 500 }}>Choose a file or open Camera</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '30px', padding: '15px' }} disabled={loading}>
                        <Save size={20} /> {loading ? 'Saving...' : isEditMode ? 'Update Item' : 'Publish Listing'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateItem;
