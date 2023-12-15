const bcrypt = require('bcrypt');
const saltRounds = 10; // Adjust the number of salt rounds as needed

const plainPassword = 'admin'; // Replace with the actual password
bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
  } else {
    console.log('Hashed password:', hash);
  }
});
