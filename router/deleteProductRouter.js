const express = require('express')
const productData = require('../model/product/ProductModel')
const con = require('../database/db')
const app = express.Router()

app.delete('/:id', async ({ params: { id } }, res) => {
    // Perform the necessary logic to delete the product from the database
    console.log('You are here')
    const promise_con = con.promise()
    const [result] = await promise_con.query('SELECT * FROM Sale_Details WHERE product_id = ?', [id])
    console.log(result.length)
    if(result.length < 1) {
        const deleteProductSql = `DELETE FROM Products
                                WHERE product_id = ? AND NOT EXISTS (SELECT * FROM Sale_Details WHERE product_id = ?)`;

        con.query(deleteProductSql, [id, id, id], (deleteErr, deleteResult) => {
            if (deleteErr) {
                console.error(deleteErr);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Redirect or respond as needed
            res.redirect('/products');
        });
        return
    }
    res.json({code: 1, message: 'Cannot delete product'})

});

module.exports = app