const ApiError = require("../error/ApiError");
const { Order } = require("../models/models");

const checkOrderIdMiddleware = async (req, res, next) => {
    const { orderId } = req.body;
    if (!orderId) {
        return next(ApiError.badRequest("orderId не задан"));
    }

    try {
        const order = await Order.findByPk(orderId);
        if (!order) {
            return next(ApiError.notFound("Замовлення не знайдено"));
        }
    } catch (error) {
        return next(ApiError.internal(error.message));
    }

    next();
};

module.exports = checkOrderIdMiddleware;
