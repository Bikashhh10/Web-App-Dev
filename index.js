const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const signupRoute = require('./signup.js');
const loginRoute = require('./login.js');
const postJobRoute = require('./postJob.js');
const applicationsRoute = require('./applications.js');

const port = 3001;
const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/signup', signupRoute);
app.use('/api/login', loginRoute);
app.use('/api/jobs', postJobRoute);
app.use('/api/applications', applicationsRoute);

// Database Connection
mongoose.connect('mongodb://localhost:27017/job-portal')
.then(() => {
  console.log('Database connected');
  // Start the server only after DB is connected
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
})
.catch((err) => {
  console.error('DB connection error:', err);
});