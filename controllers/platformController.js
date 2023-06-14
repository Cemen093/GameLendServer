const {
    Platform,
} = require("../models/models");
const ApiError = require("../error/ApiError");
const {Op, Sequelize} = require("sequelize");

class GameController {
    async create(req, res, next) {
        const {title} = req.body
        if (!title) {
            return next(ApiError.badRequest("title не задан"))
        }
        try {
            const platform = await Platform.create({ title });

            return res.json(platform)
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res, next) {
        try {
            const {page = 1, limit = 10} = req.body;
            const offset = (page - 1) * limit;

            const platforms = await Platform.findAndCountAll({
                distinct: true,
                limit,
                offset
            });

            res.json(platforms);
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async getOne(req, res, next) {
        try {
            const {id} = req.body
            const platform = await Platform.findOne({
                where: {id: id},
            })
            res.json(platform);
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new GameController()
