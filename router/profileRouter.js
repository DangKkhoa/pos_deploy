const express = require('express');
const multer = require('multer');
const path = require('path');
const { updateUserProfileAvatar } = require('../service/userService'); // Update the path accordingly
const con = require('../database/db')
const mysql = require('mysql2/promise');


const app = express.Router();

// Set up storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/avatars'); // Destination folder for avatars
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, 'avatar' + Date.now() + path.extname(file.originalname)); // Set a unique filename based on timestamp
    }
});

// Create multer instance with the storage configuration
const upload = multer({ storage: storage });


// Render the profile page
app.get('/', (req, res) => {
  res.render('profile', { user: req.session.user });

});
// Handle the POST request for updating the avatar
app.post('/update-avatar', upload.single('avatar'), (req, res) => {
  console.log('File uploaded:', req.file);

  if (req.file) {
    // 1. Get user ID from session
    const userId = req.session.user.user_id;

    // 2. Get the uploaded avatar path
    const avatarPath = `${req.file.filename}`;

    // 3. Update user avatar in database using updateUserAvatar function
    updateUserProfileAvatar(userId, avatarPath, con);
    //await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarPath, userId]); // Update user avatar in database
    // Handle the file upload logic here if needed
    // The uploaded file information is available in req.file
    // For example, you can save the file path to the user's profile in the database

    // Redirect back to the profile page after updating the avatar
    //res.redirect('/profile');
    return  res.redirect('/profile');
  
  }else {
    res.status(400).send('No file uploaded'); // Handle no file upload
    return 
  }
});


module.exports = app;