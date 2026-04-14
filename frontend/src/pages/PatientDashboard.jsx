import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Send, Activity, User, FileText, PlusCircle } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';
import HealthChart from '../components/dashboard/HealthChart';
import VitalEntryForm from '../components/dashboard/VitalEntryForm';
import styles from './Dashboard.module.css';

const PatientDashboard = () => {
    const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hello! I am CureIQ. How can I assist you with your health today?' }]);
    const [input, setInput] = useState('');
    const [vitalsData, setVitalsData] = useState([]);
    const [uploadedDocs, setUploadedDocs] = useState([]);
    const [showManualEntry, setShowManualEntry] = useState(false);
    
    const token = localStorage.getItem('cureiq_token');
    const user = JSON.parse(localStorage.getItem('cureiq_user') || '{}');
    const socketRef = useRef(null);

    useEffect(() => {
        if (!token) return;

        // Fetch History
        const fetchHistory = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/patient/${user._id}/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Format for chart
                const formatted = data.history.map(d => ({
                    ...d,
                    timestamp: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                })).reverse();
                
                setVitalsData(formatted);
            } catch (err) {
                console.error("Error fetching history", err);
            }
        };

        fetchHistory();

        // Setup Socket
        socketRef.current = io('http://localhost:5000');
        socketRef.current.emit('join_patient_room', user._id);
        socketRef.current.on('live_vitals', (newData) => {
            setVitalsData(prev => [...prev.slice(-20), {
                ...newData,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        });

        return () => {
            if(socketRef.current) socketRef.current.disconnect();
        };
    }, [token, user._id]);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userQuestion = input;
        setMessages([...messages, { sender: 'user', text: userQuestion }]);
        setInput('');
        
        try {
            const { data } = await axios.post('http://localhost:5000/api/chat', 
                { question: userQuestion }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setMessages(prev => [...prev, { sender: 'bot', text: data.answer }]);
        } catch (err) {
            console.error("Chat Error", err);
            setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I couldn't reach the RAG engine. Is your connection live?" }]);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if(!file) return;

        const formData = new FormData();
        formData.append('document', file);

        try {
            const { data } = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            setUploadedDocs(prev => [{name: data.originalName, id: data.fileId}, ...prev]);
            alert(data.message);
        } catch(err) {
            alert('Error uploading file');
        }
    };

    const handleManualVital = async (vitalRecord) => {
        try {
            // Send to DB
            const { data } = await axios.post('http://localhost:5000/api/patient/vitals', vitalRecord, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Broadcast over socket for immediate graph reflection
            if (socketRef.current) {
                socketRef.current.emit('wearable_data_stream', { ...vitalRecord, patientId: user._id });
            }
            setShowManualEntry(false);
        } catch(err) {
            alert('Failed to save vitals');
        }
    };

    const latestVitals = vitalsData[vitalsData.length - 1] || null;

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <h2>Welcome, {user.name || 'Patient'}</h2>
                <div className={styles.liveVitals}>
                    <Activity color="var(--danger-color)" />
                    <span>Live HR: <strong>{latestVitals?.heartRate || '--'} bpm</strong></span>
                </div>
            </header>

            {/* Health Graphs Full Width */}
            <motion.div className="neu-panel" style={{marginBottom: '2rem'}} initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
                    <h3>Your Vitals Over Time</h3>
                    <button 
                        onClick={() => setShowManualEntry(!showManualEntry)} 
                        style={{background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center'}}
                    >
                        <PlusCircle size={16}/> Record Manual Data
                    </button>
                </div>
                
                {showManualEntry && (
                    <div style={{marginBottom: '1rem'}}>
                        <VitalEntryForm onSubmit={handleManualVital} />
                    </div>
                )}

                <HealthChart data={vitalsData} />
            </motion.div>

            <div className={styles.grid}>
                {/* Chat Interface */}
                <motion.div className={`glass-panel ${styles.chatSection}`} initial={{x: -20, opacity: 0}} animate={{x: 0, opacity: 1}}>
                    <h3><User size={20}/> AI Health Assistant</h3>
                    <div className={styles.chatBox}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={msg.sender === 'user' ? styles.msgUser : styles.msgBot}>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <div className={styles.inputArea}>
                        <input 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Describe your symptoms..." 
                            className={styles.chatInput} 
                        />
                        <button onClick={handleSend} className={styles.sendBtn}><Send size={18} /></button>
                    </div>
                </motion.div>

                {/* Patient Sidebar */}
                <div className={styles.sidebar}>
                    <motion.div className={`neu-panel ${styles.uploadSection}`} initial={{x: 20, opacity: 0}} animate={{x: 0, opacity: 1}} transition={{delay: 0.2}}>
                        <h3><Upload size={20}/> Reference Documents</h3>
                        <p style={{fontSize: '0.9rem'}}>Upload PDFs (Labs, Scans) to give the AI context.</p>
                        
                        <label className={styles.uploadLabel}>
                            Choose File
                            <input type="file" onChange={handleFileUpload} style={{display: 'none'}} accept=".pdf,.png,.jpg" />
                        </label>
                    </motion.div>

                    <motion.div className={`neu-panel ${styles.historySection}`} initial={{x: 20, opacity: 0}} animate={{x: 0, opacity: 1}} transition={{delay: 0.4}}>
                        <h3><FileText size={20}/> Upload History</h3>
                        <ul className={styles.recordList}>
                            {uploadedDocs.length === 0 && <li style={{background: 'transparent', border: 'none', color: 'var(--text-secondary)'}}>No documents uploaded yet.</li>}
                            {uploadedDocs.map(doc => (
                                <li key={doc.id}>{doc.name}</li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
