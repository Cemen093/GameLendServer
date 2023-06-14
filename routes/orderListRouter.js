const Router = require('express')
const router = new Router()
const orderListController = require('../controllers/orderListController')
const authMiddleware = require('../middleware/checkAuthMiddleware')
const checkAdminMiddleware = require('../middleware/checkAdminMiddleware')
const checkOrderIdMiddleware = require('../middleware/checkOrderIdMiddleware')

router.post('/', authMiddleware, orderListController.createOrder);
router.put('/send-payment-details', authMiddleware, checkOrderIdMiddleware, checkAdminMiddleware, orderListController.sendPaymentDetails);
router.put('/confirm-payment', authMiddleware, checkOrderIdMiddleware, checkAdminMiddleware, orderListController.confirmPaymentOrder);
router.get('/', authMiddleware, orderListController.getAllUserOrders);
router.get('/all', authMiddleware, checkAdminMiddleware, orderListController.getAllOrders);
router.delete('/:orderId', authMiddleware, checkAdminMiddleware, orderListController.deleteOrder);

module.exports = router;
