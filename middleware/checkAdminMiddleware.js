const jwt = require('jsonwebtoken')
const ApiError = require("../error/ApiError");

module.exports = (req, res, next) => {
    if (req.method === "OPTIONS" || req.user.role === "ADMIN") {
        next()
    } else {
        next(ApiError.forbidden("Нет доступа"));
    }
}
