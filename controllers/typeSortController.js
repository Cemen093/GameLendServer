const uuid = require('uuid')
const path = require('path')
const {
    TypeSort,
} = require("../models/models");
const ApiError = require("../error/ApiError");

class TypeSortController {
    async create(req, res, next) {
        const {title, order} = req.body
        if (!title) {
            return next(ApiError.badRequest("title не задан"))
        }
        if (!title) {
            return next(ApiError.badRequest("order не задан"))
        }

        try {
            const sort = await TypeSort.create({title, order});

            return res.json(sort)
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res, next) {
        try {
            const typeSorts = await TypeSort.findAndCountAll({
                order: [['id', 'ASC']]
            });
            res.json(typeSorts);
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async getOne(req, res, next) {
        try {
            const {id} = req.body
            const typeSort = await TypeSort.findByPk(id);
            res.json(typeSort);
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new TypeSortController()
