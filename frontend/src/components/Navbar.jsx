import { Link, useNavigate } from 'react-router-dom';
import { Activity, User, LogOut, Sun, Moon } from 'lucide-react';
import styles from './Navbar.module.css';
import { useState, useEffect } from 'react';

const Navbar = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <nav className={`glass-panel ${styles.navbar}`}>
            <div className={styles.logo} onClick={() => navigate('/')}>
               <Activity className={styles.icon} />
               <span>CureIQ</span>
            </div>
            
            <div className={styles.navLinks}>
                <Link to="/patient" className={styles.link}>Patient</Link>
                <Link to="/doctor" className={styles.link}>Doctor</Link>
                
                <button className={styles.iconBtn} onClick={toggleTheme}>
                   {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                
                <button className={styles.loginBtn} onClick={() => navigate('/auth')}>
                    <User size={18} />
                    <span>Login</span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
