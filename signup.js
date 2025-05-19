const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('./models/user');

router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, dateOfBirth, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    res.status(201).json({ 
      message: "User registered successfully",
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;  


/*
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from './models/user.js';

const router = Router();

router.post('/', async (req, res) => {  // Changed from '/signup' to '/'
  const { firstName, lastName, email, phone, dob, password, confirmPassword, role } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      dob,
      password: hashed,
      role
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; */
