var nodemailer = require('nodemailer');

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

var homepageLink = 'http://localhost:8080/login';
var mailOptions = {
  from: 'dkkhoa10a8@gmail.com',
  to: 'huongyen3113@gmail.com',
  subject: 'From admin',
  text: `Your account has now been created`,
  html: `<h1>Welcome! Your account has been created</h1>
 <a href="${homepageLink}">${homepageLink}</a>`
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});