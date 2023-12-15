const con = require('../../database/db')
const cache_timeout = 60 * 1 * 1000 // 3m

// Using cache to store sale data
// So that don't need to read from db if cache has data
let count_in_cache_admin = {count: null, last_update: null} 
let count_in_cache_salesperson = {count: null, last_update: null} 

const promise_con = con.promise()


let cache_storage = {
    all_orders: null,
    orders_month: null, 
    orders_seven_days: null, 
    orders_yesterday: null,
    orders_from_start: null,
    orders_to_end: null,
    orders_start_end: null,
    orders_today: null,
    last_update: null
}

function calTotal(result) {
    let total_revenue = 0
    let total_quantity_sold = 0
    
    result.forEach(sale => {
        total_revenue += sale.total_price
        total_quantity_sold += sale.total_quantity
    })
    return {total_revenue, total_quantity_sold}
}

// Get all sale data for admin
exports.getAllSaleData = (record_per_page, offset) => {
    return new Promise(async (resolve, reject) => {

        // Using paging technique  
        const sql = 'SELECT Sales.*, Users.fullname FROM Sales INNER JOIN Users ON Sales.user_id = Users.user_id LIMIT ? OFFSET ?'
        const param = [record_per_page, offset]
        const promise_con = con.promise()
        if(!cache_storage.all_orders || (Date.now() - cache_storage.last_update) > cache_timeout) {
            try {
                const [count_result] = await promise_con.query('SELECT COUNT(*) AS count FROM Sales')
                cache_storage.all_orders = count_result[0].count
                cache_storage.last_update = Date.now()
            } 
            catch(err) {
                console.log(err)
                reject(err)
                return; 
            }

        }

        con.query(sql, param, (err, result) => {
            if(err) {
                console.log(err)
                reject(err)
            }
            else {
                const sale_total = calTotal(result)
                resolve({result, sale_total, total_orders: cache_storage.all_orders})
            }
        })
    })
}

// Get sale data of Salesperson
exports.getSaleByUserId = (user_id, record_per_page, offset) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'SELECT Sales.*, Users.fullname FROM Sales INNER JOIN Users ON Sales.user_id = Users.user_id WHERE Sales.user_id = ? LIMIT ? OFFSET ?'
        const param = [user_id, record_per_page, offset]
        try {
            const [count_result] = await promise_con.query('SELECT COUNT(*) as count FROM Sales WHERE Sales.user_id = ?', [user_id])
            con.query(sql, param, (err, result) => {
                if(err) {
                    console.log(err)
                    reject(err)
                }
                else {
                    const sale_total = calTotal(result)
                    resolve({result, sale_total, total_orders: count_result[0].count})
                }
            })
        } 
        catch(err) {
            console.log(err)
            reject(err)
            return 
        }
    })
}

exports.getSaleDetail = (sale_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT Sales.*, Sale_Details.*, Products.product_name FROM Sale_Details INNER JOIN Products ON Sale_Details.product_id = Products.product_id INNER JOIN Sales ON Sale_Details.sale_id = Sales.sale_id WHERE Sale_Details.sale_id = ?'
        const param = [sale_id]
        con.query(sql, param, (err, results) => {
            if(err) {
                console.log(err)
                reject(err)
            }
            else {
                resolve(results)
            }
        })
    })
}

exports.getSaleById = (sale_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT Sales.*, Users.fullname FROM Sales INNER JOIN Users ON Sales.user_id = Users.user_id WHERE sale_id = ?'
        const param = [sale_id]
        
        con.query(sql, param, (err, results) => {
            if(err) {
                console.log(err)
                reject(err)
            }
            else {
                resolve(results)
            }
        })
    })
}

exports.getSalesByDate = (start_date, end_date) => {
    return new Promise(async (resolve, reject) => {
        let sql;
        let params;
        const promise_con = con.promise()
        if(start_date && !end_date) {
            sql = 'SELECT Sales.*, Users.fullname FROM Sales INNER JOIN Users ON Sales.user_id = Users.user_id WHERE sale_date BETWEEN ? AND curdate() ORDER BY sale_date'
            params = [start_date]
            if(!cache_storage.orders_from_start || Date.now() - cache_storage.last_update > cache_timeout) {
                try {
                    const [result] = await promise_con.query('SELECT COUNT(*) AS count FROM Sales WHERE sale_date BETWEEN ? AND CURDATE()', [start_date])
                    cache_storage.orders_from_start = result[0].count
                    cache_storage.last_update = Date.now()
                } 
                catch(err) {
                    console.log(err)
                    reject(err)
                    return 
                }
           } 
            con.query(sql, params, (err, result) => {
                if(err) {
                    console.log(err)
                    reject(err)
                    return
                }
                const sale_total = calTotal(result)
                resolve({result, sale_total, total_orders: cache_storage.orders_from_start})
            })
            return 
        }
        else if(end_date & !start_date) {
            sql = 'SELECT Sales.*, Users.fullname FROM Sales INNER JOIN Users ON Sales.user_id = Users.user_id WHERE sale_date BETWEEN ? AND ? ORDER BY sale_date'
            params = ['2023-01-01', end_date]
            if(!cache_storage.orders_from_start || Date.now() - cache_storage.last_update > cache_timeout) {
                try {
                    const [result] = await promise_con.query('SELECT COUNT(*) AS count FROM Sales WHERE sale_date BETWEEN ? AND ?', ['2023-01-01', end_date])
                    cache_storage.orders_to_end = result[0].count
                    cache_storage.last_update = Date.now()
                } 
                catch(err) {
                    console.log(err)
                    reject(err)
                    return 
                }
           } 
            con.query(sql, params, (err, result) => {
                if(err) {
                    console.log(err)
                    reject(err)
                    return
                }
                const sale_total = calTotal(result)
                resolve({result, sale_total, total_orders: cache_storage.orders_to_end})
            })
            return 
        }
        else {
            sql = 'SELECT Sales.*, Users.fullname FROM Sales INNER JOIN Users ON Sales.user_id = Users.user_id WHERE sale_date BETWEEN ? AND ? ORDER BY sale_date'
            params = [start_date, end_date]
            if(!cache_storage.orders_start_end || Date.now() - cache_storage.last_update > cache_timeout) {
                try {
                    const [result] = await promise_con.query('SELECT COUNT(*) AS count FROM Sales WHERE sale_date BETWEEN ? AND ?', [start_date, end_date])
                    cache_storage.orders_start_end = result[0].count
                    cache_storage.last_update = Date.now()
                } 
                catch(err) {
                    console.log(err)
                    reject(err)
                    return 
                }
            }
            con.query(sql, params, (err, result) => {
                if(err) {
                    console.log(err)
                    reject(err)
                    return
                }
                const sale_total = calTotal(result)
                resolve({result, sale_total, total_orders: cache_storage.orders_start_end})
            })
        }

    })
}

exports.getSalesByDateAndUserId = (start_date, end_date, user_id) => {
    return new Promise(async (resolve, reject) => {
        let sql;
        let params;
        
        if(start_date && !end_date) {
            sql = 'SELECT Sales.*, Users.fullname FROM Sales INNER JOIN Users ON Sales.user_id = Users.user_id WHERE sale_date BETWEEN ? AND curdate() AND Sales.user_id = ? ORDER BY sale_date'
            params = [start_date, user_id]
            const [count_result] = await promise_con.query('SELECT COUNT(*) AS count FROM Sales WHERE sale_date BETWEEN ? AND curdate() AND Sales.user_id = ?', [start_date, user_id])
            con.query(sql, params, (err, result) => {
                if(err) {
                    console.log(err)
                    reject(err)
                    return
                }
                const sale_total = calTotal(result)
                resolve({result, sale_total, total_orders: count_result[0].count})
            })
        }
        else if(!start_date && end_date) {
            sql = 'SELECT Sales.*, Users.fullname FROM Sales INNER JOIN Users ON Sales.user_id = Users.user_id WHERE sale_date BETWEEN ? AND ? AND Sales.user_id = ? ORDER BY sale_date'
            param = ['2023-01-01', end_date, user_id]
            const [count_result] = await promise_con.query('SELECT COUNT(*) AS count FROM Sales WHERE sale_date BETWEEN ? AND ? AND Sales.user_id = ?', ['2023-01-01', end_date, user_id])
            con.query(sql, params, (err, result) => {
                if(err) {
                    console.log(err)
                    reject(err)
                    return
                }
                const sale_total = calTotal(result)
                resolve({result, sale_total, total_orders: count_result[0].count})
            })
        }
        else {
            sql = 'SELECT Sales.*, Users.fullname FROM Sales INNER JOIN Users ON Sales.user_id = Users.user_id WHERE sale_date BETWEEN ? AND ? AND Sales.user_id = ? ORDER BY sale_date'
            params = [start_date, end_date, user_id]
            const [count_result] = await promise_con.query('SELECT COUNT(*) AS count FROM Sales WHERE sale_date BETWEEN ? AND ? AND Sales.user_id = ?', [start_date, end_date, user_id])
            con.query(sql, params, (err, result) => {
                if(err) {
                    console.log(err)
                    reject(err)
                    return
                }
                const sale_total = calTotal(result)
                resolve({result, sale_total, total_orders: count_result[0].count})
            })
        }
    })
}

exports.getSalesToday = (user_id) => {
    return new Promise(async (resolve, reject) => {
        let sql = '';
        let param = []

        
        if(user_id == 1) {
            sql = 'SELECT Sales.*, Users.fullname FROM Sales INNER JOIN Users ON Sales.user_id = Users.user_id WHERE Sales.sale_date = CURDATE() ORDER BY Sales.sale_date'
            if(!cache_storage.orders_today || Date.now() - cache_storage.last_update > cache_timeout) {
                try {
                    const [count_result] = await promise_con.query('SELECT COUNT(*) AS count FROM Sales WHERE sale_date = CURDATE()')
                    cache_storage.orders_today = count_result[0].count
                    cache_storage.last_update = Date.now()
                } 
                catch(err) {
                    console.log(err)
                    reject(err)
                    return 
                }
            }
            con.query(sql, (err, result) => {
                if(err) {
                    console.log(err)
                    reject(err)
                    return 
                }
                const sale_total = calTotal(result)
                resolve({result, sale_total, total_orders: cache_storage.orders_today})
            })
        }
        else {
            sql = 'SELECT Sales.*, Users.fullname FROM Sales INNER JOIN Users ON Sales.user_id = Users.user_id WHERE Sales.sale_date = CURDATE() AND Sales.user_id = ? ORDER BY Sales.sale_date'
            param = [user_id]
            try {
                const [count_result] = await promise_con.query('SELECT COUNT(*) AS count FROM Sales WHERE sale_date = CURDATE() AND user_id = ?', [user_id])
                con.query(sql, param, (err, result) => {
                    if(err) {
                        console.log(err)
                        reject(err)
                        return
                    }
                    const sale_total = calTotal(result)
                    resolve({result, sale_total, total_orders: count_result[0].count})

                })
            }
            catch(err) {
                console.log(err)
                reject(err)
                return
            }
        }

    })
}

exports.getSalesYesterday = (user_id) => {
    return new Promise(async (resolve, reject) => {
        let sql = ''
        let param = []

        if(user_id == 1) {
            sql = 'SELECT Sales.*, Users.fullname FROM Sales INNER JOIN Users ON Sales.user_id = Users.user_id WHERE sale_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY) ORDER BY Sales.sale_date'
            if(!cache_storage.orders_yesterday || Date.now() - cache_storage.last_update > cache_timeout) {
                try {
                    const [count_result] = await promise_con.query('SELECT COUNT(*) AS count FROM Sales WHERE sale_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)')
                    cache_storage.orders_yesterday = count_result[0].count
                    cache_storage.last_update = Date.now()
                } 
                catch(err) {
                    console.log(err)
                    reject(err)
                    return 
                }
            }
            con.query(sql, (err, result) => {
                if(err) {
                    console.log(err)
                    reject(err)
                    return 
                }
                const sale_total = calTotal(result)
                resolve({result, sale_total, total_orders: cache_storage.orders_yesterday})
            })
        }
        else {
            sql = 'SELECT Sales.*, Users.fullname FROM Sales INNER JOIN Users ON Sales.user_id = Users.user_id WHERE sale_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND Sales.user_id = ? ORDER BY Sales.sale_date'
            param = [user_id]
            try {
                const [count_result] = await promise_con.query('SELECT COUNT(*) AS count FROM Sales WHERE sale_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND user_id = ?', [user_id])
                con.query(sql, param, (err, result) => {
                    if(err) {
                        console.log(err)
                        reject(err)
                        return
                    }
                    const sale_total = calTotal(result)
                    resolve({result, sale_total, total_orders: count_result[0].count})

                })
            } 
            catch(err) {
                console.log(err)
                reject(err)
                return 
            }
        }
    })
}

exports.getSalesLastSevendays = (user_id) => {
    return new Promise(async (resolve, reject) => {
        let sql = ''
        let param = []
        if(user_id == 1) {
            sql = 'SELECT Sales.*, Users.fullname FROM Sales INNER JOIN Users ON Sales.user_id = Users.user_id WHERE sale_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE() ORDER BY Sales.sale_date'
            if(!cache_storage.orders_seven_days || Date.now() - cache_storage.last_update > cache_timeout) {
                try {
                    const [count_result] = await promise_con.query('SELECT COUNT(*) AS count FROM Sales WHERE sale_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE()')
                    cache_storage.orders_seven_days = count_result[0].count
                    cache_storage.last_update = Date.now()
                } 
                catch(err) {
                    console.log(err)
                    reject(err)
                    return 
                }
            }
            con.query(sql, (err, result) => {
                if(err) {
                    console.log(err)
                    reject(err)
                    return 
                }
                const sale_total = calTotal(result)
                resolve({result, sale_total, total_orders: cache_storage.orders_seven_days})
            })
        }
        else {
            sql = 'SELECT Sales.*, Users.fullname FROM Sales INNER JOIN Users ON Sales.user_id = Users.user_id WHERE sale_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE() AND Sales.user_id = ? ORDER BY Sales.sale_date'
            param = [user_id]
            try {
                const [count_result] = await promise_con.query('SELECT COUNT(*) AS count FROM Sales WHERE sale_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE() AND user_id = ?', [user_id])
                con.query(sql, param, (err, result) => {
                    if(err) {
                        console.log(err)
                        reject(err)
                        return
                    }
                    const sale_total = calTotal(result)
                    resolve({result, sale_total, total_orders: count_result[0].count})

                })
            }
            catch(err) {
                console.log(err)
                reject(err)
                return 
            }
        }
        
    })
}

exports.getSalesThisMonth = (user_id) => {
    return new Promise(async (resolve, reject) => {
        let sql = ''
        let param = []
        if(user_id == 1) {
            sql = 'SELECT Sales.*, Users.fullname FROM Sales INNER JOIN Users ON Sales.user_id = Users.user_id WHERE MONTH(sale_date) = MONTH(CURDATE()) ORDER BY Sales.sale_date'
            if(!cache_storage.orders_month || (Date.now() - cache_storage.last_update) > cache_timeout) {
                try {
                    const [count_result] = await promise_con.query('SELECT COUNT(*) AS count FROM Sales WHERE MONTH(sale_date) = MONTH(CURDATE())')
                    cache_storage.orders_month = count_result[0].count
                    cache_storage.last_update = Date.now()
                } 
                catch(err) {
                    console.log(err)
                    reject(err)
                    return; 
                }

            }
            con.query(sql, (err, result) => {
                if(err) {
                    console.log(err)
                    reject(err)
                    return
                }
                const sale_total = calTotal(result)
                resolve({result, sale_total, total_orders: cache_storage.orders_month})
            })

            return 
        }
        else {
            param = [user_id]
            sql = 'SELECT Sales.*, Users.fullname FROM Sales INNER JOIN Users ON Sales.user_id = Users.user_id WHERE MONTH(sale_date) = MONTH(CURDATE()) AND Sales.user_id = ? ORDER BY Sales.sale_date'
            try {
                const [count_result] = await promise_con.query('SELECT COUNT(*) AS count FROM Sales WHERE MONTH(sale_date) = MONTH(CURDATE()) AND user_id = ?', [user_id])
                con.query(sql, param, (err, result) => {
                    if(err) {
                        console.log(err)
                        reject(err)
                        return
                    }
                    const sale_total = calTotal(result)
                    resolve({result, sale_total, total_orders: count_result[0].count})

                })
            } catch (err) {
                console.log(err)
                reject(err)
                return
            }
        }
        
    })
}

exports.getSalesEveryMonthByUserId = (user_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT MONTH(sale_date) as month, SUM(total_price) as total_revenue, SUM(total_quantity) as total_quantity_sold FROM Sales WHERE Sales.user_id = ? GROUP BY MONTH(sale_date) ORDER BY month'
        const param = [user_id]
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

exports.getSalesProfitEveryMonth = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT MONTH(Sales.sale_date) as month, SUM(Sale_Details.unit_price * Sale_Details.quantity - Products.import_price - Sale_Details.quantity) as total_profit
                    FROM Sale_Details INNER JOIN Sales ON Sales.sale_id = Sale_Details.sale_id INNER JOIN Products ON Sale_Details.product_id = Products.product_id
                    GROUP BY month
                    ORDER BY month
        `
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

