const userData = require('../model/account/accountModel')

async function updateUserProfileAvatar(UsersId, avatarPath, con) {
  /*try {
    // Use the promise-based query function
    const [rows, fields] = await con.promise().query('UPDATE users SET avatar = ? WHERE user_id = ?', [avatarPath, UsersId]);
    // Handle the result if needed
    console.log(rows);
    console.log(fields);
  } catch (error) {
    // Handle any errors that occur during the update
    console.error(error);
    throw error; // You can choose to handle or propagate the error
  }*/

  try {
    // Check if the user exists
    const [userRows, userFields] = await con.promise().query('SELECT * FROM Users WHERE user_id = ?', [UsersId]);

    console.log('User Rows:', userRows);

    if (userRows.length === 0) {
      // Handle the case where the user is not found
      console.error('User not found for user_id:', UsersId);
      return;
    }

    // Use the promise-based query function to update the avatar
    const [updateRows, updateFields] = await con.promise().query('UPDATE Users SET profile_picture = ? WHERE user_id = ?', [avatarPath, UsersId]);

    if (updateRows.affectedRows === 0) {
      // Handle the case where no rows were updated (avatar not updated)
      console.error('Avatar not updated for user_id:', UsersId);
      return;
    }

    // Handle the result if needed
    console.log('Avatar updated successfully for user_id:', UsersId);

  } catch (error) {
    // Handle any errors that occur during the update
    console.error('Error updating avatar:', error);

    // Throw the error to propagate it, or handle it as needed
    throw error;
  }
}

module.exports = { updateUserProfileAvatar };