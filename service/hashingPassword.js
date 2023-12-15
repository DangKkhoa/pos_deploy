
const bcrypt = require('bcrypt');
const saltRounds = 10; // Adjust the number of salt rounds as needed

const plainPassword = 'admin'; // Replace with the actual password
exports.hash = async function (password) {
    return await bcrypt.hash(password, saltRounds)
}

