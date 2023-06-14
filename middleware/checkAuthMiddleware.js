const jwt = require('jsonwebtoken')
const ApiError = require("../error/ApiError");
const {verify} = require("jsonwebtoken");
const {User} = require("../models/models");

const authMiddleware = async (req, res, next) => {
    if (req.method === 'OPTIONS') {
        next();
    } else {
        try {
            const token = req.headers.authorization.split(' ')[1];
            if (token) {
                const userData = jwt.verify(token, process.env.SECRET_KEY);
                const user = await User.findOne({ where: { id: userData.id } });

                if (!user) {
                    return next(ApiError.notFound('Користувача не знайдено'));
                }
                if (user.blocked && user.blockedUntil && new Date() < new Date(user.blockedUntil)) {
                    return next(ApiError.forbidden('Користувач заблокований'));
                }

                req.user = { id, login, email, imgName, role } = user.dataValues;
                next();
            } else {
                next(ApiError.unauthorized('Не авторизований'));
            }
        } catch (e) {
            next(ApiError.unauthorized('Не авторизований'));
        }
    }
};

module.exports = authMiddleware;
