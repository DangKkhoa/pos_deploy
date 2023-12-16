const express = require('express')
const con = require('../database/db')
const productData = require('../model/product/ProductModel')
const pdf = require('pdfkit')
const fs = require('fs')
const app = express.Router()

let categories = new Set()
let transaction_complete = false

let id_using = []


let sale_id;

app.get('/', (req, res) => {

    // If transaction complete, or there is no id, generate new sale id
    if(id_using.length === 0) {
        function generateID() {
            const now = new Date()
            const random_number = Math.floor(Math.random()).toString()
            const hour = now.getHours().toString().padStart(2, '0')
            const minute = now.getMinutes().toString().padStart(2, random_number)
            const second = now.getSeconds().toString().padStart(2, '0')
            const random_part = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
            const unique_id = `${random_part}${minute}${hour}${second}`.substring(0, 12)
            return unique_id
        }
        sale_id = generateID()
        id_using.push(sale_id)
    }
    else {
        sale_id = id_using[0]
    }
    
    
    const {product_name} = req.query
    console.log(product_name)
    if(!product_name) {
        productData.executeQuery()
        .then((products) => {
            products.forEach(p => {
                categories.add(p.category)
            })
            
            res.render('transaction', {products, categories, user: req.session.user, sale_id: sale_id})
        })
        .catch((err) => {
            res.send(err)
        })
    }
    else {
        productData.getProductByName(product_name)
        .then((products) => {
            res.render('transaction', {products, categories, user: req.session.user, sale_id: sale_id})
        })
        .catch((err) => {
            res.send(err)
        })
    }
        

})

app.get('/products/:category', (req, res) => {
    
    const {category} = req.params

    if(category === 'apple') {
        productData.getProductByManufacturer(category) 
        .then((products) => {
            return res.render('transaction', {products, categories, user: req.session.user, sale_id: sale_id})
        })
        .catch((err) => {
            return res.send('Something went wrong =((')
        })
    }
    else {
        productData.getProductCategory(category)
        .then((products) => {
            res.render('transaction', {products, categories, user: req.session.user, sale_id: sale_id})
        })
    }
    
})

app.get('/processing', (req, res) => {
    const {complete} = req.query
    return res.render('transactionStatus', {transaction_complete: complete})
})


app.post('/processing', (req, res) => {

    // If, transaction complete, not matter succeed or fail, delete the old id
    id_using = []

    const {products, total_cost, total_quantity, date, time, amount_given_by_customer, change_to_customer} = req.body
    console.log(products)
    if(products.length === 0) {
        return res.redirect('/transaction')
    }
    // console.log(products)
    const insert_sale_statement = 'INSERT INTO Sales (sale_id, total_quantity, total_price, amount_given_by_customer, change_to_customer, user_id, sale_date, sale_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    const params_sale = [sale_id, total_quantity, total_cost, amount_given_by_customer, change_to_customer, req.session.user.user_id, date, time]
    
    const insert_saledetail_statement = 'INSERT INTO Sale_Details (quantity, unit_price, sale_id, product_id) VALUES (?, ?, ?, ?)'

    const bill = {
        customer: 'John Doe',
        products: products,
        total_price: total_cost,
        total_quantity: total_quantity,
        date: date,
        time: time,
        amount_given_by_customer: amount_given_by_customer,
        change_to_customer: change_to_customer
    }
    

    con.query(insert_sale_statement, params_sale, (insertError, insertResult) => {
        if(insertError) {
            res.redirect('/transaction/processing?complete=false')
            return
        }

        // console.log(insertResult)
        const insert_saledetail_promise = products.map(p => {
            const params_saledetail = [p[1].quantity, p[1].price, sale_id, p[1].id]
            
            return new Promise((resolve, reject) => {
                con.query(insert_saledetail_statement, params_saledetail, (insertSaledetailError, insertSaledetailResult) => {
                    if(insertSaledetailError) {
                        reject(insertSaledetailError)
                        return
                    }
                    else {
                        console.log('Added successfully')
                        resolve()
                    }
                })
            })
        })


        Promise.all([Promise.all(insert_saledetail_promise)])
        .then(() => {
            const doc = new pdf()
            const stream = fs.createWriteStream(`invoices/${sale_id}.pdf`)
            doc.pipe(stream)

            const center_position = (doc.page.width - doc.widthOfString('Quantity')) / 2
            

            doc
            .fontSize(20)
            .text('Invoice', {align: 'center'})
            .fontSize(16)
            .text(`#${sale_id}`, {align: 'center'})
            .moveDown(0.5)

            doc
            .moveTo(center_position - 250 + doc.widthOfString('Price'), doc.y)
            .lineTo(center_position + 250, doc.y)
            .stroke()
            .moveDown(1)

            doc
            .fontSize(14)
            .text(`Customer: ${bill.customer}`, center_position - 250)
            .text(`Date - time: ${bill.date} - ${bill.time}`, center_position - 250)
            .text(`Salesperson: ${req.session.user.fullname}`, center_position - 250)

            
            let header_y_position = doc.y + 40
            doc
            .fontSize(12)
            .text('Product name', center_position - 250, header_y_position)
            .text('Quantity', center_position, header_y_position)
            .text('Price', center_position + 250, header_y_position, {width: 100})

            let content_y_position = header_y_position + 20
            bill.products.forEach(p => {
                doc.text(p[1].name, center_position - 250, content_y_position)
                    .text(p[1].quantity, center_position, content_y_position)
                    .text(p[1].price, center_position + 250, content_y_position, {width: 100})
                content_y_position += 20
            })

            doc
            .fontSize(14)
            .text(`Total price: ${bill.total_price}`, center_position - 250, doc.y + 40)
            .text(`Customer gave: ${bill.amount_given_by_customer}`, center_position - 250, doc.y)
            .text(`Change: ${bill.change_to_customer}`, center_position - 250, doc.y)


            doc.end()
            stream.on('finish', () => {
                console.log(`Invoice with id ${sale_id} printed successfully`)
            })

            
            res.redirect('/transaction/processing?complete=true')
        })
        .catch(err => {
            console.log(err)
            res.redirect('/transaction/processing?complete=false')
        })
    })
    
    

    
})








module.exports = app
