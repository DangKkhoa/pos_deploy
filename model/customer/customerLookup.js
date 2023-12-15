// In customerLookup.js
const con = require('../database/db');

function lookupCustomerByPhone(phoneNumber) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT name, address FROM customers WHERE phone_number = ?';
    con.query(query, [phoneNumber], (error, results) => {
      if (error) {
        reject(error);
      } else {
        if (results.length > 0) {
          const customerInfo = {
            name: results[0].name,
            address: results[0].address,
          };
          resolve(customerInfo);
        } else {
          // No matching customer found
          resolve({ name: '', address: '' });
        }
      }
    });
  });
}

module.exports = {
  lookupCustomerByPhone,
};