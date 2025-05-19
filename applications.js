const express = require('express');
const router = express.Router();
const Application = require('./models/application');
const Job = require('./models/job');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// File upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, 'uploads/resumes');
        } else if (file.mimetype.startsWith('video/')) {
            cb(null, 'uploads/videos');
        }
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Submit application
router.post('/', verifyToken, upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'videoCV', maxCount: 1 }
]), async (req, res) => {
    try {
        const { 
            jobId, 
            coverLetter, 
            expectedSalary, 
            phoneNumber,
            location,
            skills, 
            experienceLevel
        } = req.body;

        const resumePath = req.files['resume'][0].path;
        const videoPath = req.files['videoCV'][0].path;

        const newApplication = new Application({
            jobId,
            applicantId: req.user.userId,
            resume: resumePath,
            videoCV: videoPath,
            coverLetter,
            expectedSalary,
            phoneNumber,
            location,
            skills: skills.split(',').map(skill => skill.trim()),
            experienceLevel
        });

        await newApplication.save();
        res.status(201).json({ message: 'Application submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting application', error: error.message });
    }
});

// Get applications for a specific job (employer only)
router.get('/job/:jobId', verifyToken, async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.employerId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to view these applications' });
        }

        const applications = await Application.find({ jobId })
            .populate('applicantId', 'firstName lastName email');
        
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applications', error: error.message });
    }
});

// Get user's applications
router.get('/user', verifyToken, async (req, res) => {
    try {
        const applications = await Application.find({ applicantId: req.user.userId })
            .populate('jobId', 'title company location type salary');
        
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applications', error: error.message });
    }
});

// Update application details
router.put('/:applicationId', verifyToken, async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { 
            coverLetter, 
            expectedSalary, 
            phoneNumber,
            location,
            skills, 
            experienceLevel
        } = req.body;

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Get the job to check if the user is the employer
        const job = await Job.findById(application.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.employerId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to update this application' });
        }

        // Update application fields
        application.coverLetter = coverLetter;
        application.expectedSalary = expectedSalary;
        application.phoneNumber = phoneNumber;
        application.location = location;
        application.skills = skills.split(',').map(skill => skill.trim());
        application.experienceLevel = experienceLevel;

        await application.save();

        res.json({ message: 'Application updated successfully', application });
    } catch (error) {
        res.status(500).json({ message: 'Error updating application', error: error.message });
    }
});

module.exports = router; 