const Router = require('express')
const router = new Router()
const platformController = require('../controllers/platformController')
const checkAdminMiddleware = require('../middleware/checkAdminMiddleware')
const authMiddleware = require('../middleware/checkAuthMiddleware')

router.post('/', authMiddleware, checkAdminMiddleware, platformController.create)
router.get('/', platformController.getAll)
router.get('/:id', platformController.getOne)

module.exports = router
