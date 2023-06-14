const Routes = require('express')
const mainRouter = new Routes()

const userRouter = require('./userRouter')
const basketRouter = require('./basketRouter')
const wishlistRouter = require('./wishlistRouter')
const orderList = require('./orderListRouter')
const gameRouter = require('./gameRouter')
const platformRouter = require('./platformRouter')
const commentRouter = require('./commentRouter')
const typeSortRouter = require('./typeSortRouter')

mainRouter.use('/user', userRouter)
mainRouter.use('/basket', basketRouter)
mainRouter.use('/wishlist', wishlistRouter)
mainRouter.use('/orderList', orderList)
mainRouter.use('/game', gameRouter)
mainRouter.use('/platform', platformRouter)
mainRouter.use('/comment', commentRouter)
mainRouter.use('/typeSort', typeSortRouter)

module.exports = mainRouter
