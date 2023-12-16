const express = require('express');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const { updateUserProfile } = require('./userService');

const con = require('../database/db')
//const mysql = require('mysql2/promise');

// const saltRounds = 10


const app = express.Router();

// Set up storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/profile'); // Destination folder for avatars
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, 'avatar' + Date.now() + path.extname(file.originalname)); // Set a unique filename based on timestamp
    }
});

// Create multer instance with the storage configuration
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  // Check for success query parameter and pass it to the view
  res.render('profile', { user: req.session.user, success: req.query.success === 'true' });
});




app.post('/update-profile', upload.single('avatar'), async (req, res) => {
  if(!req.file) {
    res.redirect('/profile')
    return 
  }
  try {
    const userId = req.session.user.user_id;
    const userData = {
      fullname: req.body.fullname,
      email: req.body.email,
      username: req.body.username,
      phone: req.body.phone,
    };

    let avatarPath = req.session.user.profile; // Default to the current avatar

    if (req.file) {
      // If a file is uploaded, update the avatar
      avatarPath = `${req.file.filename}`;
    }

    await updateUserProfile(userId, avatarPath, userData, con);

    req.session.avatar = avatarPath;
    req.session.user.avatar = avatarPath;
    req.session.user.profile_picture = avatarPath;
    req.session.user.fullname = userData.fullname;
    req.session.user.email = userData.email;
    req.session.user.username = userData.username;
    req.session.user.phone = userData.phone;

    // Redirect to profile with success parameter
    res.redirect('/profile?success=true');
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).send('Internal Server Error');
  }
});
//module.exports = app;
// Render the profile page


// app.put('/update-password', async (req, res) => {
//   const userId = req.session.user.user_id;
//   const { currentPassword, newPassword } = req.body;

//   // Validate the current password
//   const isPasswordValid = await validateCurrentPassword(userId, currentPassword, con);

//   if (isPasswordValid) {
//       // Update the password
//       await updatePassword(userId, newPassword, con);
//       // Add a success message or redirect to indicate password update success
//       res.send('Password updated successfully');
//   } else {
//       // Add an error message or redirect to indicate incorrect current password
//       res.status(400).send('Current password is incorrect');
//   }
// });




app.get('/', (req, res) => {
  res.render('profile', { user: req.session.user, success: req.query.success === 'true' });
}); 
module.exports = app;
