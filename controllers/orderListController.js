const {
    OrderList,
    OrderItem,
    Order,
    Game, GamePlatform,
    User, Platform, Key
} = require("../models/models");
const ApiError = require("../error/ApiError");
const sequelize = require('../db');
const emailService = require("../emailService");
const {readFileSync, writeFileSync} = require("fs");

class OrderListController {
    async getAllUserOrders(req, res, next) {
        const userId = req.user.id;
        const {page = 1, limit = 10} = req.query;
        const offset = (page - 1) * limit;

        try {
            const orderList = await OrderList.findOne({where: {userId}});

            const orders = await Order.findAll({
                where: {orderListId: orderList.id},
                include: {
                    model: OrderItem,
                    include: Game,
                },
                limit,
                offset
            });

            return res.json({count: orders.length, rows: orders});
        } catch (e) {
            console.error(e.message)
            return next(ApiError.badRequest(e.message));
        }
    }

    async getAllOrders(req, res, next) {
        const {page = 1, limit = 10} = req.query;
        const offset = (page - 1) * limit;

        try {
            const orders = await Order.findAndCountAll({
                include: [
                    {
                        model: OrderItem,
                        include: Game,
                    },
                    {
                        model: OrderList,
                        include: [User],
                    },
                ],
                limit,
                offset
            });
            const ordersMod = orders.rows.map(order => {
                const {order_list, ...rest} = order.toJSON();
                const user = order_list.user;
                return {...rest, user};
            });

            return res.json({count: orders.count, rows: ordersMod});
        } catch (e) {
            console.error(e.message)
            return next(ApiError.badRequest(e.message));
        }
    }

    async createOrder(req, res, next) {
        const userId = req.user.id;
        const {items, platformId, promoCode} = req.body;

        const orderList = await OrderList.findOne({where: {userId}});
        let transaction;
        try {
            transaction = await sequelize.transaction();

            const newOrder = await Order.create({
                orderListId: orderList.id,
                platformId: platformId
            }, {transaction});

            const orderItems = items.map((item) => ({
                orderId: newOrder.id,
                gameId: item.id,
                price: item.price,
                quantity: item.quantity,
            }));

            await OrderItem.bulkCreate(orderItems, {transaction});

            await transaction.commit();
            return res.json({message: "Заказ успішно створенний"});
        } catch (e) {
            if (transaction) {
                await transaction.rollback();
            }
            return next(ApiError.badRequest(e.message));
        }
    }

    async sendPaymentDetails(req, res, next) {
        try {
            const {orderId} = req.body
            const order = await Order.findByPk(orderId, {
                include: [
                    {
                        model: OrderItem,
                        include: Game,
                    },
                    {
                        model: OrderList,
                        include: [User],
                    },
                ],
            });

            if (!order) {
                return next(ApiError.badRequest('Замовлення не знайдено'))
            }

            const {order_list, order_items, ...rest} = order.toJSON();
            const user = order_list.user;
            let totalAmount = 0;
            order_items.forEach((orderItem) => {
                totalAmount += orderItem.price * orderItem.quantity;
            });

            emailService.sendPaymentDetails({user, orderId, totalAmount})

            return res.json({message: 'Реквізити надіслані'})
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    };

    async confirmPaymentOrder(req, res, next) {
        const transaction = await sequelize.transaction();
        try {
            const {orderId} = req.body

            const order = await Order.findByPk(orderId, {
                include: [
                    {
                        model: OrderItem,
                        include: [
                            {
                                model: Game,
                                include: [{model: Platform},],
                            },
                        ],
                    },
                    {
                        model: OrderList,
                        include: [User],
                    },
                    {
                        model: Platform,
                    },
                ],
            });

            const orderData = order.toJSON();
            const gameKeys = [];

            if (!orderData.platform) {
                next(ApiError.badRequest('Платформа не вказана в Order.'))
            }

            for (const orderItem of orderData.order_items) {
                const game = orderItem.game;
                const platform = order.platform;

                const platformGame = await GamePlatform.findOne({
                    where: { gameId: game.id, platformId: platform.id },
                });

                if (!platformGame) {
                    next(ApiError.badRequest(`Гра '${game.title}' не доступна на платформі '${platform.title}'.`))
                }

                const keys = await Key.findAll({
                    where: { gameId: game.id, platformId: platform.id },
                    limit: orderItem.quantity,
                    transaction,
                });

                if (keys.length < orderItem.quantity) {
                    next(ApiError.badRequest(`Недостатньо ключів для гри '${game.title}' на платформі '${platform.title}'.`))
                }

                const gameKeyPairs = keys.map((key) => ({
                    title: game.title,
                    key: key.key,
                }));

                gameKeys.push(...gameKeyPairs);

                await Key.destroy({
                    where: { id: keys.map((key) => key.id) },
                    transaction,
                });
            }

            const orderList = order.order_list;
            const user = orderList.user;

            order.isPaid = true;
            await order.save({ transaction });

            emailService.sendGameKey({ user, orderId, gameKeys });

            await transaction.commit();
            return res.json({ message: 'Ключі надіслані' });
        } catch (e) {
            await transaction.rollback();
            return next(ApiError.badRequest(e.message))
        }
    };

    async deleteOrder(req, res, next) {
        const {orderId} = req.params;
        const order = await Order.findByPk(orderId);
        if (!order) {
            return next(ApiError.notFound('Заказ не найден'))
        }

        let transaction;
        try {
            transaction = await sequelize.transaction();
            await OrderItem.destroy({where: {orderId}, transaction});
            await order.destroy({transaction});
            await transaction.commit();

            return res.json({message: "Заказ успішно видалено"})
        } catch (e) {
            if (transaction) {
                transaction.rollback()
            }
            return next(ApiError.badRequest(e.message))
        }
    };
}

module.exports = new OrderListController()
