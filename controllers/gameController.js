const uuid = require('uuid')
const path = require('path')
const {
    Game,
    MinRequirement,
    RecRequirement,
    Platform,
    TypeSort, Basket, BasketItem,
    GamePlatform,
} = require("../models/models");
const ApiError = require("../error/ApiError");
const {Op} = require("sequelize");
const sequelize = require("../db");

class GameController {
    async create(req, res, next) {
        const {
            title, description, price, trailer, platformsId, minRequirement, recRequirement,
            discountPercentage = 0, discountExpirationDate
        } = req.body;
        const parsedMinRequirement = JSON.parse(minRequirement);
        const parsedRecRequirement = JSON.parse(recRequirement);
        const {img} = req.files || {};

        const transaction = await sequelize.transaction();
        try {
            let imgName = uuid.v4() + ".jpg";
            await img.mv(path.resolve(__dirname, '..', 'static', imgName));

            const game = await Game.create({
                title, description, price, imgName, trailer, discountPercentage, discountExpirationDate
            }, {transaction});
            await MinRequirement.create({...parsedMinRequirement, gameId: game.id}, {transaction});
            await RecRequirement.create({...parsedRecRequirement, gameId: game.id}, {transaction});
            for (const platformId of platformsId) {
                const platform = await Platform.findByPk(platformId, {transaction});
                if (platform) {
                    await GamePlatform.create({gameId: game.id, platformId: platformId}, {transaction});
                }
            }

            await transaction.commit();

            return res.json(game);
        } catch (e) {
            await transaction.rollback();
            return next(ApiError.badRequest(e.message));
        }
    }

    async getAll(req, res, next) {
        try {
            const {title = '', platformsId = [], typeSortId = 1, page = 1, limit = 10} = req.query;
            const offset = (page - 1) * limit;

            const typeSort = await TypeSort.findByPk(typeSortId);
            if (!typeSort) {
                return next(ApiError.badRequest('Не верный typeSortId'));
            }
            const order = typeSort.order;

            let gameWhereCondition = {};
            if (title) {
                gameWhereCondition = {
                    ...gameWhereCondition,
                    title: {[Op.iLike]: `%${title.toLowerCase()}%`},
                };
            }

            let platformWhereCondition = {};
            if (platformsId.length > 0) {
                platformWhereCondition = {
                    ...platformWhereCondition,
                    id: {[Op.in]: platformsId}
                }
            }


            const data = await Game.findAndCountAll({
                distinct: true,
                where: gameWhereCondition,
                include: [
                    {
                        model: Platform,
                        through: {
                            attributes: []
                        },
                        where: platformWhereCondition,
                    },
                    MinRequirement,
                    RecRequirement,
                ],
                order,
                limit,
                offset,
            });
            const gameIds = data.rows.map(game => game.id);

            data.rows = await Game.findAll({
                distinct: true,
                where: {id: {[Op.in]: gameIds}},
                include: [
                    {
                        model: Platform,
                        through: {
                            attributes: []
                        },
                    },
                    MinRequirement,
                    RecRequirement,
                ],
                order,
            })

            res.json(data);
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async getRandomGames(req, res, next) {
        const {platformsId, limit = 10} = req.query;
        try {

            const randomGames = await Game.findAll({
                include: [
                    {
                        model: Platform,
                        where: {id: {[Op.in]: platformsId}},
                        through: {attributes: []},
                    },
                    MinRequirement,
                    RecRequirement,
                ],
                order: sequelize.random(),
                limit,
            });

            res.json(randomGames);
        } catch (e) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async getOne(req, res, next) {
        const {id} = req.params
        try {
            const game = await Game.findOne({
                where: {id: id},
                include: [
                    {
                        model: Platform,
                        through: {
                            attributes: []
                        }
                    },
                    MinRequirement,
                    RecRequirement
                ],
            })
            res.json(game);
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async update(req, res, next) {
        const {game} = req.body;
        const {
            id, title, description, price, trailer, platformsId, minRequirement, recRequirement,
            discountPercentage = 0, discountExpirationDate
        } = game;
        const parsedMinRequirement = JSON.parse(minRequirement);
        const parsedRecRequirement = JSON.parse(recRequirement);

        try {
            await sequelize.transaction(async (transaction) => {
                const game = await Game.findByPk(id, {transaction});

                game.title = title;
                game.description = description;
                game.price = price;
                game.trailer = trailer;
                game.discountPercentage = discountPercentage;
                game.discountExpirationDate = discountExpirationDate;
                await game.save({transaction});

                const minReq = await MinRequirement.findOne({where: {gameId: id}, transaction});
                if (minReq) {
                    minReq.cpu = parsedMinRequirement.cpu;
                    minReq.ram = parsedMinRequirement.ram;
                    minReq.os = parsedMinRequirement.os;
                    minReq.space = parsedMinRequirement.space;
                    await minReq.save({transaction});
                }

                const recReq = await RecRequirement.findOne({where: {gameId: id}, transaction});
                if (recReq) {
                    recReq.cpu = parsedRecRequirement.cpu;
                    recReq.ram = parsedRecRequirement.ram;
                    recReq.os = parsedRecRequirement.os;
                    recReq.space = parsedRecRequirement.space;
                    await recReq.save({transaction});
                }

                const gamePlatforms = await game.getPlatforms({transaction});
                await game.removePlatforms(gamePlatforms, {transaction});
                for (const platformId of platformsId) {
                    const platform = await Platform.findByPk(platformId, {transaction});
                    if (platform) {
                        await platform.addGame(game, {transaction});
                    }
                }

                res.json(game);
            });
        } catch (e) {
            return next(ApiError.badRequest(e.message));
        }
    }


    async delete(req, res, next) {
        const {id} = req.params;
        const transaction = await sequelize.transaction();
        try {
            const game = await Game.findByPk(id, {transaction});
            await game.removePlatforms(game.platforms, {transaction});
            await game.destroy({transaction});

            await transaction.commit();

            res.json({message: 'Гра успішно видалена'});
        } catch (e) {
            await transaction.rollback();
            return next(ApiError.badRequest(e.message));
        }
    }
}

module.exports = new GameController()
