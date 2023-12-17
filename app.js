
const express = require('express');
const session = require('express-session')
const nocache = require('nocache')
const methodOverride = require('method-override');
const transactionRouter = require('./router/transactionRouter')
const loginRouter = require('./router/loginRouter')
const logoutRouter = require('./router/logoutRouter')
const loginMiddleware = require('./middlewares/loginMiddleware')
const salespersonRouter = require('./router/salespersonRouter')
const setPasswordRouter = require('./router/setPasswordRouter')
const profileRouter = require('./router/profileRouter')
const fistTimeLoginMiddleware = require('./middlewares/firstTimeLoginMiddleware')
const saleHistoryRouter = require('./router/saleHistoryRouter')
const generDataModel = require('./model/general/genralModel')
const viewProductRouter = require('./router/viewProductRouter');
const updateProductRouter = require('./router/updateProductRouter');
const clickLinkGmailMiddleware = require('./middlewares/clickLinkGmailMiddleware');
const firstloginRouter = require('./router/firstloginRouter')
require('dotenv').config()
const port = process.env.PORT || 8080
const app = express();
const con = require('./database/db')
app.set('view engine', 'ejs')

app.use(methodOverride('_method'));

app.use(session({
  secret: 'hello',
  resave: false,
  saveUninitialized: false
}))
app.use(nocache())
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static(__dirname + '/public'));

app.use('/first_login', firstloginRouter)
//user must login to use the system
app.use('/login', loginRouter)


app.use('/transaction', loginMiddleware, fistTimeLoginMiddleware, transactionRouter)
app.use('/salespersons', loginMiddleware, salespersonRouter)
app.use('/logout',  loginMiddleware, logoutRouter)
app.use('/set_password', loginMiddleware, setPasswordRouter)
app.use('/profile', loginMiddleware, fistTimeLoginMiddleware, profileRouter)
app.use('/sale_history', loginMiddleware, fistTimeLoginMiddleware, saleHistoryRouter)
app.use('/products', loginMiddleware, viewProductRouter);
app.use('/updateproducts', loginMiddleware, updateProductRouter)

app.get('/customers', loginMiddleware, (req, res) => {
  con.query('SELECT * FROM Customers', (err, result) => {
    if(err) {
      console.log(err)
    }
    else {
      res.render('customers', {customers: result, user: req.session.user})
    }
  })
})
app.get('/', (req, res) => {

  if(!req.session.user) {
    return res.redirect('/login')
  }
  const user = req.session.user
  if(user.is_admin) {
    generDataModel.getGeneralData()
    .then(data => {

      generDataModel.getTop5Products() 
      .then(products => {

        res.render('home', {user: user, general_data: data, top5_products: products})
        return 
      })
      .catch(err => console.log(err)) 
    })
    .catch(err => console.log(err))
    return 
  }

  generDataModel.getGeneralDataByUserId(user.user_id) 
  .then(data => {
    generDataModel.getTop5Products() 
    .then(products => {

      res.render('home', {user: user, general_data: data, top5_products: products})
      return 
    })
    .catch(err => console.log(err)) 
    return 
  })
  .catch(err => console.log(err))
})

app.get('/', (req, res) => {
  // Extract the registered information from query parameters, if available
  const { name, phone, address } = req.query;

  res.render('test.ejs', { name: name || '', phone: phone || '', address: address || '' });
});

// Define a route to handle AJAX request for retrieving data
app.post('/retrieve-data', (req, res) => {
  const phone = req.body.phone;

  // Execute a SQL query to retrieve name and address based on phone number
  const query = 'SELECT name, address FROM customers WHERE phone = ?';
  connection.query(query, [phone], (error, results) => {
    if (error) throw error;

    // Send the retrieved data as a response
    if (results.length > 0) {
      const { name, address } = results[0];
      res.json({ name, address });
    } else {
      res.json({ name: '', address: '' });
    }
  });
});

// Define a route to handle registration form submission
app.post('/register', (req, res) => {
    const { newName, newPhone, newAddress } = req.body;
  
    // Execute a SQL query to insert the new account information
    const query = 'INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)';
    connection.query(query, [newName, newPhone, newAddress], (error) => {
      if (error) throw error;
  
      // Redirect back to the main form with the registered information
      res.redirect(`/?name=${encodeURIComponent(newName)}&phone=${encodeURIComponent(newPhone)}&address=${encodeURIComponent(newAddress)}`);
    });
  });




app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});