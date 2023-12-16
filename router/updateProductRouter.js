const express = require('express');
const multer = require('multer');
const path = require('path');
const con = require('../database/db');
const { updateProduct } = require('./productService');

const app = express.Router();

app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images'); // Destination folder for product
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = 'image' + Date.now() + ext;
        cb(null, filename);  // Set a unique filename based on timestamp
    }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  const product_id  = req.query.product_id
  const success = req.query.success
  con.query('SELECT * FROM Products WHERE product_id = ?', [product_id] ,(err, result) => {
    if(err) {
      return res.redirect('/product');
    }
    else if (result.length > 0) {
      req.session.product = result[0];
      res.render('updateproducts', { user: req.session.user, product: result[0] });
      console.log(result[0])
    } else {
      res.redirect('/products');
    }
  } )
});

app.post('/update-product', upload.single('image'), async (req, res) => {
    try {
        //if (req.file) {
            const productId = req.session.product.product_id;
            const productData = {
                editProductname: req.body.editProductname,
                editImportprice: req.body.editImportprice,
                editRetailprice: req.body.editRetailprice,
                editManufacturer: req.body.editManufacturer,
                editCategory: req.body.editCategory,
            };

            let productImagePath = req.session.product.image;
            if (req.file) {
              // If a file is uploaded, update the avatar
              productImagePath = req.file.filename
            }
            //const productImagePath = `/images/${req.file.filename}`;
            //const productImagePath = path.join('/images', req.file.filename);
            //const productImagePath = req.file.filename;
            // Assuming you have a function to update the product in the database
            await updateProduct(productId, productImagePath, productData, con);

            req.session.product.image = productImagePath;
            req.session.product.product_name = productData.editProductname;
            req.session.product.import_price = productData.editImportprice;
            req.session.product.retail_price = productData.editRetailprice;
            req.session.product.manufacturer = productData.editManufacturer;
            req.session.product.category = productData.editCategory;

            res.redirect('/products?success=true'); // Redirect to the products page or wherever you want
      //}
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Internal Server Error');
    }
});
module.exports = app;
