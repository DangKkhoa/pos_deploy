const express = require('express');
const productData = require('../model/product/ProductModel');
const multer = require('multer');
const con = require('../database/db');
const path = require('path');
const app = express.Router();

//const storage = multer.memoryStorage();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images'); // Destination folder for avatars
    },
    filename: function (req, file, cb) {
        cb(null, 'image' + Date.now() + path.extname(file.originalname)); // Set a unique filename based on timestamp
    }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    const sql = 'SELECT * FROM Products';
    const success = req.query.success
    con.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).json('Internal Server Error');
        } else if (result.length > 0) {
            res.render('products', { products: result, user: req.session.user, success: success});
        }
    });
});



app.post('/', upload.single('image'), (req, res) => {
    // Extract data from the request body
    const { productname, importprice, retailprice, manufacturer, category } = req.body;
    // const image = req.file.buffer;
    const imageFileName = req.file.filename;
    // Get the actual count of products in the database
    const getProductCountSql = 'SELECT COUNT(*) as productCount FROM Products';
    con.query(getProductCountSql, (countErr, countResult) => {
        if (countErr) {
            console.error(countErr);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const productCount = countResult[0].productCount;

        // Use the product count as the product ID
        const productID = productCount + 1;

        // Perform the necessary logic to add the product to the database
        const insertProductSql =
            'INSERT INTO Products (product_id, product_name, import_price, retail_price, manufacturer, category, image) VALUES (?, ?, ?, ?, ?, ?, ?)';
        con.query(
            insertProductSql,
            [productID, productname, importprice, retailprice, manufacturer, category, imageFileName],
            (insertErr, result) => {
                if (insertErr) {
                    console.error(insertErr);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                
                // Redirect or respond as needed
                res.redirect('/products?success=true');
            }
        );
    });
});

app.delete('/:id', ({ params: { id } }, res) => {
    const deleteProductSql = 'DELETE FROM Products WHERE product_id = ?';
    con.query(deleteProductSql, [id], (deleteErr, deleteResult) => {
        if (deleteErr) {
            console.error(deleteErr);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // After deleting the product, update the product IDs for the remaining products
        const setCountSql = 'SET @count = 0;';
        const updateProductIdsSql = 'UPDATE Products SET product_id = @count:= @count + 1;';
        
        // Execute the statements one by one
        con.query(setCountSql, (setCountErr, setCountResult) => {
            if (setCountErr) {
                console.error(setCountErr);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            con.query(updateProductIdsSql, (updateErr, updateResult) => {
                if (updateErr) {
                    console.error(updateErr);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                // Redirect or respond as needed
                res.redirect('/products');
            });
        });
    });
});

module.exports = app;
