import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import axios from 'axios';
import styles from './Auth.module.css';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('patient'); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const payload = isLogin ? { email, password } : { name, email, password, role };
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            
            // Assume backend runs on port 5000 directly for now if proxy is not set
            const { data } = await axios.post(`http://localhost:5000${endpoint}`, payload);
            
            localStorage.setItem('cureiq_token', data.token);
            localStorage.setItem('cureiq_user', JSON.stringify(data));
            
            if (data.role === 'doctor') navigate('/doctor');
            else navigate('/patient');
        } catch (err) {
            setError(err.response?.data?.message || 'Error executing request.');
        }
    };

    return (
        <div className={styles.authContainer}>
            <motion.div 
                className={`glass-panel ${styles.authCard}`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                <h2 className={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <p className={styles.subtitle}>Log in to access your CureIQ dashboard</p>
                
                {error && <div style={{color: 'var(--danger-color)', marginBottom: '1rem', background: 'rgba(229, 62, 62, 0.1)', padding: '0.5rem', borderRadius: '4px'}}>{error}</div>}

                <div className={styles.roleSelector}>
                    <button 
                        className={role === 'patient' ? styles.activeRole : styles.roleBtn}
                        onClick={() => setRole('patient')}
                    >
                        🧑 Patient
                    </button>
                    <button 
                        className={role === 'doctor' ? styles.activeRole : styles.roleBtn}
                        onClick={() => setRole('doctor')}
                    >
                        👨‍⚕️ Doctor
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {!isLogin && (
                        <div className={styles.inputGroup}>
                            <UserIcon size={18} className={styles.inputIcon} />
                            <input 
                                type="text" 
                                placeholder="Full Name" 
                                required 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={styles.input} 
                            />
                        </div>
                    )}
                    <div className={styles.inputGroup}>
                        <Mail size={18} className={styles.inputIcon} />
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                            className={styles.input} 
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <Lock size={18} className={styles.inputIcon} />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                            className={styles.input} 
                        />
                    </div>
                    
                    <button type="submit" className={styles.submitBtn}>
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                </form>

                <p className={styles.switchMode}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span onClick={() => setIsLogin(!isLogin)} className={styles.link}>
                        {isLogin ? 'Sign up' : 'Log in'}
                    </span>
                </p>
            </motion.div>
        </div>
    );
};

export default Auth;
