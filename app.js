
const express = require('express');
const session = require('express-session')
const nocache = require('nocache')
const methodOverride = require('method-override');
const transactionRouter = require('./router/transactionRouter')
const loginRouter = require('./router/loginRouter')
const logoutRouter = require('./router/logoutRouter')
const loginMiddleware = require('./middlewares/loginMiddleware')
// const clickLinkGmailMiddleware = require('./middlewares/clickLinkGmailMiddleware')
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

// app.use(clickLinkGmailMiddleware)
//middleware to check if user logged in or not
// app.use(loginMiddleware)


app.use('/transaction', loginMiddleware, fistTimeLoginMiddleware, transactionRouter)
app.use('/salespersons', loginMiddleware, salespersonRouter)
app.use('/logout',  loginMiddleware, logoutRouter)
app.use('/set_password', loginMiddleware, setPasswordRouter)
app.use('/profile', loginMiddleware, fistTimeLoginMiddleware, profileRouter)
app.use('/sale_history', loginMiddleware, fistTimeLoginMiddleware, saleHistoryRouter)
app.use('/products', loginMiddleware, viewProductRouter);
app.use('/updateproducts', loginMiddleware, updateProductRouter)

app.get('/', (req, res) => {

  if(!req.session.user) {
    return res.redirect('/login')
  }
  const user = req.session.user
  console.log(user)
  if(user.is_admin) {
    generDataModel.getGeneralData()
    .then(data => {
      // console.log(data)
      generDataModel.getTop5Products() 
      .then(products => {
        console.log(products)
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
      console.log(products)
      console.log(data)
      res.render('home', {user: user, general_data: data, top5_products: products})
      return 
    })
    .catch(err => console.log(err)) 
    return 
  })
  .catch(err => console.log(err))
})








app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});