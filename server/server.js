const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

app.use(bodyParser.json());
const bcrypt = require('bcrypt'); // Make sure you've added bcrypt to your project
require('dotenv').config();
const app = express();
const port = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

// Connect to your MongoDB database
mongoose.connect(MONGO_URI);

// Define a User model
const User = mongoose.model('User', {
  username: String,
  password: String,
});

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+ '/client'+'/index.html'));

});

// Registration route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Check if the user already exists
  const existingUser = await User.findOne({ username });

  if (existingUser) {
    return res.send('User already exists. Please log in.');
  }

  // Create a new user with password hashing
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword });

  try {
    await newUser.save();
    res.send('Welcome! You have been registered successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Registration failed.');
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Find the user by username
  const user = await User.findOne({ username });

  if (user) {
    // Compare the entered password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      return res.sendFile(path.join(__dirname+ '/client'+'/home.html'));
    }
  }

  res.sendFile(path.join(__dirname+ '/client'+'/help.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

