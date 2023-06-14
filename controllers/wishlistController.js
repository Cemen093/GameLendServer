const { Game, Wishlist, WishlistItem, BasketItem, Basket, Platform} = require("../models/models");
const ApiError = require("../error/ApiError");
const sequelize = require('../db');

class WishlistController {
    async getAllGameFromWishList(req, res, next) {
        try {
            const userId = req.user.id;
            const wishList = await Wishlist.findOne({ where: { userId } });

            const games = await wishList.getGames({
                include: [{model: Platform, through: {attributes: []},}],
            });
            return res.json({count: games.length, rows: games});
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

    async addGameToWishList(req, res, next) {
        try {
            const userId = req.user.id;
            const { gameId } = req.body;

            const wishList = await Wishlist.findOne({ where: { userId } });
            const game = await Game.findByPk(gameId);

            const existingItem = await wishList.hasGame(game);
            if (existingItem) {
                return next(ApiError.badRequest("Уже в списке желаемого"));
            }

            await wishList.addGame(game, { through: WishlistItem, individualHooks: true });
            return res.json({message: "Гра додана до списку бажаного"});
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

    async moveGameToBasket(req, res, next) {

        const transaction = await sequelize.transaction();
        try {
            const userId = req.user.id;
            const { gameId } = req.body;

            const wishList = await Wishlist.findOne({ where: { userId } });
            const basket = await Basket.findOne({ where: { userId } });
            const game = await Game.findByPk(gameId);

            const existingItemInWishList = await wishList.hasGame(game);
            const existingItemInBasket = await basket.hasGame(game);

            if (!existingItemInWishList) {
                return next(ApiError.badRequest("Игра не найдена в списке желаемого"));
            }

            if (existingItemInBasket) {
                return next(ApiError.badRequest("Игра уже находится в корзине"));
            }

            await wishList.removeGame(game, { through: WishlistItem, individualHooks: true, transaction });
            await basket.addGame(game, { through: BasketItem, individualHooks: true, transaction });
            await transaction.commit();

            return res.json({message: "Гра переміщена до кошику"});
        } catch (e) {
            await transaction.rollback();
            return next(ApiError.internal(e.message));
        }
    }

    async removeGameFromWishList(req, res, next) {
        try {
            const userId = req.user.id;
            const { gameId } = req.params;
            const wishList = await Wishlist.findOne({ where: { userId } });
            const game = await Game.findByPk(gameId);

            const existingItem = await wishList.hasGame(game);
            if (!existingItem) {
                return next(ApiError.badRequest("Гри немає у списку бажаного"));
            }

            await wishList.removeGame(game, { through: WishlistItem, individualHooks: true });
            return res.json({message: "Гра видаленна із списку баженого"});
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }
}

module.exports = new WishlistController();
