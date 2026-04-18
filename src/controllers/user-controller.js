

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

    const { user, token, refreshToken } = await UserService.loginUser({
        email: value.email,
        password: value.password
    })

    const isProd = process.env.NODE_ENV === "production"

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 1000
    })
    return res.status(StatusCodes.OK).json(new ApiRes(StatusCodes.OK, true, "User Login Successfully....", { user, accessToken: token }));

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


// to email verification after register
exports.verifyEmailhandler = catchAsync(async (req, res) => {
    const token = req?.query.token

    const user = await UserService.verifyEmailhandler(token)
    return res.status(StatusCodes.OK).json(new ApiRes(StatusCodes.OK, true, "Email Verified Successfully..", user))

})

exports.refreshTokenhandler = catchAsync(async (req, res) => {
    const token = req.cookies?.refreshToken;

    const { user, accessToken, refreshToken } = await UserService.refreshTokenhandler(token)

    const isProd = process.env.NODE_ENV === "production"

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 1000
    })

    res.status(StatusCodes.OK).json(new ApiRes(StatusCodes.OK, true, "Token is refreshed", { user, accessToken }))

})

exports.logout = catchAsync((req, res) => {
    res.clearCookie("refreshToken", { path: "/" })
    return res.status(StatusCodes.OK).json(new ApiRes(StatusCodes.OK, true, "Logout Successfully..", null))
})

