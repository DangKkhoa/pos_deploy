
const userData = require('../model/account/accountModel')

//const saltRounds = 10

async function updateUserProfile(userId, avatarPath, userData, con) {
  try {
    const { fullname, email, username, phone } = userData;

    // Update user profile in the database
    con.promise().query(
      'UPDATE Users SET fullname = ?, email = ?, profile_picture = ?, username = ?, phone = ? WHERE user_id = ?',
      [fullname, email, avatarPath, username, phone, userId]
    );

    console.log('User profile updated successfully.');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}


module.exports = { updateUserProfile };

