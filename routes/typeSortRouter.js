const Router = require('express')
const router = new Router()
const typeSortController = require('../controllers/typeSortController')
const checkAdminMiddleware = require('../middleware/checkAdminMiddleware')
const authMiddleware = require('../middleware/checkAuthMiddleware')

router.post('/', authMiddleware, checkAdminMiddleware, typeSortController.create)
router.get('/', typeSortController.getAll)
router.get('/:id', typeSortController.getOne)

module.exports = router
