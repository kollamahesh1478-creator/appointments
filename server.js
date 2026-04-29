const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Data file path
const appointmentsFile = path.join(__dirname, 'data', 'appointments.json');

// Initialize appointments file if it doesn't exist
if (!fs.existsSync(appointmentsFile)) {
  fs.writeFileSync(appointmentsFile, JSON.stringify({ appointments: [] }, null, 2));
}

// Helper functions
const readAppointments = () => {
  const data = fs.readFileSync(appointmentsFile, 'utf8');
  return JSON.parse(data);
};

const writeAppointments = (data) => {
  fs.writeFileSync(appointmentsFile, JSON.stringify(data, null, 2));
};

// Routes

// Get all appointments
app.get('/api/appointments', (req, res) => {
  try {
    const data = readAppointments();
    res.json(data.appointments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get available time slots for a specific date and doctor
app.get('/api/available-slots', (req, res) => {
  const { date, doctor } = req.query;
  const allAppointments = readAppointments().appointments;
  
  // Define available slots (9 AM to 5 PM, 30-minute intervals)
  const allSlots = [];
  for (let hour = 9; hour < 17; hour++) {
    for (let min = 0; min < 60; min += 30) {
      allSlots.push(`${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
    }
  }
  
  // Filter out booked slots
  const bookedSlots = allAppointments
    .filter(apt => apt.date === date && apt.doctor === doctor && apt.status !== 'cancelled')
    .map(apt => apt.time);
  
  const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
  res.json({ availableSlots });
});

// Book an appointment
app.post('/api/appointments', (req, res) => {
  try {
    const { patientName, email, phone, date, time, doctor, reason } = req.body;
    
    // Validation
    if (!patientName || !email || !phone || !date || !time || !doctor) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const data = readAppointments();
    const appointment = {
      id: Date.now().toString(),
      patientName,
      email,
      phone,
      date,
      time,
      doctor,
      reason: reason || '',
      status: 'confirmed',
      bookedAt: new Date().toISOString()
    };
    
    data.appointments.push(appointment);
    writeAppointments(data);
    
    res.status(201).json({ 
      success: true, 
      message: 'Appointment booked successfully',
      appointment 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// Cancel an appointment
app.put('/api/appointments/:id/cancel', (req, res) => {
  try {
    const { id } = req.params;
    const data = readAppointments();
    
    const appointment = data.appointments.find(apt => apt.id === id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    appointment.status = 'cancelled';
    writeAppointments(data);
    
    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// Get dashboard data
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const data = readAppointments();
    const appointments = data.appointments;
    
    const stats = {
      totalAppointments: appointments.length,
      confirmedAppointments: appointments.filter(apt => apt.status === 'confirmed').length,
      cancelledAppointments: appointments.filter(apt => apt.status === 'cancelled').length,
      todayAppointments: appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Serve dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Hospital Appointments System running on http://localhost:${PORT}`);
  console.log(`Patient Booking: http://localhost:${PORT}`);
  console.log(`Admin Dashboard: http://localhost:${PORT}/dashboard`);
});
