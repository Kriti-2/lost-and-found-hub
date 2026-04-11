import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { MapPin, Mail, AlertCircle, UserPlus, LogIn, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const { login, registerAccount, googleLogin, verifyEmail, resendVerificationOTP, forgotPassword, resetPassword, user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [step, setStep] = useState('main'); // 'main', 'verify', 'forgot', 'reset'
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)', padding: '20px' }}>
            <div className="glass-card animate-fade-in" style={{ padding: '0', maxWidth: '450px', width: '100%', overflow: 'hidden' }}>
                
                {step === 'main' && (
                    <>
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
                        </div>
                    </>
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
    );
};

export default Login;
