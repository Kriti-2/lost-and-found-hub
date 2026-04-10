import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { MapPin, Mail, AlertCircle, UserPlus, LogIn, Lock } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const { login, registerAccount, googleLogin, user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (user) {
        return <Navigate to="/" />;
    }

    const handleAuthentication = async (e) => {
        if(e && e.preventDefault) e.preventDefault();
        setError('');

        if (!email.endsWith('@srmist.edu.in') && !email.endsWith('@gmail.com')) {
            setError('Please use a valid SRM or Gmail institutional email.');
            return;
        }

        if (isRegistering && !name) {
            setError('Name is required to register an account.');
            return;
        }

        if (!password || password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setIsLoading(true);
        
        let success = false;
        if (isRegistering) {
            success = await registerAccount(email, name, password);
        } else {
            success = await login(email, password);
        }

        if (success) {
            navigate('/');
        }
        // Specific error messages are now handled by toast in AuthContext, 
        // but we can leave a general fallback here if needed.
        setIsLoading(false);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)', padding: '20px' }}>
            <div className="glass-card animate-fade-in" style={{ padding: '0', maxWidth: '450px', width: '100%', overflow: 'hidden' }}>
                
                {/* Header Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                    <button 
                        onClick={() => { setIsRegistering(false); setError(''); }}
                        style={{ flex: 1, padding: '15px', background: !isRegistering ? 'white' : 'rgba(255,255,255,0.3)', border: 'none', borderBottom: !isRegistering ? '3px solid var(--color-primary)' : '3px solid transparent', fontWeight: !isRegistering ? 'bold' : 'normal', color: !isRegistering ? 'var(--color-primary)' : 'var(--color-text-light)', cursor: 'pointer', transition: '0.2s' }}
                    >
                        Sign In
                    </button>
                    <button 
                        onClick={() => { setIsRegistering(true); setError(''); }}
                        style={{ flex: 1, padding: '15px', background: isRegistering ? 'white' : 'rgba(255,255,255,0.3)', border: 'none', borderBottom: isRegistering ? '3px solid var(--color-primary)' : '3px solid transparent', fontWeight: isRegistering ? 'bold' : 'normal', color: isRegistering ? 'var(--color-primary)' : 'var(--color-text-light)', cursor: 'pointer', transition: '0.2s' }}
                    >
                        Register
                    </button>
                </div>

                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <div style={{ background: 'var(--color-tertiary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'white' }}>
                        {isRegistering ? <UserPlus size={28} /> : <LogIn size={28} />}
                    </div>
                    
                    <h2 style={{ marginBottom: '10px' }}>{isRegistering ? 'Create an Account' : 'Welcome Back'}</h2>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '25px', fontSize: '0.9rem' }}>
                        {isRegistering ? 'Register using your SRMIST college ID.' : 'Sign in to access your dashboard.'}
                    </p>

                    {error && (
                        <div style={{ background: '#ffcccb', color: '#d32f2f', padding: '10px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left', fontSize: '0.9rem' }}>
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleAuthentication}>
                        {isRegistering && (
                            <div className="input-group" style={{ textAlign: 'left' }}>
                                <label className="input-label">Full Name</label>
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    placeholder="John Doe" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    required={isRegistering} 
                                />
                            </div>
                        )}

                        <div className="input-group" style={{ textAlign: 'left' }}>
                            <label className="input-label">Institutional Email</label>
                            <input 
                                type="email" 
                                className="input-field" 
                                placeholder="john@srmist.edu.in" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>

                        <div className="input-group" style={{ textAlign: 'left' }}>
                            <label className="input-label">Password</label>
                            <input 
                                type="password" 
                                className="input-field" 
                                placeholder="••••••••" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ width: '100%', marginTop: '10px' }}
                            disabled={isLoading}
                        >
                            {isRegistering ? (
                                <><UserPlus size={18} /> {isLoading ? 'Creating...' : 'Register Account'}</>
                            ) : (
                                <><LogIn size={18} /> {isLoading ? 'Signing In...' : 'Sign In securely'}</>
                            )}
                        </button>
                    </form>

                    <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }}></div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }}></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                setIsLoading(true);
                                const success = await googleLogin(credentialResponse.credential);
                                if (success) navigate('/');
                                setIsLoading(false);
                            }}
                            onError={() => {
                                setError('Google Login Failed');
                            }}
                            useOneTap
                            theme="outline"
                            text="continue_with"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
