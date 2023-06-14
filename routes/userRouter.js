const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/checkAuthMiddleware')
const checkAdminMiddleware = require('../middleware/checkAdminMiddleware')

router.post('/registration', userController.registration);
router.post('/login', userController.login);
router.get('/auth', authMiddleware, userController.check);
router.put('/update', authMiddleware, userController.update);
router.put('/update/:email', authMiddleware, checkAdminMiddleware, userController.updateByAdmin);
router.delete('/:userId', authMiddleware, checkAdminMiddleware, userController.deleteUser);

module.exports = router
