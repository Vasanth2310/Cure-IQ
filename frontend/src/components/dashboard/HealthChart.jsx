import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const HealthChart = ({ data }) => {
    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                    <XAxis dataKey="timestamp" stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                    <YAxis stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'var(--bg-color)', 
                            border: '1px solid var(--glass-border)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)'
                        }} 
                    />
                    <Legend />
                    <Line 
                        type="monotone" 
                        dataKey="heartRate" 
                        stroke="var(--danger-color)" 
                        strokeWidth={3}
                        activeDot={{ r: 8 }} 
                        name="Heart Rate (BPM)"
                    />
                    {data[0] && data[0].glucose && (
                        <Line 
                            type="monotone" 
                            dataKey="glucose" 
                            stroke="var(--primary-color)" 
                            strokeWidth={3}
                            name="Glucose (mg/dL)"
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default HealthChart;
