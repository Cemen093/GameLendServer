const ApiError = require("../error/ApiError");
const {Game} = require("../models/models");

const checkGameIdMiddleware = async (req, res, next) => {
    const { gameId } = req.body;
    if (!gameId) {
        return next(ApiError.badRequest("gameId не задан"));
    }
    const game = await Game.findByPk(gameId);
    if (!game) {
        return next(ApiError.notFound("Гра не знайдена"));
    }

    next();
};

module.exports = checkGameIdMiddleware;
