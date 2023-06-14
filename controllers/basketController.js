const ApiError = require("../error/ApiError");
const {Basket, Game, BasketItem, Platform, Discount, GamePlatform, WishlistItem} = require("../models/models");
const sequelize = require('../db')

class BasketController {
    async getAllGameFromBasket(req, res, next) {
        try {
            const userId = req.user.id;
            const basket = await Basket.findOne({where: {userId}});

            const games = await basket.getGames({
                include: [{model: Platform, through: {attributes: [],},},],
            });
            return res.json({count: games.length, rows: games});
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

    async addGameToBasket(req, res, next) {
        try {
            const userId = req.user.id;
            const {gameId} = req.body;

            const basket = await Basket.findOne({where: {userId}});
            const game = await Game.findByPk(gameId);

            const existingItem = await basket.hasGame(game);
            if (existingItem) {
                return next(ApiError.badRequest("Вже у кошику"));
            }

            await basket.addGame(game, { through: BasketItem, individualHooks: true });

            return res.json({message: "Гра додана до кошику"});
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

    async removeGameFromBasket(req, res, next) {
        try {
            const userId = req.user.id;
            const {gameId} = req.params;
            const basket = await Basket.findOne({where: {userId}});
            const game = await Game.findByPk(gameId);

            const existingItem = await basket.hasGame(game);
            if (!existingItem) {
                return next(ApiError.badRequest("Немає у кошику"));
            }

            await basket.removeGame(game, {through: BasketItem, individualHooks: true});

            return res.json({message: "Гра видалена із кошику"});
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

    async removeAllGameFromBasket(req, res, next) {
        try {
            const userId = req.user.id;
            const basket = await Basket.findOne({where: {userId}});

            await BasketItem.destroy({ where: { basketId: basket.id } });

            return res.json({message: "Всі ірни виделені із кошику"});
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }
}

module.exports = new BasketController();
