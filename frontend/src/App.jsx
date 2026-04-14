import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import './index.css';
import { useEffect } from 'react';

function App() {
  // Theme management hook logic or Context can be added later
  useEffect(() => {
    // Optionally default to dark mode or detect system preference
    // document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="app-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/doctor" element={<DoctorDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
