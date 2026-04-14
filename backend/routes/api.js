const express = require('express');
const router = express.Router();
const multer  = require('multer');
const { protect } = require('../middleware/authMiddleware');

// Set up local storage for files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Ensure this directory exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

const authController = require('../controllers/authController');
const ragController = require('../controllers/ragController');
const dataController = require('../controllers/dataController');

// Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// RAG / Chat Routes (Protected)
router.post('/chat', protect, ragController.askQuestion);
router.post('/upload', protect, upload.single('document'), ragController.uploadDocument);

// Data Routes (Protected)
router.post('/patient/vitals', protect, dataController.addPatientVitals);
router.get('/patient/:id/history', protect, dataController.getPatientHistory);
router.get('/doctor/patients', protect, dataController.getDoctorPatients);

module.exports = router;
