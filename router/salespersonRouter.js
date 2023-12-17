const express = require('express')
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

    const sql = 'INSERT INTO Users (username, password, email, fullname, is_admin, is_locked, token) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const username = email.split('@')[0] // Username is the part before '@' 
    const password = username // Password is also the username
    
    // Token to create 1 minute email
    const token = jwt.sign({username: username}, 'mat-khau-bi-mat', {expiresIn: 60})
    bcrypt.hash(password, saltRounds, (err, hashed_password) => {
        if(err) {
            alert('Somethig went wrong')
        } else {
            con.query(sql, [username, hashed_password, email, fullname, 0, 0, token], (err, result) => {
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

                    var homepageLink = `http://localhost:8080/first_login?token=${token}`;
                    var mailOptions = {
                      from: 'dangkkhoa10a8@gmail.com',
                      to: email,
                      subject: 'From admin',
                      text: `Your account has now been created`,
                      html: `<h1 style="color: black">Welcome! Your account has been created</h1>
                      <p style="color: black"><strong>Username: </strong>${username}</p>
                      <p style="color: black"><strong>Password: </strong>${username}</p>
                      <h3><span style="color: red">Note: </span> The link is only valid in 1 minute. After this time, please contact admin to resend another link !</h3>  
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

app.post('/send-link/:salesperson_id',(req, res) => {
    const salesperson_id = req.params.salesperson_id
    const sql = 'SELECT * FROM Users WHERE user_id = ?'
    const param = [salesperson_id]

    con.query(sql, param, async (err, result) => {
        if(err) {
            res.json({code: 1, message: "Unable to get user from database"})
        }
        else {
            const promise_con = con.promise()
            const token = jwt.sign({username: result[0].username}, 'mat-khau-bi-mat', {expiresIn: 60})
            try {
                // Update new token after clicking send email button
                await promise_con.query('UPDATE Users SET token = ? WHERE user_id = ?', [token, salesperson_id])

                // Send email
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

                var homepageLink = `http://localhost:8080/first_login?token=${token}`;

                var mailOptions = {
                    from: 'dkkhoa10a8@gmail.com',
                    to: result[0].email,
                    subject: 'From admin',
                    text: `Your account has now been created`,
                    html: `<p><strong>Username: </strong>${result[0].username}</p>
                    <p><strong>Password: </strong>${result[0].username}</p>
                    <h3><span style="color: red">Note: </span> The link is valid in 1 minute. After this time, please contact admin to resend another link!</h3>  
                    <a href="${homepageLink}">${homepageLink}</a>`
                };

                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        res.json({code: 2, message: `Unable to send link to ${result[0].email}`})
                        console.log(error);
                        return 
                    } else {
                        res.json({code: 0, message: `Link was sent to ${result[0].email}`})
                        console.log('Email sent: ' + info.response);
                    }
                    return 
                });
            }
            catch(err) {
                console.log(err)
            }
            
        }
    })

    return 
})


module.exports = app