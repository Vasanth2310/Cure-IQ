const HealthData = require('../models/HealthData');
const User = require('../models/User');

exports.getPatientHistory = async (req, res) => {
    const patientId = req.params.id;
    try {
        const history = await HealthData.find({ patient: patientId }).sort({ timestamp: -1 }).limit(50);
        res.status(200).json({ history });
    } catch(e) {
        res.status(500).json({ message: 'Error fetching patient history' });
    }
}

exports.addPatientVitals = async (req, res) => {
    const { heartRate, bloodPressure, glucose } = req.body;
    try {
        const newData = await HealthData.create({
            patient: req.user.id,
            heartRate,
            bloodPressure,
            glucose
        });
        
        // At this point we can also emit socket events or do that strictly via frontend.
        res.status(201).json({ message: 'Vitals added', data: newData });
    } catch (e) {
        res.status(500).json({ message: 'Error saving vitals' });
    }
}

exports.getDoctorPatients = async (req, res) => {
    try {
        // Find patients assigned to this doctor (or all patients for demo)
        const patients = await User.find({ role: 'patient' }).select('-password');
        
        let enrichPatients = await Promise.all(patients.map(async (p) => {
            const latestVitals = await HealthData.findOne({ patient: p._id }).sort({ timestamp: -1 });
            return {
                id: p._id,
                name: p.name,
                latestVitals: latestVitals || { heartRate: '--', bloodPressure: '--' }, // Provide default structure
                alertStatus: latestVitals && latestVitals.heartRate > 100 ? 'Warning' : 'Normal'
            };
        }));

        res.status(200).json({ patients: enrichPatients });
    } catch (e) {
        res.status(500).json({ message: 'Error fetching doctor patients list' });
    }
}
