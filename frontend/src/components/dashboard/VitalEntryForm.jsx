import { useState } from 'react';
import { Send } from 'lucide-react';

const VitalEntryForm = ({ onSubmit }) => {
    const [hr, setHr] = useState('');
    const [bp, setBp] = useState('');
    const [glucose, setGlucose] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ 
            heartRate: Number(hr), 
            bloodPressure: bp, 
            glucose: Number(glucose) 
        });
        setHr('');
        setBp('');
        setGlucose('');
    };

    return (
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div style={{display: 'flex', gap: '0.5rem'}}>
                <input 
                    type="number" 
                    placeholder="Heart Rate (BPM)"
                    value={hr} 
                    onChange={e => setHr(e.target.value)} 
                    style={inputStyle} 
                    required 
                />
                <input 
                    type="text" 
                    placeholder="BP (e.g. 120/80)" 
                    value={bp} 
                    onChange={e => setBp(e.target.value)} 
                    style={inputStyle} 
                    required 
                />
            </div>
            <input 
                type="number" 
                placeholder="Glucose (mg/dL)" 
                value={glucose} 
                onChange={e => setGlucose(e.target.value)} 
                style={inputStyle} 
            />
            <button type="submit" style={btnStyle}><Send size={16}/> Record Vitals</button>
        </form>
    );
};

const inputStyle = {
    flex: 1,
    padding: '0.8rem',
    borderRadius: '8px',
    border: '1px solid var(--glass-border)',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'var(--text-primary)',
};

const btnStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.8rem',
    borderRadius: '8px',
    background: 'var(--primary-color)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold'
};

export default VitalEntryForm;
