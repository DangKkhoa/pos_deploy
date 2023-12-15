module.exports = (req, res, next) => {
    if(req.session.user.first_login && !req.session.user.is_admin) {
        return res.redirect('/set_password')
    }
    next()
}