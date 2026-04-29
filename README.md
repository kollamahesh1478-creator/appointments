# Hospital Appointments Booking System

A simple and easy-to-use web application for patients to book hospital appointments and for staff to manage bookings.

## Features

- ✅ **Simple Appointment Booking** - Patients can easily book appointments in 5 steps
- ✅ **Doctor Selection** - Choose from available doctors
- ✅ **Time Slot Management** - See available time slots based on doctor and date
- ✅ **Admin Dashboard** - View all appointments and statistics
- ✅ **Appointment Cancellation** - Cancel appointments from dashboard
- ✅ **Real-time Updates** - Dashboard updates automatically
- ✅ **Responsive Design** - Works on desktop and mobile devices

## Project Structure

```
├── public/
│   ├── index.html          # Patient booking page
│   ├── style.css           # Frontend styling
│   └── script.js           # Frontend JavaScript
├── views/
│   └── dashboard.html      # Admin dashboard
├── data/
│   └── appointments.json   # Appointments database
├── server.js               # Express server
├── package.json            # Dependencies
└── README.md               # This file
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Setup Steps

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
   - Patient Booking: `http://localhost:3000`
   - Admin Dashboard: `http://localhost:3000/dashboard`

## Usage

### For Patients
1. Go to `http://localhost:3000`
2. Fill in your personal details (name, email, phone)
3. Select your preferred doctor
4. Choose a date and available time slot
5. (Optional) Add reason for visit
6. Click "Book Appointment"
7. Check your email for confirmation

### For Admin/Staff
1. Go to `http://localhost:3000/dashboard`
2. View all appointments and statistics
3. See today's appointments count
4. Cancel appointments if needed

## Available Doctors

- Dr. John Smith (General Medicine)
- Dr. Sarah Johnson (Cardiology)
- Dr. Mike Davis (Orthopedics)
- Dr. Emily Wilson (Dermatology)

## Hospital Hours

- **Monday - Friday**: 9:00 AM - 5:00 PM
- **Saturday**: 10:00 AM - 2:00 PM
- **Sunday**: Closed

## API Endpoints

### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Book a new appointment
- `PUT /api/appointments/:id/cancel` - Cancel an appointment
- `GET /api/available-slots` - Get available time slots

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /dashboard` - Serve dashboard page

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: JSON (File-based)
- **Styling**: Custom CSS with responsive design

## Data Storage

Appointments are stored in `data/appointments.json` file. Each appointment contains:
- Patient information (name, email, phone)
- Appointment details (date, time, doctor, reason)
- Status (confirmed/cancelled)
- Booking timestamp

## Future Enhancements

- Email notifications for appointments
- SMS reminders
- Doctor schedules management
- Patient login system
- Appointment history
- Database migration (to MongoDB/PostgreSQL)
- Multi-language support
- Payment integration

## License

MIT License

## Support

For issues or questions, please contact the development team.
