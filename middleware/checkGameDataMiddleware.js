const ApiError = require("../error/ApiError");

const checkGameDataMiddleware = async (req, res, next) => {
    const { title, description, price, trailer, platformsId, minRequirement, recRequirement } = req.body;

    if (!title || !description || !price || !trailer){
        return next(ApiError.badRequest("Данні про гру не повні"));
    }

    if (!platformsId) {
        return next(ApiError.badRequest("Відсутні платформи"));
    }

    if (!minRequirement || !recRequirement) {
        return next(ApiError.badRequest("Відсутні системні вимоги"));
    }

    next();
};

module.exports = checkGameDataMiddleware;
