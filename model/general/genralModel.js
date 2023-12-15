const con = require('../../database/db')

exports.getGeneralData = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT (SELECT COUNT(*) FROM Users WHERE Users.is_admin = 0) AS salesperson_quantity, (SELECT COUNT(*) FROM Sales) AS order_quantity, (SELECT SUM(total_price) FROM Sales) As total_revenue, (SELECT COUNT(*) FROM Customers) AS customer_quantity;'
        con.query(sql, (err, result) => {
            if(err) {
                console.log(err)
                reject(err)
                return
            }
            resolve(result)
        })
    })
}

exports.getTop5Products = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT Products.product_name, SUM(Sale_Details.quantity) As quantity FROM Sale_Details INNER JOIN Products ON Sale_Details.product_id = Products.product_id GROUP BY Products.product_name ORDER BY quantity DESC LIMIT 5'
        con.query(sql, (err, result) => {
            if(err) {
                console.log(err)
                reject(err)
                return
            }
            resolve(result)
        })
    })
}

exports.getGeneralDataByUserId = (user_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT (SELECT COUNT(*) FROM Sales WHERE Sales.user_id = ? and MONTH(Sales.sale_date) = MONTH(CURDATE())) AS order_quantity, (SELECT SUM(total_price) FROM Sales WHERE Sales.user_id = ? and MONTH(Sales.sale_date) = MONTH(CURDATE())) As total_revenue, (SELECT SUM(total_quantity) FROM Sales WHERE Sales.user_id = ? and MONTH(Sales.sale_date) = MONTH(CURDATE())) AS total_quantity_sold;'
        const param = [user_id, user_id, user_id]
        con.query(sql, param, (err, result) => {
            if(err) {
                console.log(err)
                reject(err)
                return
            }
            resolve(result)
        })
    })
}