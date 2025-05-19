const express = require('express');
const router = express.Router();
const Job = require('./models/job');
const jwt = require('jsonwebtoken');

// check if user is employer
const isEmployer = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, 'your-secret-key');
        if (decoded.role !== 'employer') {
            return res.status(403).json({ message: 'Only employers can post jobs' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// post a new job
router.post('/', isEmployer, async (req, res) => {
    try {
        const { title, company, location, type, salary } = req.body;
        const newJob = new Job({
            title,
            company,
            location,
            type,
            salary,
            employerId: req.user.userId
        });

        await newJob.save();
        res.status(201).json({ message: 'Job posted successfully', job: newJob });
    } catch (error) {
        res.status(500).json({ message: 'Error posting job', error: error.message });
    }
});

// get all jobs
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'Active' });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs', error: error.message });
    }
});

// get jobs posted by employer
router.get('/employer', isEmployer, async (req, res) => {
    try {
        const jobs = await Job.find({ employerId: req.user.userId });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs', error: error.message });
    }
});

module.exports = router; 