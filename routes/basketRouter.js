const Router = require('express')
const router = new Router()
const basketController = require('../controllers/basketController')
const authMiddleware = require('../middleware/checkAuthMiddleware')
const checkGameIdMiddleware = require('../middleware/checkGameIdMiddleware')

router.post('/', authMiddleware, checkGameIdMiddleware, basketController.addGameToBasket);
router.get('/', authMiddleware, basketController.getAllGameFromBasket);
router.delete('/all', authMiddleware, basketController.removeAllGameFromBasket);
router.delete('/:gameId', authMiddleware, basketController.removeGameFromBasket);

module.exports = router;
