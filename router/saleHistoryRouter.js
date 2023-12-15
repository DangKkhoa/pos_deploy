const express = require('express')
const saleModel = require('../model/sale/saleModel')
const app = express.Router()

// get user id 

app.get('/', (req, res) => {
    const user_id = req.session.user.user_id

    const {start_date, end_date} = req.query
    const page = parseInt(req.query.page) || 1
    const record_per_page = 12
    const offset = (page - 1) * record_per_page
    console.log(page, offset)

    // If user is admin => can see all sales histrty
    if(req.session.user.is_admin) {
        
        saleModel.getAllSaleData(record_per_page, offset)
        .then((sales) => {
            const total_pages = Math.ceil(sales.total_orders / record_per_page)
            res.render('salehistory', {sales: sales.result, total_revenue: sales.sale_total.total_revenue, total_quantity_sold: sales.sale_total.total_quantity_sold, user: req.session.user, total_order: sales.total_count, total_pages: total_pages, current_page: page, filter: false, total_orders: sales.total_orders})
        })
        .catch(err => res.send(err))
        return 
    }

    // If user is not admin => only see that user's sale history
    // If search sale history by date
    
    saleModel.getSaleByUserId(user_id, record_per_page, offset) 
    .then((sales) => {
        const total_pages = Math.ceil(sales.total_orders / record_per_page)
        console.log(sales)
        res.render('salehistory', {sales: sales.result, total_revenue: sales.sale_total.total_revenue, total_quantity_sold: sales.sale_total.total_quantity_sold, user: req.session.user, total_order: sales.total_count, total_pages: total_pages, current_page: page, filter: false, total_orders: sales.total_orders})
    })
    .catch(err => console.log(err))

    
})

app.get('/filter', (req, res) => {
    const user_id = req.session.user.user_id
    const {start_date, end_date, time, sort} = req.query
    console.log(start_date, end_date, time, sort)
    const page = parseInt(req.query.page) || 1
    const record_per_page = 12
    const offset = (page - 1) * record_per_page

    if(!start_date && ! end_date && !time) {
        return res.redirect('/sale_history')
    }

    if(time === 'Today') {
        saleModel.getSalesToday(user_id, record_per_page, offset)
        .then(sales => {
            const total_pages = Math.ceil(sales.total_orders / record_per_page)
            res.render('salehistory', {sales: sales.result, total_revenue: sales.sale_total.total_revenue, total_quantity_sold: sales.sale_total.total_quantity_sold, user: req.session.user, filter: true, total_orders: sales.total_orders})

        })
        .catch(err => console.log(err))
        return 
    }
    else if(time === 'This_month') {
        saleModel.getSalesThisMonth(user_id, record_per_page, offset)
        .then(sales => {
            const total_pages = Math.ceil(sales.total_orders / record_per_page)
            console.log(sales)
            res.render('salehistory', {sales: sales.result, total_revenue: sales.sale_total.total_revenue, total_quantity_sold: sales.sale_total.total_quantity_sold, user: req.session.user, filter: true, total_orders: sales.total_orders})

        })
        .catch(err => console.log(err))
        return 
    }
    else if(time === 'Yesterday') {
        saleModel.getSalesYesterday(user_id)
        .then(sales => {
            res.render('salehistory', {sales: sales.result, total_revenue: sales.sale_total.total_revenue, total_quantity_sold: sales.sale_total.total_quantity_sold, user: req.session.user, filter: true, total_orders: sales.total_orders})

        })
        .catch(err => console.log(err))
        return 
    }
    else if(time === 'Last_seven_days') {
        saleModel.getSalesLastSevendays(user_id)
        .then(sales => {
            const total_pages = Math.ceil(sales.total_orders / record_per_page)
            res.render('salehistory', {sales: sales.result, total_revenue: sales.sale_total.total_revenue, total_quantity_sold: sales.sale_total.total_quantity_sold, user: req.session.user, filter: true, total_orders: sales.total_orders})
        })
        .catch(err => console.log(err))
        return 
    }


    if(req.session.user.is_admin) {

        saleModel.getSalesByDate(start_date, end_date)
        .then((sales) => {
            const total_pages = Math.ceil(sales.total_orders / record_per_page)
            console.log(sales.result)
            console.log(sales.total_orders)
            res.render('salehistory', {sales: sales.result, total_revenue: sales.sale_total.total_revenue, total_quantity_sold: sales.sale_total.total_quantity_sold, user: req.session.user, filter: true, total_orders: sales.total_orders})
        })
        .catch(err => console.log(err))
        return 
    }

    
    
    saleModel.getSalesByDateAndUserId(start_date, end_date, user_id)
    .then((sales) => {
        res.render('salehistory', {sales: sales.result, total_revenue: sales.sale_total.total_revenue, total_quantity_sold: sales.sale_total.total_quantity_sold, user: req.session.user, filter: true, total_orders: sales.total_orders})
    })
    .catch(err => console.log(err))
})

app.get('/detail', (req, res) => {
    const {sale_id} = req.query
    saleModel.getSaleDetail(sale_id)
    .then(sale_details => {
        if(sale_details.length > 0) {
            console.log(sale_details)
            saleModel.getSaleById(sale_id)
            .then(sale => {
                console.log(sale)
                res.render('saledetail', {sale_details: sale_details, sale: sale, user: req.session.user})
            })
        }

    })
    .catch(error => res.send(error))
})

app.get('/data', (req, res) => {
    if(req.session.user.is_admin) {
        saleModel.getSalesProfitEveryMonth()
        .then(sales => {
            console.log(sales)
            res.send({sales: sales, role: req.session.user.is_admin})
            return 
        })
        .catch(err => console.log(err))
        return 
    }

    const user_id = req.session.user.user_id
    saleModel.getSalesEveryMonthByUserId(user_id)
    .then(sales => {
        res.send({sales: sales, role: req.session.user.is_admin})
        return
    })
    .catch(err => console.log(err))
})



module.exports = app