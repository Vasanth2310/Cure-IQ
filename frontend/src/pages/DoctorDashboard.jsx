import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, AlertCircle, FileText } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';
import HealthChart from '../components/dashboard/HealthChart';
import styles from './Dashboard.module.css';

const DoctorDashboard = () => {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientHistory, setPatientHistory] = useState([]);
    
    const token = localStorage.getItem('cureiq_token');
    const socketRef = useRef(null);

    useEffect(() => {
        if (!token) return;

        const fetchPatients = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/doctor/patients', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPatients(data.patients);
                if(data.patients.length > 0) setSelectedPatient(data.patients[0]);
            } catch (err) {
                console.error("Error fetching patients", err);
            }
        };

        fetchPatients();

        socketRef.current = io('http://localhost:5000');
        // Listen to all wearable streams.
        socketRef.current.on('live_vitals', (newData) => {
            setPatients(prev => prev.map(p => {
                if (p.id === newData.patientId) {
                    return { 
                        ...p, 
                        latestVitals: { heartRate: newData.heartRate, bloodPressure: newData.bloodPressure },
                        alertStatus: newData.heartRate > 100 ? 'Warning' : 'Normal'
                    };
                }
                return p;
            }));

            // Also update the selected patient's history graph if they are currently viewed
            if (selectedPatient && selectedPatient.id === newData.patientId) {
                setPatientHistory(prev => [...prev.slice(-20), {
                    ...newData,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            }
        });

        return () => {
            if(socketRef.current) socketRef.current.disconnect();
        };
    }, [token, selectedPatient]);

    useEffect(() => {
        if (!selectedPatient || !token) return;

        const fetchHistory = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/patient/${selectedPatient.id}/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const formatted = data.history.map(d => ({
                    ...d,
                    timestamp: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                })).reverse();
                
                setPatientHistory(formatted);
            } catch (err) {
                console.error("Error fetching patient history", err);
            }
        };

        fetchHistory();
    }, [selectedPatient, token]);

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <h2>Doctor Dashboard</h2>
                <div className={styles.liveVitals}>
                    <Users color="var(--primary-color)" />
                    <span style={{color: 'var(--text-primary)'}}>Active Patients: <strong>{patients.length}</strong></span>
                </div>
            </header>

            <div className={styles.grid}>
                {/* Patient List Sidebar */}
                <motion.div className={styles.patientList} initial={{x: -20, opacity: 0}} animate={{x: 0, opacity: 1}}>
                    <h3><Users size={20}/> Patient Roster</h3>
                    <div style={{marginTop: '1rem'}}>
                        {patients.map(p => (
                            <div 
                                key={p.id} 
                                className={styles.patientItem}
                                onClick={() => setSelectedPatient(p)}
                                style={{
                                    borderLeft: selectedPatient?.id === p.id ? '4px solid var(--primary-color)' : 'none',
                                    background: selectedPatient?.id === p.id ? 'var(--glass-bg)' : 'transparent'
                                }}
                            >
                                <div>
                                    <strong>{p.name}</strong>
                                    <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                                        HR: {p.latestVitals?.heartRate || '--'} | BP: {p.latestVitals?.bloodPressure || '--'}
                                    </div>
                                </div>
                                <div>
                                    {p.alertStatus === 'Warning' ? <AlertCircle color="var(--danger-color)" size={18}/> : <Activity color="var(--accent-color)" size={18}/>}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Patient Insights Panel */}
                <motion.div className={`glass-panel`} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}} initial={{x: 20, opacity: 0}} animate={{x: 0, opacity: 1}}>
                    {selectedPatient ? (
                        <>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <h3>{selectedPatient.name} - Detailed View</h3>
                                {selectedPatient.alertStatus === 'Warning' && (
                                    <span style={{background: 'var(--danger-color)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 'bold'}}>
                                        Requires Attention
                                    </span>
                                )}
                            </div>
                            
                            <div className="neu-panel" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                <div>
                                    <p><strong>Heart Rate</strong></p>
                                    <h2 style={{color: selectedPatient.alertStatus === 'Warning' ? 'var(--danger-color)' : 'var(--text-primary)'}}>{selectedPatient.latestVitals?.heartRate || '--'} BPM</h2>
                                </div>
                                <div>
                                    <p><strong>Blood Pressure</strong></p>
                                    <h2>{selectedPatient.latestVitals?.bloodPressure || '--'}</h2>
                                </div>
                            </div>

                            <div className="neu-panel-inner">
                                <h4 style={{marginBottom: '1rem'}}>Vitals Trend (Live)</h4>
                                <HealthChart data={patientHistory} />
                            </div>

                            <div className="neu-panel-inner">
                                <h4 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'}}>
                                    <FileText size={18}/> AI Case Summary
                                </h4>
                                <p style={{lineHeight: 1.6}}>
                                    Context-aware insight generated based on patient's uploaded documents and queries.
                                    <br/><br/>
                                    <strong>Recommendation:</strong> Schedule follow-up appointment to review vitals trend if heart rate remains elevated.
                                </p>
                            </div>
                        </>
                    ) : (
                        <p>Select a patient to view insights.</p>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
