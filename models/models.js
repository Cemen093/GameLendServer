const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    login: {type: DataTypes.STRING, allowNull: false},
    email: {type: DataTypes.STRING, unique: true, allowNull: false},
    password: {type: DataTypes.STRING, allowNull: false},
    imgName: {type: DataTypes.STRING, defaultValue: "defaultUser.png", allowNull: false},
    role: {type: DataTypes.STRING, defaultValue: "USER", allowNull: false},
    blocked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    blockedUntil: { type: DataTypes.DATE, allowNull: true },
})

const Basket = sequelize.define('basket', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
})

const BasketItem = sequelize.define('basket_item', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
})

const Wishlist = sequelize.define('wish_list', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
})

const WishlistItem = sequelize.define('wishlist_item', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
})

const OrderList = sequelize.define('order_list', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
})

const Order = sequelize.define('order', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    isPaid: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
})

const OrderItem = sequelize.define('order_item', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    price: {type: DataTypes.STRING, allowNull: false},
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
})

const Game = sequelize.define('game', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING(1000), allowNull: false},
    price: {type: DataTypes.STRING, allowNull: false},
    rating: {type: DataTypes.STRING, allowNull: false, defaultValue: 7},
    imgName: {type: DataTypes.STRING, allowNull: false},
    trailer: {type: DataTypes.STRING, allowNull: false},
    discountPercentage: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    discountExpirationDate: {type: DataTypes.DATE, allowNull: true},
})

const Platform = sequelize.define('platform', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, allowNull: false},
})

const GamePlatform = sequelize.define('gamePlatform', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
}, {tableName: "gamePlatform"});

const MinRequirement = sequelize.define('min_requirement', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    cpu: {type: DataTypes.STRING, allowNull: false},
    ram: {type: DataTypes.STRING, allowNull: false},
    os: {type: DataTypes.STRING, allowNull: false},
    space: {type: DataTypes.STRING, allowNull: false},
})

const RecRequirement = sequelize.define('rec_requirement', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    cpu: {type: DataTypes.STRING, allowNull: false},
    ram: {type: DataTypes.STRING, allowNull: false},
    os: {type: DataTypes.STRING, allowNull: false},
    space: {type: DataTypes.STRING, allowNull: false},
})

const Comment = sequelize.define('comment', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    text: {type: DataTypes.STRING, allowNull: false},
    imgName: {type: DataTypes.STRING, defaultValue: false},
})

const TypeSort = sequelize.define('type_sort', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, allowNull: false},
    order: {type: DataTypes.JSON, allowNull: false},
})

const Key = sequelize.define('key', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    key: {type: DataTypes.STRING, unique: true, allowNull: false}
})

//корзина
User.hasOne(Basket, {foreignKey: {allowNull: false}});
Basket.belongsTo(User, {foreignKey: {allowNull: false}});
Basket.belongsToMany(Game, {through: BasketItem})
Game.belongsToMany(Basket, {through: BasketItem})

//список желаемого
User.hasOne(Wishlist, {foreignKey: {allowNull: false}});
Wishlist.belongsTo(User, {foreignKey: {allowNull: false}});
Wishlist.belongsToMany(Game, {through: WishlistItem})
Game.belongsToMany(Wishlist, {through: WishlistItem})

//список заказов
User.hasOne(OrderList, {foreignKey: {allowNull: false}});
OrderList.belongsTo(User, {foreignKey: {allowNull: false}});
OrderList.hasMany(Order, { foreignKey: { allowNull: false } });
Order.belongsTo(OrderList, { foreignKey: { allowNull: false } });
Order.hasMany(OrderItem, { foreignKey: { allowNull: false } });
OrderItem.belongsTo(Order, { foreignKey: { allowNull: false } });
Platform.hasOne(Order, { foreignKey: { allowNull: false } })
Order.belongsTo(Platform, { foreignKey: { allowNull: false } })
Game.hasMany(OrderItem, { foreignKey: { allowNull: false } });
OrderItem.belongsTo(Game, { foreignKey: { allowNull: false } });

//комментарии
User.hasMany(Comment);
Comment.belongsTo(User);
Game.hasMany(Comment);
Comment.belongsTo(Game);

//игра
Game.hasOne(MinRequirement, {foreignKey: {allowNull: false}});
MinRequirement.belongsTo(Game, {foreignKey: {allowNull: false}});
Game.hasOne(RecRequirement, {foreignKey: {allowNull: false}});
RecRequirement.belongsTo(Game, {foreignKey: {allowNull: false}});
Game.belongsToMany(Platform, { through: GamePlatform });
Platform.belongsToMany(Game, { through: GamePlatform });

//ключи
Game.hasMany(Key, {foreignKey: {allowNull: false}});
Key.belongsTo(Game, {foreignKey: {allowNull: false}});
Platform.hasOne(Key, {foreignKey: {allowNull: false}});
Key.belongsTo(Platform, {foreignKey: {allowNull: false}});

module.exports = {
    User,
    Basket,
    BasketItem,
    Wishlist,
    WishlistItem,
    OrderList,
    Order,
    OrderItem,
    Game,
    Platform,
    GamePlatform,
    MinRequirement,
    RecRequirement,
    Comment,
    Key,
    TypeSort,
}
