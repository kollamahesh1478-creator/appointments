// Constants
const STORAGE_KEY = 'hospitalAppointmentsData';
const ADMIN_KEY = 'hospitalAdmins';

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    setMinimumDate();
    loadDoctors();
    updateHeaderName();
    updateAdminUI();
    showBookingPage();
});

// Initialize data structure
function initializeApp() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        const defaultData = {
            hospitalName: 'OM SUPATHAM HOSPITAL',
            hospitalLogo: null,
            hospitalPhone: '+91-98765-43210',
            hospitalAddress: 'OPP KFC Street, BHAVANI NAGAR, Tirupati, AP 517501',
            hospitalHoursText: 'Mon-Sat: 9:00 AM - 5:00 PM',
            hospitalHours: {
                weekdayStart: '09:00',
                weekdayEnd: '17:00',
                saturdayStart: '10:00',
                saturdayEnd: '14:00'
            },
            doctors: [
                { id: 1, name: 'Dr. John Smith', specialty: 'General Medicine', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
                { id: 2, name: 'Dr. Sarah Johnson', specialty: 'Cardiology', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
                { id: 3, name: 'Dr. Mike Davis', specialty: 'Orthopedics', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
                { id: 4, name: 'Dr. Emily Wilson', specialty: 'Dermatology', startTime: '09:00', endTime: '17:00', slotDuration: 30 }
            ],
            appointments: [],
            appointmentRequests: [],
            contactMessages: [],
            paymentSettings: {
                fee: 500,
                description: 'Consultation Fee',
                enableQR: true,
                enablePaymentLink: true
            }
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    }

    // Initialize admin accounts with role and permissions
    if (!localStorage.getItem(ADMIN_KEY)) {
        const defaultAdmins = [
            {
                id: 1,
                email: 'admin@hospital.com',
                password: 'admin123',
                name: 'Main Admin',
                role: 'super_admin',
                permissions: {
                    hospital_info: true,
                    doctors: true,
                    timings: true,
                    payments: true,
                    requests: true,
                    admins: true
                }
            }
        ];
        localStorage.setItem(ADMIN_KEY, JSON.stringify(defaultAdmins));
    }
}

// Get all data
function getData() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

// Save data
function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Get admin accounts
function getAdmins() {
    return JSON.parse(localStorage.getItem(ADMIN_KEY)) || [];
}

// Save admin accounts
function saveAdmins(admins) {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admins));
}

// Update header name
function updateHeaderName() {
    const data = getData();
    document.getElementById('hospitalNameDisplay').textContent = '[H] ' + data.hospitalName;
    if (data.hospitalLogo) {
        const logoImg = document.querySelector('.hospital-logo');
        if (logoImg) logoImg.src = data.hospitalLogo;
    }
}

function contactHospital() {
    const data = getData();
    const phone = document.getElementById('hospitalPhone');
    if (phone) phone.textContent = data.hospitalPhone || '+91-XXXXXXXXXX';
    document.getElementById('hospitalContactName').textContent = data.hospitalName;
    document.getElementById('hospitalContactAddress').innerHTML = '<strong>Address:</strong> ' + (data.hospitalAddress || 'OPP KFC Street, BHAVANI NAGAR, Tirupati, AP 517501');
    document.getElementById('hospitalContactHours').innerHTML = '<strong>Hours:</strong> ' + (data.hospitalHoursText || 'Mon-Sat: 9:00 AM - 5:00 PM');
    document.getElementById('contactModal').style.display = 'flex';
}

function closeContactModal() {
    document.getElementById('contactModal').style.display = 'none';
}

function submitContact(event) {
    event.preventDefault();

    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const phone = document.getElementById('contactPhone').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;

    if (!name || !email || !phone || !subject || !message) {
        alert('Please complete all contact fields.');
        return;
    }

    const data = getData();
    const contactEntry = {
        id: Date.now().toString(),
        name: name,
        email: email,
        phone: phone,
        subject: subject,
        message: message,
        status: 'unread',
        createdAt: new Date().toISOString()
    };

    data.contactMessages = data.contactMessages || [];
    data.contactMessages.unshift(contactEntry);
    saveData(data);

    document.getElementById('contactSuccess').style.display = 'block';
    document.getElementById('contactName').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactPhone').value = '';
    document.getElementById('contactSubject').value = '';
    document.getElementById('contactMessage').value = '';

    updateMessagesBadge();
    loadMessagesList();
    document.getElementById('messagesBadge').textContent = getUnreadMessageCount();

    setTimeout(function () {
        document.getElementById('contactSuccess').style.display = 'none';
        closeContactModal();
    }, 2500);
}

function getUnreadMessageCount() {
    const data = getData();
    return (data.contactMessages || []).filter(function (msg) { return msg.status === 'unread'; }).length;
}

function updateMessagesBadge() {
    const badge = document.getElementById('messagesBadge');
    if (!badge) return;
    const count = getUnreadMessageCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
}

function loadMessagesList() {
    const data = getData();
    const messagesList = document.getElementById('messagesList');
    const unreadCount = getUnreadMessageCount();

    if (messagesList) {
        if (!data.contactMessages || data.contactMessages.length === 0) {
            messagesList.innerHTML = '<div class="empty-message">No contact messages yet</div>';
            return;
        }

        messagesList.innerHTML = data.contactMessages.map(function (msg) {
            return '<div class="contact-message-item ' + (msg.status === 'unread' ? 'unread-message' : '') + '">' +
                '<div class="contact-message-header">' +
                '<div><h4>' + msg.subject + '</h4><p>' + msg.name + ' - ' + msg.email + ' - ' + msg.phone + '</p></div>' +
                '<span class="status-badge" style="background: ' + (msg.status === 'unread' ? '#fee2e2' : '#d1fae5') + '; color: ' + (msg.status === 'unread' ? '#991b1b' : '#065f46') + ';">' + msg.status.toUpperCase() + '</span>' +
                '</div>' +
                '<div class="contact-message-body">' +
                '<p>' + msg.message + '</p>' +
                '<small>Received: ' + new Date(msg.createdAt).toLocaleString() + '</small>' +
                '</div>' +
                '<div class="contact-message-actions">' +
                (msg.status === 'unread' ? '<button class="btn btn-primary" onclick="markMessageAsRead(\'' + msg.id + '\')">Mark as Read</button>' : '') +
                '<button class="btn btn-danger" onclick="deleteMessage(\'' + msg.id + '\')">Delete</button>' +
                '</div></div>';
        }).join('');
    }

    const contactCount = document.getElementById('contactCount');
    if (contactCount) {
        contactCount.textContent = unreadCount;
    }
}

function markMessageAsRead(id) {
    const data = getData();
    const message = (data.contactMessages || []).find(function (msg) { return msg.id === id; });
    if (message) {
        message.status = 'read';
        saveData(data);
        updateMessagesBadge();
        loadMessagesList();
        loadDashboardData();
    }
}

function clearAllMessages() {
    if (!confirm('Remove all contact messages?')) return;
    const data = getData();
    data.contactMessages = [];
    saveData(data);
    updateMessagesBadge();
    loadMessagesList();
    loadDashboardData();
}

function markAllAsRead() {
    const data = getData();
    (data.contactMessages || []).forEach(function (msg) {
        msg.status = 'read';
    });
    saveData(data);
    updateMessagesBadge();
    loadMessagesList();
    loadDashboardData();
}

// PAGE NAVIGATION
function showLoginPage() {
    hideAllPages();
    document.getElementById('loginPage').style.display = 'block';
    setActiveNav('');
}

function showBookingPage() {
    hideAllPages();
    document.getElementById('bookingPage').style.display = 'block';
    setActiveNav('navBooking');
}

function showDashboard() {
    if (!isAdminLoggedIn()) {
        showLoginPage();
        return;
    }
    hideAllPages();
    document.getElementById('dashboardPage').style.display = 'block';
    setActiveNav('navDashboard');
    loadDashboardData();
}

function showSettings() {
    if (!isAdminLoggedIn()) {
        showLoginPage();
        return;
    }
    hideAllPages();
    document.getElementById('settingsPage').style.display = 'block';
    setActiveNav('navSettings');
    loadSettingsPage();
}

function hideAllPages() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('bookingPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'none';
    document.getElementById('settingsPage').style.display = 'none';
}

function setActiveNav(navId) {
    document.querySelectorAll('.nav-link').forEach(function (link) {
        link.classList.remove('active');
    });
    if (navId) {
        var el = document.getElementById(navId);
        if (el) el.classList.add('active');
    }
}

// ADMIN LOGIN/LOGOUT
function adminLogin(event) {
    event.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const admins = getAdmins();

    const admin = admins.find(function (a) { return a.email === email && a.password === password; });

    if (admin) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('currentAdmin', JSON.stringify(admin));
        document.getElementById('adminEmail').value = '';
        document.getElementById('adminPassword').value = '';
        document.getElementById('loginError').style.display = 'none';
        updateAdminUI();
        showDashboard();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

function adminLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('currentAdmin');
    updateAdminUI();
    showBookingPage();
}

function isAdminLoggedIn() {
    return sessionStorage.getItem('adminLoggedIn') === 'true';
}

function updateAdminUI() {
    const loggedIn = isAdminLoggedIn();
    document.getElementById('adminLoginBtn').style.display = loggedIn ? 'none' : 'block';
    document.getElementById('adminLogoutBtn').style.display = loggedIn ? 'block' : 'none';
    document.getElementById('navDashboard').style.display = loggedIn ? 'block' : 'none';
    document.getElementById('navSettings').style.display = loggedIn ? 'block' : 'none';

    if (loggedIn) {
        const admin = JSON.parse(sessionStorage.getItem('currentAdmin'));
        const roleDisplay = document.getElementById('currentRoleDisplay');
        const userDisplay = document.getElementById('currentUserDisplay');
        if (roleDisplay && userDisplay) {
            userDisplay.textContent = 'Logged in as: ' + admin.email;
            roleDisplay.textContent = 'Role: ' + formatRoleName(admin.role) + ' | ' + getPermissionsText(admin.permissions);
        }
        updateMessagesBadge();
    } else {
        const roleDisplay = document.getElementById('currentRoleDisplay');
        const userDisplay = document.getElementById('currentUserDisplay');
        if (roleDisplay && userDisplay) {
            userDisplay.textContent = '';
            roleDisplay.textContent = '';
        }
    }
}

// ROLE AND PERMISSION MANAGEMENT
function getCurrentAdmin() {
    return JSON.parse(sessionStorage.getItem('currentAdmin'));
}

function formatRoleName(role) {
    const roles = {
        'super_admin': 'Super Admin',
        'admin': 'Admin',
        'manager': 'Manager'
    };
    return roles[role] || role;
}

function hasPermission(permission) {
    const admin = getCurrentAdmin();
    if (!admin) return false;
    if (admin.role === 'super_admin') return true;
    return admin.permissions[permission] === true;
}

function getPermissionsText(permissions) {
    const perms = [];
    const permNames = {
        'hospital_info': 'Hospital',
        'doctors': 'Doctors',
        'timings': 'Timings',
        'payments': 'Payments',
        'requests': 'Requests',
        'admins': 'Admin Mgmt'
    };

    for (const key in permissions) {
        if (permissions[key]) {
            perms.push(permNames[key] || key);
        }
    }

    return perms.length > 0 ? 'Permissions: ' + perms.join(', ') : 'Limited Access';
}

function checkPermissionAndHide(permission, tabId) {
    const hasAccess = hasPermission(permission);
    const tabBtn = document.querySelector('[onclick="showTab(\'' + tabId + '\')"]');
    const tabContent = document.getElementById(tabId);

    if (tabBtn) {
        tabBtn.style.display = hasAccess ? 'block' : 'none';
    }
    if (tabContent) {
        if (!hasAccess) {
            tabContent.innerHTML = '<div class="permission-denied"><h3>Access Denied</h3><p>You do not have permission to access this section.</p></div>';
        }
    }

    return hasAccess;
}

// PATIENT BOOKING
function setMinimumDate() {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    dateInput.addEventListener('change', loadAvailableTimes);
    document.getElementById('doctor').addEventListener('change', loadAvailableTimes);
}

function loadDoctors() {
    const data = getData();
    const doctorSelect = document.getElementById('doctor');
    doctorSelect.innerHTML = '<option value="">-- Choose a Doctor --</option>';

    data.doctors.forEach(function (doctor) {
        const option = document.createElement('option');
        option.value = doctor.name;
        option.textContent = doctor.name + ' (' + doctor.specialty + ')';
        doctorSelect.appendChild(option);
    });
}

function loadAvailableTimes() {
    const date = document.getElementById('date').value;
    const doctorName = document.getElementById('doctor').value;
    const timeSelect = document.getElementById('time');

    if (!date || !doctorName) {
        timeSelect.innerHTML = '<option value="">-- Select date and doctor first --</option>';
        return;
    }

    const data = getData();
    const doctor = data.doctors.find(function (d) { return d.name === doctorName; });
    if (!doctor) return;

    const slots = generateTimeSlots(doctor.startTime, doctor.endTime, doctor.slotDuration);
    const bookedSlots = data.appointments
        .filter(function (apt) { return apt.date === date && apt.doctor === doctorName && apt.status === 'confirmed'; })
        .map(function (apt) { return apt.time; });

    const availableSlots = slots.filter(function (slot) { return !bookedSlots.includes(slot); });

    timeSelect.innerHTML = '<option value="">-- Select Time --</option>';
    if (availableSlots.length > 0) {
        availableSlots.forEach(function (slot) {
            const option = document.createElement('option');
            option.value = slot;
            option.textContent = slot;
            timeSelect.appendChild(option);
        });
    } else {
        timeSelect.innerHTML = '<option value="">-- No available slots --</option>';
    }
}

function generateTimeSlots(startTime, endTime, durationMinutes) {
    const slots = [];
    const startParts = startTime.split(':');
    const endParts = endTime.split(':');
    const startHour = parseInt(startParts[0]);
    const startMin = parseInt(startParts[1]);
    const endHour = parseInt(endParts[0]);
    const endMin = parseInt(endParts[1]);

    let currentTime = startHour * 60 + startMin;
    const endTimeMinutes = endHour * 60 + endMin;

    while (currentTime < endTimeMinutes) {
        const hours = Math.floor(currentTime / 60);
        const minutes = currentTime % 60;
        const hourStr = hours < 10 ? '0' + hours : '' + hours;
        const minStr = minutes < 10 ? '0' + minutes : '' + minutes;
        slots.push(hourStr + ':' + minStr);
        currentTime += durationMinutes;
    }

    return slots;
}

function bookAppointment(event) {
    event.preventDefault();

    const patientName = document.getElementById('patientName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const doctor = document.getElementById('doctor').value;
    const reason = document.getElementById('reason').value;

    if (!patientName || !email || !phone || !date || !time || !doctor) {
        document.getElementById('errorMessage').textContent = 'X Please fill all required fields';
        document.getElementById('errorMessage').style.display = 'block';
        return;
    }

    const data = getData();
    const appointmentRequest = {
        id: Date.now().toString(),
        patientName: patientName,
        email: email,
        phone: phone,
        date: date,
        time: time,
        doctor: doctor,
        reason: reason || '',
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: new Date().toISOString()
    };

    data.appointmentRequests.push(appointmentRequest);
    saveData(data);

    document.getElementById('successMessage').style.display = 'block';
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('appointmentForm').reset();
    document.getElementById('time').innerHTML = '<option value="">-- Select date and doctor first --</option>';

    setTimeout(function () {
        document.getElementById('successMessage').style.display = 'none';
    }, 5000);
}

// ADMIN DASHBOARD
function loadDashboardData() {
    const data = getData();
    const appointments = data.appointments;
    const today = new Date().toISOString().split('T')[0];

    document.getElementById('totalAppointments').textContent = appointments.length;
    document.getElementById('confirmedCount').textContent = appointments.filter(function (a) { return a.status === 'confirmed'; }).length;
    document.getElementById('cancelledCount').textContent = appointments.filter(function (a) { return a.status === 'cancelled'; }).length;
    document.getElementById('todayCount').textContent = appointments.filter(function (a) { return a.date === today && a.status === 'confirmed'; }).length;
    document.getElementById('contactCount').textContent = getUnreadMessageCount();

    const appointmentsList = document.getElementById('appointmentsList');
    if (appointments.length === 0) {
        appointmentsList.innerHTML = '<div class="empty-message">No appointments yet</div>';
        return;
    }

    const sorted = appointments.slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

    appointmentsList.innerHTML = sorted.map(function (apt) {
        return '<div class="appointment-item">' +
            '<div class="appointment-header">' +
            '<div class="appointment-name">' + apt.patientName + '</div>' +
            '<span class="appointment-status ' + (apt.status === 'confirmed' ? 'status-confirmed' : 'status-cancelled') + '">' +
            apt.status.charAt(0).toUpperCase() + apt.status.slice(1) +
            '</span></div>' +
            '<div class="appointment-details">' +
            '<div class="appointment-detail"><strong>Email:</strong> ' + apt.email + '</div>' +
            '<div class="appointment-detail"><strong>Phone:</strong> ' + apt.phone + '</div>' +
            '<div class="appointment-detail"><strong>Doctor:</strong> ' + apt.doctor + '</div>' +
            '<div class="appointment-detail"><strong>Date:</strong> ' + new Date(apt.date).toLocaleDateString() + '</div>' +
            '<div class="appointment-detail"><strong>Time:</strong> ' + apt.time + '</div>' +
            '<div class="appointment-detail"><strong>Reason:</strong> ' + (apt.reason || '-') + '</div>' +
            '</div>' +
            (apt.status === 'confirmed' ? '<div class="appointment-actions"><button class="btn-cancel" onclick="cancelAppointment(\'' + apt.id + '\')">Cancel Appointment</button></div>' : '') +
            '</div>';
    }).join('');
}

function cancelAppointment(id) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    const data = getData();
    const apt = data.appointments.find(function (a) { return a.id === id; });
    if (apt) {
        apt.status = 'cancelled';
        saveData(data);
        loadDashboardData();
    }
}

// ADMIN SETTINGS
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(function (tab) {
        tab.classList.remove('active');
        tab.style.display = 'none';
    });
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
        btn.classList.remove('active');
    });

    const tabElement = document.getElementById(tabId);
    if (tabElement) {
        tabElement.classList.add('active');
        tabElement.style.display = 'block';
    }

    if (event && event.target) {
        event.target.classList.add('active');
    }
}

function updateHospitalInfo(event) {
    event.preventDefault();

    if (!hasPermission('hospital_info')) {
        alert('You do not have permission to edit hospital information');
        return;
    }

    const data = getData();

    data.hospitalName = document.getElementById('hospitalName').value;
    data.hospitalHours = {
        weekdayStart: document.getElementById('weekdayStart').value,
        weekdayEnd: document.getElementById('weekdayEnd').value,
        saturdayStart: document.getElementById('saturdayStart').value,
        saturdayEnd: document.getElementById('saturdayEnd').value
    };

    saveData(data);
    updateHeaderName();

    document.getElementById('hospitalSuccess').style.display = 'block';
    setTimeout(function () {
        document.getElementById('hospitalSuccess').style.display = 'none';
    }, 3000);
}

function addDoctor(event) {
    event.preventDefault();

    if (!hasPermission('doctors')) {
        alert('You do not have permission to manage doctors');
        return;
    }

    const data = getData();

    const doctor = {
        id: Date.now(),
        name: document.getElementById('doctorName').value,
        specialty: document.getElementById('doctorSpecialty').value,
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 30
    };

    data.doctors.push(doctor);
    saveData(data);

    document.getElementById('doctorName').value = '';
    document.getElementById('doctorSpecialty').value = '';

    loadDoctorsList();
    loadDoctors();
    loadTimingsDoctorSelect();
}

function loadDoctorsList() {
    const data = getData();
    const doctorsList = document.getElementById('doctorsList');
    const noDoctorsMsg = document.getElementById('noDoctorsMsg');

    if (data.doctors.length === 0) {
        doctorsList.innerHTML = '';
        noDoctorsMsg.style.display = 'block';
        return;
    }

    noDoctorsMsg.style.display = 'none';
    doctorsList.innerHTML = data.doctors.map(function (doctor) {
        return '<div class="doctor-item">' +
            '<div class="doctor-info">' +
            '<h4>' + doctor.name + '</h4>' +
            '<p>' + doctor.specialty + '</p>' +
            '</div>' +
            '<div class="doctor-actions">' +
            '<button class="btn-delete" onclick="deleteDoctor(' + doctor.id + ')">Delete</button>' +
            '</div></div>';
    }).join('');
}

function deleteDoctor(id) {
    if (!hasPermission('doctors')) {
        alert('You do not have permission to delete doctors');
        return;
    }

    if (!confirm('Are you sure you want to delete this doctor? This will also delete all their appointments.')) return;

    const data = getData();
    const doctor = data.doctors.find(function (d) { return d.id === id; });
    if (!doctor) return;

    data.doctors = data.doctors.filter(function (d) { return d.id !== id; });
    data.appointments = data.appointments.filter(function (apt) { return apt.doctor !== doctor.name; });
    saveData(data);

    loadDoctorsList();
    loadDoctors();
    loadTimingsDoctorSelect();
}

function loadTimingsDoctorSelect() {
    const data = getData();
    const select = document.getElementById('timingDoctor');
    select.innerHTML = '<option value="">-- Choose a Doctor --</option>';

    data.doctors.forEach(function (doctor) {
        const option = document.createElement('option');
        option.value = doctor.id;
        option.textContent = doctor.name + ' (' + doctor.specialty + ')';
        select.appendChild(option);
    });
}

function loadDoctorTimingDetails() {
    const doctorId = document.getElementById('timingDoctor').value;
    if (!doctorId) {
        document.getElementById('timingDetails').style.display = 'none';
        return;
    }

    const data = getData();
    const doctor = data.doctors.find(function (d) { return d.id === parseInt(doctorId); });

    if (doctor) {
        document.getElementById('startTime').value = doctor.startTime;
        document.getElementById('endTime').value = doctor.endTime;
        document.getElementById('slotDuration').value = doctor.slotDuration;
        document.getElementById('timingDetails').style.display = 'block';
    }
}

function updateDoctorTimings(event) {
    event.preventDefault();

    if (!hasPermission('timings')) {
        alert('You do not have permission to manage doctor timings');
        return;
    }

    const doctorId = document.getElementById('timingDoctor').value;

    if (!doctorId) {
        alert('Please select a doctor');
        return;
    }

    const data = getData();
    const doctor = data.doctors.find(function (d) { return d.id === parseInt(doctorId); });

    if (doctor) {
        doctor.startTime = document.getElementById('startTime').value;
        doctor.endTime = document.getElementById('endTime').value;
        doctor.slotDuration = parseInt(document.getElementById('slotDuration').value);
        saveData(data);

        alert('Doctor timings updated successfully!');
        loadAvailableTimes();
    }
}

// LOGO MANAGEMENT
function updateLogo() {
    const fileInput = document.getElementById('hospitalLogo');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const data = getData();
            data.hospitalLogo = e.target.result;
            saveData(data);
            document.getElementById('logoImg').src = e.target.result;
            document.getElementById('logoImg').style.display = 'block';
            updateHeaderName();
        };
        reader.readAsDataURL(file);
    }
}

// ADMIN MANAGEMENT
function addAdmin(event) {
    event.preventDefault();

    const email = document.getElementById('adminNewEmail').value;
    const password = document.getElementById('adminNewPassword').value;
    const role = document.getElementById('adminRole').value;
    const admins = getAdmins();

    if (admins.find(function (a) { return a.email === email; })) {
        alert('Email already exists');
        return;
    }

    const permissions = {
        hospital_info: document.getElementById('perm_hospital_info').checked,
        doctors: document.getElementById('perm_doctors').checked,
        timings: document.getElementById('perm_timings').checked,
        payments: document.getElementById('perm_payments').checked,
        requests: document.getElementById('perm_requests').checked,
        admins: document.getElementById('perm_admins').checked
    };

    if (role === 'super_admin') {
        permissions.hospital_info = true;
        permissions.doctors = true;
        permissions.timings = true;
        permissions.payments = true;
        permissions.requests = true;
        permissions.admins = true;
    } else if (role === 'admin') {
        permissions.hospital_info = true;
        permissions.doctors = true;
        permissions.timings = true;
        permissions.payments = true;
        permissions.requests = true;
    } else if (role === 'manager') {
        permissions.requests = true;
        permissions.payments = false;
        permissions.admins = false;
    }

    const newAdmin = {
        id: Date.now(),
        email: email,
        password: password,
        name: email.split('@')[0],
        role: role,
        permissions: permissions
    };

    admins.push(newAdmin);
    saveAdmins(admins);

    document.getElementById('adminNewEmail').value = '';
    document.getElementById('adminNewPassword').value = '';
    document.getElementById('adminRole').value = 'admin';

    document.getElementById('perm_hospital_info').checked = true;
    document.getElementById('perm_doctors').checked = true;
    document.getElementById('perm_timings').checked = true;
    document.getElementById('perm_payments').checked = true;
    document.getElementById('perm_requests').checked = true;
    document.getElementById('perm_admins').checked = true;

    loadAdminsList();

    const successMsg = document.getElementById('adminAddSuccess');
    if (successMsg) {
        successMsg.style.display = 'block';
        setTimeout(function () {
            successMsg.style.display = 'none';
        }, 3000);
    }
}

function loadAdminsList() {
    const admins = getAdmins();
    const adminsList = document.getElementById('adminsList');

    if (admins.length === 0) {
        adminsList.innerHTML = '<div class="empty-message">No admins</div>';
        return;
    }

    adminsList.innerHTML = admins.map(function (admin) {
        return '<div class="admin-item">' +
            '<div class="admin-info">' +
            '<h4>' + admin.email + '</h4>' +
            '<p>' + admin.name + '</p>' +
            '<div style="margin-top: 8px;">' +
            '<span class="role-badge" style="background: ' + getRoleColor(admin.role) + '; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem;">' + formatRoleName(admin.role) + '</span>' +
            '</div>' +
            '<div style="margin-top: 8px; font-size: 0.85rem; color: #666;">' +
            '<strong>Permissions:</strong>' +
            '<div style="margin-top: 4px;">' +
            (admin.permissions.hospital_info ? 'v Hospital Info ' : '') +
            (admin.permissions.doctors ? 'v Doctors ' : '') +
            (admin.permissions.timings ? 'v Timings ' : '') + '<br/>' +
            (admin.permissions.payments ? 'v Payments ' : '') +
            (admin.permissions.requests ? 'v Requests ' : '') +
            (admin.permissions.admins ? 'v Manage Admins ' : '') +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="admin-actions">' +
            (admin.id !== 1 ? '<button class="btn-delete" onclick="deleteAdmin(' + admin.id + ')">Delete</button>' : '<span style="color: #999;">Main Admin</span>') +
            '</div></div>';
    }).join('');
}

function getRoleColor(role) {
    const colors = {
        'super_admin': '#7c3aed',
        'admin': '#2563eb',
        'manager': '#0891b2'
    };
    return colors[role] || '#666';
}

function deleteAdmin(id) {
    if (!confirm('Are you sure you want to delete this admin account?')) return;

    let admins = getAdmins();
    admins = admins.filter(function (a) { return a.id !== id; });
    saveAdmins(admins);

    loadAdminsList();
    alert('Admin deleted successfully!');
}

// PAYMENT SETTINGS
function updatePaymentSettings(event) {
    event.preventDefault();

    if (!hasPermission('payments')) {
        alert('You do not have permission to manage payment settings');
        return;
    }

    const data = getData();

    data.paymentSettings = {
        fee: parseFloat(document.getElementById('appointmentFee').value),
        description: document.getElementById('paymentDescription').value,
        enableQR: document.getElementById('enableQR').checked,
        enablePaymentLink: document.getElementById('enablePaymentLink').checked
    };

    saveData(data);

    document.getElementById('paymentSuccess').style.display = 'block';
    setTimeout(function () {
        document.getElementById('paymentSuccess').style.display = 'none';
    }, 3000);
}

// APPOINTMENT REQUESTS MANAGEMENT
function loadSettingsPage() {
    const data = getData();

    document.getElementById('hospitalName').value = data.hospitalName;
    document.getElementById('weekdayStart').value = data.hospitalHours.weekdayStart;
    document.getElementById('weekdayEnd').value = data.hospitalHours.weekdayEnd;
    document.getElementById('saturdayStart').value = data.hospitalHours.saturdayStart;
    document.getElementById('saturdayEnd').value = data.hospitalHours.saturdayEnd;

    document.getElementById('appointmentFee').value = data.paymentSettings.fee;
    document.getElementById('paymentDescription').value = data.paymentSettings.description;
    document.getElementById('enableQR').checked = data.paymentSettings.enableQR;
    document.getElementById('enablePaymentLink').checked = data.paymentSettings.enablePaymentLink;

    loadDoctorsList();
    loadTimingsDoctorSelect();

    if (hasPermission('admins')) {
        loadAdminsList();
    } else {
        const adminsList = document.getElementById('adminsList');
        if (adminsList) {
            adminsList.innerHTML = '<div class="permission-denied"><h3>Access Denied</h3><p>You do not have permission to manage admin users.</p></div>';
        }
    }

    updateMessagesBadge();
    loadMessagesList();

    const adminsTab = document.querySelector('[onclick="showTab(\'admins-tab\')"]');
    if (adminsTab) {
        adminsTab.style.display = hasPermission('admins') ? 'block' : 'none';
    }

    const hospitalTab = document.querySelector('[onclick="showTab(\'hospital-tab\')"]');
    if (hospitalTab) {
        hospitalTab.style.display = hasPermission('hospital_info') ? 'block' : 'none';
    }

    const doctorsTab = document.querySelector('[onclick="showTab(\'doctors-tab\')"]');
    if (doctorsTab) {
        doctorsTab.style.display = hasPermission('doctors') ? 'block' : 'none';
    }

    const timingsTab = document.querySelector('[onclick="showTab(\'timings-tab\')"]');
    if (timingsTab) {
        timingsTab.style.display = hasPermission('timings') ? 'block' : 'none';
    }

    const paymentTab = document.querySelector('[onclick="showTab(\'payment-tab\')"]');
    if (paymentTab) {
        paymentTab.style.display = hasPermission('payments') ? 'block' : 'none';
    }

    const requestsTab = document.querySelector('[onclick="showTab(\'requests-tab\')"]');
    if (requestsTab) {
        requestsTab.style.display = hasPermission('requests') ? 'block' : 'none';
    }

    loadRequestsList();

    if (hasPermission('hospital_info')) {
        showTab('hospital-tab');
    } else if (hasPermission('doctors')) {
        showTab('doctors-tab');
    } else if (hasPermission('requests')) {
        showTab('requests-tab');
    }
}

function loadRequestsList() {
    const data = getData();
    const requestsList = document.getElementById('requestsList');

    const pendingRequests = data.appointmentRequests.filter(function (r) { return r.status === 'pending'; });

    if (pendingRequests.length === 0) {
        requestsList.innerHTML = '<div class="empty-message">No pending appointment requests</div>';
        return;
    }

    requestsList.innerHTML = pendingRequests.map(function (req) {
        return '<div class="request-item">' +
            '<div class="request-header">' +
            '<div>' +
            '<h4>' + req.patientName + '</h4>' +
            '<p>' + req.email + ' | ' + req.phone + '</p>' +
            '</div>' +
            '<span class="status-badge" style="background: #fef3c7; color: #92400e;">PENDING</span>' +
            '</div>' +
            '<div class="request-details">' +
            '<div><strong>Doctor:</strong> ' + req.doctor + '</div>' +
            '<div><strong>Date:</strong> ' + new Date(req.date).toLocaleDateString() + '</div>' +
            '<div><strong>Time:</strong> ' + req.time + '</div>' +
            '<div><strong>Reason:</strong> ' + (req.reason || '-') + '</div>' +
            '</div>' +
            '<div class="request-actions">' +
            '<button class="btn btn-success" onclick="approveRequest(\'' + req.id + '\')">Approve Send Payment</button>' +
            '<button class="btn btn-danger" onclick="rejectRequest(\'' + req.id + '\')">Reject</button>' +
            '</div></div>';
    }).join('');
}

function approveRequest(requestId) {
    if (!hasPermission('requests')) {
        alert('You do not have permission to approve appointment requests');
        return;
    }

    const data = getData();
    const request = data.appointmentRequests.find(function (r) { return r.id === requestId; });

    if (request) {
        request.status = 'approved';
        saveData(data);

        currentPaymentRequest = request;
        showPaymentModal(request);
    }
}

function rejectRequest(requestId) {
    if (!hasPermission('requests')) {
        alert('You do not have permission to reject appointment requests');
        return;
    }

    if (!confirm('Are you sure you want to reject this request?')) return;

    const data = getData();
    const request = data.appointmentRequests.find(function (r) { return r.id === requestId; });

    if (request) {
        request.status = 'rejected';
        saveData(data);
        loadRequestsList();
        alert('Request rejected');
    }
}

let currentPaymentRequest = null;

function showPaymentModal(request) {
    const data = getData();
    const fee = data.paymentSettings.fee;

    const paymentDetails = document.getElementById('paymentDetails');
    paymentDetails.innerHTML = '<div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 15px 0;">' +
        '<p><strong>Patient:</strong> ' + request.patientName + '</p>' +
        '<p><strong>Email:</strong> ' + request.email + '</p>' +
        '<p><strong>Amount:</strong> ' + fee + '</p>' +
        '<p><strong>Description:</strong> ' + data.paymentSettings.description + '</p>' +
        '</div>';

    if (!data.paymentSettings.enableQR) {
        document.getElementById('qrBtn').style.display = 'none';
    }
    if (!data.paymentSettings.enablePaymentLink) {
        document.getElementById('linkBtn').style.display = 'none';
    }

    document.getElementById('paymentModal').style.display = 'block';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
    document.getElementById('qrSection').style.display = 'none';
    document.getElementById('linkSection').style.display = 'none';
    currentPaymentRequest = null;
}

function showQRCode() {
    const data = getData();
    const qrSection = document.getElementById('qrSection');
    qrSection.style.display = 'block';

    const qrContainer = document.getElementById('qrCodeContainer');
    qrContainer.innerHTML = '<div style="background: white; padding: 20px; border-radius: 8px; display: inline-block;">' +
        '<div style="width: 200px; height: 200px; background: #ddd; border-radius: 8px; display: flex; align-items: center; justify-content: center;">' +
        '<div style="text-align: center;">' +
        '<div style="font-size: 2rem; margin-bottom: 10px;">QR CODE</div>' +
        '<p>QR Code for Payment</p>' +
        '<small style="color: #999;">Amount: ' + data.paymentSettings.fee + '</small>' +
        '</div>' +
        '</div>' +
        '</div>';
}

function generatePaymentLink() {
    const data = getData();
    const linkSection = document.getElementById('linkSection');
    linkSection.style.display = 'block';

    const paymentLink = 'https://payment.hospital.com/pay?amount=' + data.paymentSettings.fee + '&patient=' + currentPaymentRequest.email + '&id=' + currentPaymentRequest.id;
    document.getElementById('paymentLinkCode').textContent = paymentLink;
}

function copyPaymentLink() {
    const link = document.getElementById('paymentLinkCode').textContent;
    navigator.clipboard.writeText(link);
    alert('Payment link copied!');
}

function deleteMessage(id) {
    if (!confirm('Delete this message?')) return;
    const data = getData();
    data.contactMessages = (data.contactMessages || []).filter(function (msg) { return msg.id !== id; });
    saveData(data);
    updateMessagesBadge();
    loadMessagesList();
    loadDashboardData();
}
