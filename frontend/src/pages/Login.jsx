import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { MapPin, Mail, AlertCircle, UserPlus, LogIn, Lock, CheckCircle, ArrowLeft, Search, Shield, HeartHandshake, ArrowRight, Smartphone } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const { login, registerAccount, googleLogin, verifyEmail, resendVerificationOTP, forgotPassword, resetPassword, user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [step, setStep] = useState('welcome'); // 'welcome', 'main', 'verify', 'forgot', 'reset'
    const [isRegistering, setIsRegistering] = useState(false);
    
    // Form States
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (user) {
        return <Navigate to="/" />;
    }

    const resetMessages = () => {
        setError('');
    };

    const handleAuthentication = async (e) => {
        if(e) e.preventDefault();
        resetMessages();

        if (isRegistering && !name) {
            setError('Name is required to register an account.');
            return;
        }

        if (!password || password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setIsLoading(true);
        
        if (isRegistering) {
            const res = await registerAccount(email, name, password);
            if (res.success && res.requiresVerification) {
                setStep('verify');
            } else if (res.success) {
                navigate('/');
            }
        } else {
            const res = await login(email, password);
            if (res.success) {
                navigate('/');
            } else if (res.unverified) {
                setStep('verify');
            }
        }
        setIsLoading(false);
    };

    const handleVerifyEmail = async (e) => {
        if(e) e.preventDefault();
        resetMessages();
        setIsLoading(true);
        const success = await verifyEmail(email, otp);
        if (success) {
            navigate('/');
        }
        setIsLoading(false);
    };

    const handleResendOTP = async () => {
        resetMessages();
        setIsLoading(true);
        await resendVerificationOTP(email);
        setIsLoading(false);
    };

    const handleForgotPassword = async (e) => {
        if(e) e.preventDefault();
        resetMessages();
        setIsLoading(true);
        const success = await forgotPassword(email);
        if (success) {
            setStep('reset');
        }
        setIsLoading(false);
    };

    const handleResetPassword = async (e) => {
        if(e) e.preventDefault();
        resetMessages();
        if (!password || password.length < 6) {
            setError('New password must be at least 6 characters long.');
            return;
        }
        setIsLoading(true);
        const success = await resetPassword(email, otp, password);
        if (success) {
            // Once reset, send them back to login
            setStep('main');
            setIsRegistering(false);
            setOtp('');
            setPassword('');
        }
        setIsLoading(false);
    };

    const ErrorBanner = () => error && (
        <div style={{ background: '#ffcccb', color: '#d32f2f', padding: '10px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left', fontSize: '0.9rem' }}>
            <AlertCircle size={18} /> {error}
        </div>
    );

    return (
        <>
            {step === 'welcome' ? (
                <div className="animate-fade-in" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 99999, // ensures navbar is completely covered
                    background: 'linear-gradient(180deg, #FFF7F0 0%, #EFE1FA 100%)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }}>
                    <div style={{ 
                        maxWidth: '430px', 
                        width: '100%', 
                        minHeight: '100dvh',
                        margin: 'auto',
                        padding: '40px 20px', 
                        textAlign: 'center', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}>

                        {/* Plant Branches Mockup (Bottom Left & Right) */}
                        <svg width="100%" height="200" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, pointerEvents: 'none' }} viewBox="0 0 400 200" preserveAspectRatio="none">
                            <path fill="#BDA8DE" fillOpacity="0.4" d="M -10,200 C -10,130 50,110 50,110 C 50,110 30,130 20,150 C 60,140 70,170 70,170 C 50,170 30,180 15,200 Z" />
                            <path fill="#BDA8DE" fillOpacity="0.4" d="M 410,200 C 410,130 350,110 350,110 C 350,110 370,130 380,150 C 340,140 330,170 330,170 C 350,170 370,180 385,200 Z" />
                            <path fill="#EFE1FA" fillOpacity="0.6" d="M0,200 L0,180 C100,160 200,220 400,180 L400,200 Z" />
                        </svg>

                        <div style={{ width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 'auto 0' }}>
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '-55px', overflow: 'visible' }}>
                                <img src="/logo.png" alt="Campus Find Logo" style={{ width: '110%', maxWidth: '380px', display: 'block', mixBlendMode: 'multiply', clipPath: 'inset(11% 8% 36% 8%)', pointerEvents: 'none', filter: 'brightness(1.08) contrast(1.15)', transform: 'translateY(35px)' }} onError={(e) => { e.target.style.display = 'none'; }} />
                            </div>
                            
                            <h1 style={{ color: '#1B1446', fontSize: 'clamp(2.4rem, 10vw, 3.2rem)', fontWeight: 800, margin: '0 0 5px', letterSpacing: '-1px', position: 'relative', zIndex: 5 }}>Campus <span style={{ color: '#8874C2', fontWeight: 700 }}>Find</span></h1>
                            
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '35px' }}>
                                <span style={{ width: '35px', height: '2px', background: '#F8CFAD', borderRadius: '2px' }}></span>
                                <span style={{ color: '#1B1446', fontSize: '1.05rem', fontWeight: '500' }}>Lost something? Find it here.</span>
                                <span style={{ width: '35px', height: '2px', background: '#F8CFAD', borderRadius: '2px' }}></span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '40px', gap: '8px' }}>
                                <div style={{ flex: '1', textAlign: 'center' }}>
                                    <div style={{ width: '60px', height: '60px', background: '#EAE2F3', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#2B235A' }}>
                                        <Search size={26} strokeWidth={1.5} />
                                    </div>
                                    <h4 style={{ color: '#1B1446', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '700' }}>Easy to Find</h4>
                                    <p style={{ color: '#6B6684', fontSize: '0.75rem', lineHeight: '1.4' }}>Search and discover<br/>lost items.</p>
                                </div>
                                <div style={{ flex: '1', textAlign: 'center' }}>
                                    <div style={{ width: '60px', height: '60px', background: '#EAE2F3', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#2B235A' }}>
                                        <Shield size={26} strokeWidth={1.5} />
                                    </div>
                                    <h4 style={{ color: '#1B1446', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '700' }}>Safe & Secure</h4>
                                    <p style={{ color: '#6B6684', fontSize: '0.75rem', lineHeight: '1.4' }}>Verified users and<br/>secure recovery.</p>
                                </div>
                                <div style={{ flex: '1', textAlign: 'center' }}>
                                    <div style={{ width: '60px', height: '60px', background: '#EAE2F3', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#2B235A' }}>
                                        <HeartHandshake size={26} strokeWidth={1.5} />
                                    </div>
                                    <h4 style={{ color: '#1B1446', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '700' }}>Reunite & Return</h4>
                                    <p style={{ color: '#6B6684', fontSize: '0.75rem', lineHeight: '1.4' }}>Help others and get<br/>what's yours back.</p>
                                </div>
                            </div>

                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <button 
                                    onClick={() => { setStep('main'); setIsRegistering(false); }}
                                    style={{ width: '100%', padding: '18px', background: '#8874C2', color: 'white', border: 'none', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'transform 0.2s', fontFamily: 'inherit' }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    Login <ArrowRight size={20} strokeWidth={1.5} />
                                </button>
                                <button 
                                    onClick={() => { setStep('main'); setIsRegistering(true); }}
                                    style={{ width: '100%', padding: '18px', background: 'transparent', color: '#1B1446', border: '1px solid #8874C2', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'background 0.2s', fontFamily: 'inherit' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(136, 116, 194, 0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    Sign Up <ArrowRight size={20} strokeWidth={1.5} color="#8874C2" />
                                </button>
                            </div>

                            <p style={{ marginTop: '35px', color: '#4A4565', fontSize: '0.85rem', fontWeight: '500' }}>
                                Join your campus community and make a difference. 💜
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)', width: '100%', padding: '20px 0' }}>
                    <div className="glass-card animate-fade-in" style={{ padding: '0', maxWidth: '450px', width: '100%', overflow: 'hidden', margin: '20px' }}>
                        
                        {step === 'main' && (
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '12px', left: '15px', zIndex: 10 }}>
                                <button onClick={() => setStep('welcome')} style={{ background: 'white', border: '1px solid #eee', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }} title="Back to Welcome">
                                    <ArrowLeft size={16} color="var(--color-text)" />
                                </button>
                            </div>
                            <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                                <button 
                                    onClick={() => { setIsRegistering(false); resetMessages(); }}
                                    style={{ flex: 1, padding: '15px', background: !isRegistering ? 'white' : 'rgba(255,255,255,0.3)', border: 'none', borderBottom: !isRegistering ? '3px solid var(--color-primary)' : '3px solid transparent', fontWeight: !isRegistering ? 'bold' : 'normal', color: !isRegistering ? 'var(--color-primary)' : 'var(--color-text-light)', cursor: 'pointer', transition: '0.2s' }}
                                >
                                    Sign In
                                </button>
                                <button 
                                    onClick={() => { setIsRegistering(true); resetMessages(); }}
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
                                    {isRegistering ? 'Register using a valid email address to verify your account.' : 'Sign in to access your dashboard.'}
                                </p>

                                <ErrorBanner />

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
                                        <label className="input-label">Email Address</label>
                                        <input 
                                            type="email" 
                                            className="input-field" 
                                            placeholder="john@example.com" 
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

                                    {!isRegistering && (
                                        <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                                            <span onClick={() => { setStep('forgot'); resetMessages(); }} style={{ fontSize: '0.85rem', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '500' }}>
                                                Forgot Password?
                                            </span>
                                        </div>
                                    )}

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

                                {/* PWA App Install Banner */}
                                <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(97, 80, 157, 0.08)', borderRadius: '12px', border: '1px dashed var(--color-primary)', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '8px' }}>
                                        <Smartphone size={20} color="var(--color-primary)" />
                                        <span style={{ fontWeight: '700', color: 'var(--color-primary)', fontSize: '0.95rem' }}>Install as an App</span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: '0', lineHeight: '1.4' }}>
                                        Did you know? You can install Campus Find directly on your home screen for faster, native app access! Look for the "Install" or "Add to Home Screen" option in your browser menu.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'verify' && (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <div style={{ background: 'var(--color-secondary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'white' }}>
                                <Mail size={28} />
                            </div>
                            
                            <h2 style={{ marginBottom: '10px' }}>Verify Your Email</h2>
                            <p style={{ color: 'var(--color-text-light)', marginBottom: '25px', fontSize: '0.9rem' }}>
                                We've sent a 6-digit OTP to <b>{email}</b>. Entering a valid OTP will activate your account.
                            </p>

                            <ErrorBanner />

                            <form onSubmit={handleVerifyEmail}>
                                <div className="input-group" style={{ textAlign: 'left' }}>
                                    <label className="input-label">Verification Code (OTP)</label>
                                    <input 
                                        type="text" 
                                        className="input-field" 
                                        placeholder="123456" 
                                        value={otp} 
                                        onChange={(e) => setOtp(e.target.value)} 
                                        maxLength={6}
                                        required 
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={isLoading}>
                                    <CheckCircle size={18} /> {isLoading ? 'Verifying...' : 'Verify Email'}
                                </button>
                            </form>

                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span 
                                    onClick={() => setStep('main')}
                                    style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                    <ArrowLeft size={14} /> Back to Login
                                </span>
                                <span 
                                    onClick={handleResendOTP}
                                    style={{ fontSize: '0.85rem', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '500' }}
                                >
                                    Resend OTP
                                </span>
                            </div>
                        </div>
                    )}

                    {step === 'forgot' && (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <div style={{ background: 'var(--color-accent)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'white' }}>
                                <Lock size={28} />
                            </div>
                            
                            <h2 style={{ marginBottom: '10px' }}>Reset Password</h2>
                            <p style={{ color: 'var(--color-text-light)', marginBottom: '25px', fontSize: '0.9rem' }}>
                                Enter your registered email address and we'll send you an OTP to reset your password.
                            </p>

                            <ErrorBanner />

                            <form onSubmit={handleForgotPassword}>
                                <div className="input-group" style={{ textAlign: 'left' }}>
                                    <label className="input-label">Email Address</label>
                                    <input 
                                        type="email" 
                                        className="input-field" 
                                        placeholder="john@example.com" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={isLoading}>
                                    <Mail size={18} /> {isLoading ? 'Sending...' : 'Send Reset OTP'}
                                </button>
                            </form>

                            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                <span 
                                    onClick={() => setStep('main')}
                                    style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                    <ArrowLeft size={14} /> Back to Login
                                </span>
                            </div>
                        </div>
                    )}

                    {step === 'reset' && (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <div style={{ background: 'var(--color-accent)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'white' }}>
                                <Lock size={28} />
                            </div>
                            
                            <h2 style={{ marginBottom: '10px' }}>Create New Password</h2>
                            <p style={{ color: 'var(--color-text-light)', marginBottom: '25px', fontSize: '0.9rem' }}>
                                Enter the OTP sent to <b>{email}</b> and your new password.
                            </p>

                            <ErrorBanner />

                            <form onSubmit={handleResetPassword}>
                                <div className="input-group" style={{ textAlign: 'left' }}>
                                    <label className="input-label">Reset OTP</label>
                                    <input 
                                        type="text" 
                                        className="input-field" 
                                        placeholder="123456" 
                                        value={otp} 
                                        onChange={(e) => setOtp(e.target.value)} 
                                        maxLength={6}
                                        required 
                                    />
                                </div>

                                <div className="input-group" style={{ textAlign: 'left' }}>
                                    <label className="input-label">New Password</label>
                                    <input 
                                        type="password" 
                                        className="input-field" 
                                        placeholder="••••••••" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        required 
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={isLoading}>
                                    <CheckCircle size={18} /> {isLoading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>

                            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                <span 
                                    onClick={() => setStep('main')}
                                    style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                    <ArrowLeft size={14} /> Cancel
                                </span>
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Login;
