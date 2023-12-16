const express = require('express')
const productData = require('../model/product/ProductModel')
const con = require('../database/db')
const app = express.Router()

app.delete('/:id', ({ params: { id } }, res) => {
    // Perform the necessary logic to delete the product from the database
    const deleteProductSql = 'DELETE FROM Products WHERE product_id = ?';
    con.query(deleteProductSql, [id], (deleteErr, deleteResult) => {
        if (deleteErr) {
            console.error(deleteErr);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Redirect or respond as needed
        res.redirect('/products');
    });
});

module.exports = app