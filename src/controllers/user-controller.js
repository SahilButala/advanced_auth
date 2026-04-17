

const { UserService, getUsersService } = require('../services')
const { StatusCodes } = require("http-status-codes");
const ApiRes = require('../utils/api-response');
const catchAsync = require('../utils/catch-async');
const { authValidators } = require("../validations")

const AppError = require('../utils/AppError');
const { errorjoiFromat } = require('../utils/clean-format');

exports.registeruser = catchAsync(async (req, res, next) => {
    const { error, value } = authValidators.validRegister(req?.body)
    if (error) {
        const message = errorjoiFromat(error)
        throw new AppError(message, StatusCodes.BAD_REQUEST)
    }
    const user = await UserService.registerUser({
        name: value.name,
        email: value.email,
        password: value.password
    })
    return res.status(StatusCodes.CREATED).json(new ApiRes(StatusCodes.CREATED, true, "User Created Successfully....", user));

})

exports.loginuser = catchAsync(async (req, res, next) => {
    const { error, value } = authValidators.validLogin(req?.body)
    if (error) {
        const message = errorjoiFromat(error)
        throw new AppError(message, StatusCodes.BAD_REQUEST)
    }

    const user = await UserService.loginUser({
        email: value.email,
        password: value.password
    })
    return res.status(StatusCodes.OK).json(new ApiRes(StatusCodes.OK, true, "User Login Successfully....", user));

})

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await UserService.getUsers({
        page: req?.query.page,
        limit: req?.query.limit
    })
    return res.status(StatusCodes.OK).json(new ApiRes(200, true, "Users", users))
})


exports.updateById = catchAsync(async (req, res, next) => {
    const user = await UserService.updateUserById(req?.params?.id, req?.body)

    return res.status(StatusCodes.OK).json(new ApiRes(200, true, "user updated successfully..", user))
})

