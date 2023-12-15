const con = require('../../database/db')

exports.executeQuery = () => {
    return new Promise((resolve, reject) => {
        con.query('SELECT * FROM Products', (err, results) => {
            if(err) {
                console.log(err)
                reject(err);
                return ;
            }
            resolve(results)
            
        })
    })
}

exports.getProductCategory = (categories) => {
    return new Promise((resolve, reject) => {
        const params = [categories + '%']
        con.query('SELECT * FROM Products where category LIKE ?', params, (err, results) => {
            if(err) {
                console.log(err)
                reject(err)
                return;
            }
            resolve(results)

        })
    })
}

exports.getProductByName = (name) => {
    return new Promise((resolve, reject) => {
        const params = ['%' + name + '___%']
        con.query('SELECT * FROM Products where product_name LIKE ?', params, (err, results) => {
            if(err) {
                console.log(err)

                reject(err)
                return;
            }
            resolve(results)
        })
    })
}

exports.getProductByManufacturer = (manufacturer) => {
    return new Promise((resolve, reject) => {
        const params = [manufacturer]
        con.query('SELECT * FROM Products where manufacturer = ?', params, (err, results) => {
            if(err) {
                console.log(err)

                reject(err)
                return;
            }
            resolve(results)
        })
    })
}