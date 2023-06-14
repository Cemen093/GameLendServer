const { MinRequirement, RecRequirement } = require("../models/models");
const ApiError = require("../error/ApiError");

async function checkRequirementMiddleware(req, res, next) {
    const { minRequirement, recRequirement } = req.body;

    if (!minRequirement || !recRequirement) {
        return next(ApiError.badRequest("Відсутні системні вимоги"));
    }
    next();
}

module.exports = checkRequirementMiddleware;
