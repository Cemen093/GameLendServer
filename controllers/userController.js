const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User, Basket, Wishlist, OrderList} = require('../models/models')
const sequelize = require("../db");
const uuid = require('uuid')
const path = require('path')

const generateJwt = (id, login, email, imgName, role) => {
    return jwt.sign({id, login, email, imgName, role}, process.env.SECRET_KEY, {expiresIn: '24h'});
};

class UserController {
    async registration(req, res, next) {
        let transaction;
        try {
            const {login, email, password, img = 'defaultUser.png'} = req.body;
            if (!email || !password) {
                return next(ApiError.badRequest('Некоректний email або password'));
            }
            const candidate = await User.findOne({where: {email}});
            if (candidate) {
                return next(ApiError.badRequest('Користувач уже існує'));
            }
            const hashPassword = await bcrypt.hash(password, 7);
            const user = {
                login,
                email,
                password: hashPassword,
                img,
            };

            transaction = await sequelize.transaction();
            const newUser = await User.create(user, {transaction});
            await Basket.create({userId: newUser.id}, {transaction});
            await Wishlist.create({userId: newUser.id}, {transaction});
            await OrderList.create({userId: newUser.id}, {transaction});
            await transaction.commit();

            const token = generateJwt(newUser.id, newUser.login, newUser.email, newUser.imgName, newUser.role);
            return res.json({token});
        } catch (e) {
            if (transaction) {
                await transaction.rollback();
            }
            next(ApiError.badRequest(e.message));
        }
    }

    async login(req, res, next) {
        try {
            const {login, email, password} = req.body;
            if (!login && !email) {
                return next(ApiError.badRequest('Введіть логін або email'));
            }
            if (!password) {
                return next(ApiError.badRequest('Пароль не задано'));
            }
            const whereClause = {};
            if (login) {
                whereClause.login = login;
            }
            if (email) {
                whereClause.email = email;
            }
            const user = await User.findOne({where: whereClause});
            if (!user) {
                return next(ApiError.badRequest('Користувача не знайдено'));
            }
            const comparePassword = bcrypt.compareSync(password, user.password);
            if (!comparePassword) {
                return next(ApiError.badRequest('Невірний пароль'));
            }

            const token = generateJwt(user.id, user.login, user.email, user.imgName, user.role);
            return res.json({token});
        } catch (e) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async check(req, res, next) {
        const user = req.user;
        const token = generateJwt(user.id, user.login, user.email, user.imgName, user.role);
        return res.json({token});
    }

    async update(req, res, next) {
        try {
            const {id} = req.user;
            const {login, email, password} = req.body;
            const {img} = req.files || {};
            console.log(req.body)
            console.log(req.files)

            const user = await User.findByPk(id);

            if (login) {
                user.login = login;
            }
            if (email) {
                user.email = email;
            }
            if (img) {
                const imgName = uuid.v4() + '.jpg';
                await img.mv(path.resolve(__dirname, '..', 'static', imgName));
                user.imgName = imgName;
            }
            if (password) {
                user.password = await bcrypt.hash(password, 7);
            }

            await user.save();

            res.json(user);
        } catch (e) {
            return next(ApiError.internal('Помилка при оновленні даних користувача'));
        }
    }

    async updateByAdmin(req, res, next) {
        try {
            const {email: userEmail} = req.params;
            const {login, email, password, blocked, blockedUntil, role} = req.body;
            const {img} = req.files || {};


            const user = await User.findOne({where: {email: userEmail}});
            if (!user) {
                return next(ApiError.notFound('Користувача не знайдено'));
            }

            if (login) {
                user.login = login;
            }
            if (email) {
                user.email = email;
            }
            if (img) {
                const imgName = uuid.v4() + '.jpg';
                await img.mv(path.resolve(__dirname, '..', 'static', imgName));
                user.imgName = imgName;
            }
            if (password) {
                user.password = await bcrypt.hash(password, 7);
            }
            if (role) {
                user.role = role;
            }
            if (blocked) {
                user.blocked = blocked;
            }
            if (blockedUntil) {
                user.blockedUntil = blockedUntil;
            }

            await user.save();

            res.json({message: 'Дані користувача оновлено'});
        } catch (e) {
            console.error(e.message)
            return next(ApiError.internal('Помилка при оновленні даних користувача'));
        }
    }

    async deleteUser(req, res, next) {
        try {
            const {userId} = req.params;
            const user = await User.findByPk(userId);
            if (!user) {
                return next(ApiError.notFound('Користувача не знайдено'));
            }
            await user.destroy();
            res.json({message: 'Користувача успішно видалено'});
        } catch (e) {
            return next(ApiError.internal('Помилка при видаленні користувача'));
        }
    }
}

module.exports = new UserController();
