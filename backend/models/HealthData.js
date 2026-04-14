const mongoose = require('mongoose');

const healthDataSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    heartRate: { type: Number },
    bloodPressure: { type: String }, // '120/80' format
    glucose: { type: Number },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HealthData', healthDataSchema);
