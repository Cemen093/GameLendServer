const Router = require('express')
const router = new Router()
const gameController = require('../controllers/gameController')
const checkAdminMiddleware = require('../middleware/checkAdminMiddleware')
const authMiddleware = require('../middleware/checkAuthMiddleware')
const checkGameDataMiddleware = require('../middleware/checkGameDataMiddleware')

router.post('/', authMiddleware, checkAdminMiddleware, checkGameDataMiddleware, gameController.create)
router.put('/', authMiddleware, checkAdminMiddleware, checkGameDataMiddleware, gameController.update)
router.get('/', gameController.getAll)
router.get('/random', gameController.getRandomGames)
router.get('/:id', gameController.getOne)
router.delete('/:id', gameController.delete)

module.exports = router
