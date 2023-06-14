require('dotenv').config()
const express = require("express")
const sequelize = require("./db")
const cors = require("cors")
const fileUpload = require('express-fileupload')
const mainRouter = require('./routes/mainRouter')
const errorHandler = require('./middleware/ErrorHandlingMiddleware')
const path = require('path')

const PORT = process.env.PORT || 5000

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({}))
app.use('/api', mainRouter)
app.use('/', (req, res) => {
    return res.json({message: 'hello'})
})

app.use(errorHandler)


const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (e){
        console.error(e)
    }
}

start()

