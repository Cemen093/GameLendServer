const Router = require('express')
const router = new Router()
const wishListController = require('../controllers/wishlistController')
const authMiddleware = require("../middleware/checkAuthMiddleware");
const checkGameIdMiddleware = require("../middleware/checkGameIdMiddleware");

router.post('/', authMiddleware, checkGameIdMiddleware, wishListController.addGameToWishList);
router.put('/moveToBasket', authMiddleware, checkGameIdMiddleware, wishListController.moveGameToBasket);
router.get('/', authMiddleware, wishListController.getAllGameFromWishList);
router.delete('/:gameId', authMiddleware, wishListController.removeGameFromWishList);

module.exports = router
