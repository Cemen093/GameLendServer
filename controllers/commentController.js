const ApiError = require("../error/ApiError");
const sequelize = require('../db')
const {User, Game, Comment} = require("../models/models");

class CommentController {

    async createComment(req, res, next) {
        const userId = req.user.id;
        const { text, img, gameId } = req.body;
        //TODO img
        try {
            const user = await User.findByPk(userId);
            const game = await Game.findByPk(gameId);
            if (!user || !game) {
                return next(ApiError.notFound("Користувач або гра не знайдені"));
            }
            const comment = await Comment.create({ text, userId, gameId });
            return res.status(201).json(comment);
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

    async updateComment(req, res, next) {
        const userId = req.user.id;
        //TODO проверка на принадлежность комм к пользователю
        const { id, text, img } = req.body;
        //TODO img
        try {
            const comment = await Comment.findByPk(id);
            if (comment) {
                comment.text = text;
                await comment.save();
                return res.json(comment);
            } else {
                return next(ApiError.notFound("Коментар не знайдено"));
            }
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }
    async getAllComments(req, res, next) {
        const {page = 1, limit = 10} = req.body;
        const offset = (page - 1) * limit;
        try {
            const comments = await Comment.findAndCountAll({
                include: [
                    {
                        model: User,
                        through: {
                            attributes: []
                        },
                    },
                    {
                        model: Game ,
                        through: {
                            attributes: []
                        },
                    }],
                limit,
                offset,
            });
            return res.json(comments);
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

    async getAllCommentsForGame(req, res, next) {
        const {gameId, page = 1, limit = 10} = req.body;
        const offset = (page - 1) * limit;
        try {
            const comments = await Comment.findAndCountAll({
                where: { gameId },
                include: [
                    {
                        model: User,
                        through: {
                            attributes: []
                        },
                    },
                    {
                        model: Game ,
                        through: {
                            attributes: []
                        },
                    }],
                limit,
                offset,
            });
            return res.json(comments);
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }


    async getCommentById(req, res, next) {
        const { id } = req.body;
        try {
            const comment = await Comment.findByPk(id, {
                include: [
                    {
                        model: User,
                        through: {
                            attributes: []
                        },
                    },
                    {
                        model: Game ,
                        through: {
                            attributes: []
                        },
                    }],
            });
            if (comment) {
                return res.json(comment);
            } else {
                return next(ApiError.notFound("Коментар не знайдено"));
            }
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

    async remove(req, res, next) {
        const { id } = req.params;
        try {
            const comment = await Comment.findByPk(id);
            if (comment) {
                await comment.destroy();
                return res.json({ message: "Коментар успішно видалено" });
            } else {
                return next(ApiError.notFound("Коментар не знайдено"));
            }
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }
}

module.exports = new CommentController();
