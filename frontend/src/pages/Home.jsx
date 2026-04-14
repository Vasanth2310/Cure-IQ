import { motion } from 'framer-motion';
import { ArrowRight, Activity, Shield, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.homeContainer}>
            <motion.div 
                className={styles.hero}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1 className={styles.title}>
                    <span className={styles.gradientText}>AI-Powered</span> Diagnosis,<br />
                    Trusted Insights, Better Care.
                </h1>
                <p className={styles.subtitle}>
                    CureIQ combines real-time health data, advanced RAG AI, and human expertise to give you the clearest picture of your health.
                </p>
                
                <div className={styles.ctaGroup}>
                    <button className={styles.primaryBtn} onClick={() => navigate('/auth')}>
                        Get Started <ArrowRight size={20} />
                    </button>
                    <button className={styles.secondaryBtn} onClick={() => navigate('/doctor')}>
                        I am a Doctor
                    </button>
                </div>
            </motion.div>

            <motion.div 
                className={styles.features}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
            >
                <div className="glass-panel">
                    <Activity className={styles.featureIcon} size={40}/>
                    <h3>Real-time Monitoring</h3>
                    <p>Connect wearables to instantly track vitals and alert doctors of anomalies.</p>
                </div>
                <div className="glass-panel">
                    <Shield className={styles.featureIcon} size={40}/>
                    <h3>RAG-Based Answers</h3>
                    <p>Get precise answers grounded in your medical history and clinical databases.</p>
                </div>
                <div className="glass-panel">
                    <Stethoscope className={styles.featureIcon} size={40}/>
                    <h3>Doctor Collaboration</h3>
                    <p>Share context-rich reports instantly with your care team for rapid diagnosis.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default Home;
