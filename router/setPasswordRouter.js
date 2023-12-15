const express = require('express')
const bcrypt = require('bcrypt')
const con = require('../database/db')
const saltRounds = 10

const app = express.Router()

app.get('/', (req, res) =>{
    let error_msg = ''
    res.render('setpassword', {error: error_msg})
})

app.post('/', async (req, res) => {
    const user_id = req.session.user.user_id
    const { currentPassword, newPassword } = req.body;
    let error_msg = ''

    con.query('SELECT * FROM Users where user_id = ?', [user_id], (err, result) => {
        if(err) {
            console.log('Error: ' + err)
        }
        else if(result.length > 0) {
            const hashedPassword = result[0].password;

            // Compare the provided password with the hashed password from the database
            const passwordMatch = bcrypt.compareSync(currentPassword, hashedPassword)
            if(passwordMatch) {
                // Check if new password contains at least 6 character
                if(newPassword.length < 6) {
                    error_msg = 'New password must contains at least 6 characters'
                    return res.render('setpassword', {error: error_msg})
                }
                // Check if saleperson use the old password
                if(newPassword === currentPassword) {
                    error_msg = 'Please use another password'
                    return res.render('setpassword', {error: error_msg})
                }

                bcrypt.hash(newPassword, saltRounds, (hashErr, hashed_password) => {
                    if(hashErr) {
                        res.status(500).json('Internal server error')
                    }
                    else {
                        con.query('UPDATE Users SET password = ?, first_login = ? WHERE user_id = ?', [hashed_password, 0, user_id], (updateErr, updateResult) => {
                            if(updateErr) {
                                console.log('Cannot change password now')
                                res.status(500).json({ error: 'Internal Server Error' });
                            }
                            else {
                                // If succeed, set first_login to false
                                req.session.user.first_login = 0
                                res.redirect('/')
                            }
                        })

                    }
                })
            }
            else {
                error_msg = 'Wrong password'
                res.render('setpassword', {error: error_msg})
            }

        }
    })
});

module.exports = app