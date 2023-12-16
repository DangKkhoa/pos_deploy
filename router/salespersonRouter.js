const express = require('express')
const salepersonData = require('../model/account/accountModel')
const con = require('../database/db')
const bcrypt = require('bcrypt')
const app = express.Router()
const jwt = require('jsonwebtoken')
const saltRounds = 10;
const nodemailer = require('nodemailer')
app.get('/', (req, res) => {

    const sql = 'SELECT * FROM Users'
    con.query(sql, (err, result) => {
        if(err) {
            console.log(err)
            res.status(500).json('Internal Server Error')
        }
        else if(result.length > 0) {
            // Filter user who is admin
            const salespersons = result.filter((user) => user.is_admin !== 1)
            res.render('salespersons', {salespersons: salespersons, number_salespersons: salespersons.length, user: req.session.user})
        }

    })
})

app.post('/add', (req, res) => {
// Endpoint for adding a salesperson
    const { fullname, email } = req.body;

    // Check if email is used ?
    con.query('SELECT * FROM Users WHERE email = ?', [email], (err, result) => {
        if(err) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
        else if(result.length > 0) {
            res.redirect('/salespersons')
        }
        return 
    })

    const sql = 'INSERT INTO Users (username, password, email, fullname, is_admin, is_locked) VALUES (?, ?, ?, ?, ?, ?)';
    const username = email.split('@')[0] // Username is the part before '@' 
    const password = username // Password is also the username
    bcrypt.hash(password, saltRounds, (err, hashed_password) => {
        if(err) {
            alert('Somethig went wrong')
        } else {
            con.query(sql, [username, hashed_password, email, fullname, 0, 0], (err, result) => {
                if (err) {
                  console.error('Error:', err);
                  res.status(500).json({ error: 'Internal Server Error' });
                  return 
                } else {
                    var transporter = nodemailer.createTransport({
                      service: 'gmail',
                      port: 465,
                      // host: 'send email',
                      secure: true,
                      logger: true,
                      auth: {
                        user: 'dangkkhoa10a8@gmail.com',
                        pass: 'yoeacnmsuniakxzw', // how to have this pass: Login GG account => manage => search for "app passwords"  => create and copy the pass to here and we good to go
                      },
                      tls: {
                        rejectUnauthorized: true
                      }
                    });

                    var homepageLink = 'http://pos-system.store:8080';
                    var mailOptions = {
                      from: 'dkkhoa10a8@gmail.com',
                      to: email,
                      subject: 'From admin',
                      text: `Your account has now been created`,
                      html: `<h1>Welcome! Your account has been created</h1>
                     <a href="${homepageLink}">${homepageLink}</a>`
                    };

                    transporter.sendMail(mailOptions, function(error, info){
                      if (error) {
                        res.redirect('/salespersons')
                        console.log(error);
                      } else {
                        console.log('Email sent: ' + info.response);
                      }
                      return 
                    });
                    res.redirect('/salespersons')
                    return 
                }
            });

        }

    }) 
    
})

app.post('/delete/:salesperson_id', (req, res) => {
    const {salesperson_id} = req.params
    const param = [salesperson_id]
    const deleteQuey = 'DELETE FROM Users WHERE user_id = ?'
    const updateQuery = 'UPDATE Sales SET user_id = NULL WHERE user_id = ?'
    // Delete foreign key constrain by setting user_id = null in Sales table


    con.query(updateQuery, param, (updateErr, updateResult) => {
        if(updateErr) {
            console.log('Cannot delete salesperson ' + updateErr)
        }
        else {
            con.query(deleteQuey, param, (deleteErr, deleteResult) => {
                if(deleteErr) {
                    console.log('Cannot delete salesperson' + deleteErr)
                }
                else {
                    res.json({code: 0, message: `Delete salesperson with id = ${salesperson_id} successfully`})
                }
    
            })
        }
    })
    return 

})

app.post('/send_link', (req, res) => {
    
})


module.exports = app