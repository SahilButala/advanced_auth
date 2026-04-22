

const { UserService, getUsersService } = require('../services')
const { StatusCodes } = require("http-status-codes");
const ApiRes = require('../utils/api-response');
const catchAsync = require('../utils/catch-async');
const { authValidators } = require("../validations")
const { OAuth2Client } = require("google-auth-library")


const AppError = require('../utils/AppError');
const { errorjoiFromat } = require('../utils/clean-format');



const getGoogleClient = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUrl = process.env.GOOGLE_REDIRECT_URI


    if (!clientId || !clientSecret) {
        throw new AppError("google client id or secret both missing", StatusCodes.INTERNAL_SERVER_ERROR)
    }

    return new OAuth2Client({
        client_id: clientId,
        client_secret: clientSecret,
        redirectUri: redirectUrl
    })
}


// ───────────────────────────────────── register user ──────────────────────────────────────────
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
// ──────────────────────────────────── register user ───────────────────────────────────────────

// ───────────────────────────────────── login user ──────────────────────────────────────────
exports.loginuser = catchAsync(async (req, res, next) => {
    const { error, value } = authValidators.validLogin(req?.body)
    if (error) {
        const message = errorjoiFromat(error)
        throw new AppError(message, StatusCodes.BAD_REQUEST)
    }

    const { user, token, refreshToken } = await UserService.loginUser({
        email: value.email,
        password: value.password,
        twoFactorCode: value?.twoFactorCode || null
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
// ──────────────────────────────────── login user ───────────────────────────────────────────

// ───────────────────────────────────── get users ──────────────────────────────────────────
exports.getAllUsers = catchAsync(async (req, res, next) => {
    const { id, role } = req?.user
    const users = await UserService.getUsers({
        query: req?.query,
        data: {
            role,
            id
        }
    })
    return res.status(StatusCodes.OK).json(new ApiRes(200, true, "Users", users))
})
// ──────────────────────────────────── get users ───────────────────────────────────────────


// ───────────────────────────────────── update user ──────────────────────────────────────────
exports.updateById = catchAsync(async (req, res, next) => {
    const user = await UserService.updateUserById(req?.params?.id, req?.body)

    return res.status(StatusCodes.OK).json(new ApiRes(200, true, "user updated successfully..", user))
})
// ──────────────────────────────────── update user ───────────────────────────────────────────


// ───────────────────────────────────── verify email handler ──────────────────────────────────────────
exports.verifyEmailhandler = catchAsync(async (req, res) => {
    const token = req?.query.token

    const user = await UserService.verifyEmailhandler(token)
    return res.status(StatusCodes.OK).json(new ApiRes(StatusCodes.OK, true, "Email Verified Successfully..", user))

})
// ──────────────────────────────────── verify email handler ───────────────────────────────────────────

// ───────────────────────────────────── refreshToken ──────────────────────────────────────────
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
// ──────────────────────────────────── refreshToken ───────────────────────────────────────────

// ───────────────────────────────────── logout  ──────────────────────────────────────────
exports.logout = catchAsync((req, res) => {
    res.clearCookie("refreshToken", { path: "/" })
    return res.status(StatusCodes.OK).json(new ApiRes(StatusCodes.OK, true, "Logout Successfully..", null))
})
// ──────────────────────────────────── logout  ───────────────────────────────────────────

// ───────────────────────────────────── forgetpassword ──────────────────────────────────────────
exports.forgotPassword = catchAsync(async (req, res) => {
    const { email } = req?.body
    const password = await UserService.forgotPassword(email)
    res.status(StatusCodes.OK).json(new ApiRes(StatusCodes.OK, true, "if an account with this email exsist the we will send you reset link to this email"))

})
// ──────────────────────────────────── forgetpassword ───────────────────────────────────────────

// ───────────────────────────────────── reset password ──────────────────────────────────────────
exports.resetPassword = catchAsync(async (req, res) => {
    const { token, password } = req?.body

    const resetpassword = await UserService.resetPassword(token, password)
    res.status(StatusCodes.OK).json(new ApiRes(StatusCodes.OK, true, "Password Changed Successfully.."))
})
// ──────────────────────────────────── reset password ───────────────────────────────────────────

// ───────────────────────────────────── google authstarthandler ──────────────────────────────────────────
exports.googleStarthandler = catchAsync((req, res, next) => {
    const client = getGoogleClient() // getting client form credentials


    // genrating google auth page url
    const url = client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: ["openid", "email", "profile"] // after login we want perticular info from google like profile details and all
    })

    return res.redirect(url)
})
// ──────────────────────────────────── google authstarthandler ───────────────────────────────────────────


// ───────────────────────────────────── google auth call back handler ──────────────────────────────────────────

// after google page sign in


exports.getGoggleAuthCallBackHandler = catchAsync(async (req, res) => {
    const code = req?.query.code

    if (!code) {
        throw new AppError("missing code in callback", StatusCodes.BAD_GATEWAY)
    }

    const client = getGoogleClient()
    const { tokens } = await client.getToken(code)
    console.log("tokens", tokens)
    console.log("code", code)


    if (!tokens?.id_token) {
        throw new AppError("No google id token is present ", StatusCodes.INTERNAL_SERVER_ERROR)
    }


    // verify id token and read the user info from it
    const ticket = await client.verifyIdToken({
        idToken: tokens?.id_token,
        audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()

    const email = payload.email

    const emailVerified = payload?.email_verified

    if (!email || !emailVerified) {
        throw new AppError("google email account is not verified")
    }


    const normalizedEmail = email?.toLowerCase().trim()
    const name = payload.name;

    const { user, acceessToken, refreshToken } = await UserService.createUserThroughGoogleAuth(email, name)


    const isProd = process.env.NODE_ENV === "production"

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 1000
    })

    res.status(StatusCodes.OK).json(new ApiRes(StatusCodes.OK, true, "Google Login Successfully..", {
        user,
        accessToken: acceessToken,
    }))


})

// ──────────────────────────────────── google auth call back handler ───────────────────────────────────────────


// ───────────────────────────────────── two factor handler ──────────────────────────────────────────
exports.twoFactorHandler = catchAsync(async (req, res, next) => {
    const user = req?.user

    const { secret, otpAuthUrl } = await UserService.twofactor(user)
    res.status(StatusCodes.OK).json(new ApiRes(StatusCodes.OK, true, "2FA setup is done", {
        otpAuthUrl, secret
    }))
})
// ──────────────────────────────────── two factor handler ───────────────────────────────────────────


// ───────────────────────────────────── two factor verify  ──────────────────────────────────────────
exports.twoFactorVerify = catchAsync(async (req, res, next) => {
    const user = req?.user
    const { code } = req?.body

    const users = await UserService.twoFactorVerify(code, user)
    res.status(StatusCodes.OK).json(new ApiRes(StatusCodes.OK, true, "2FA verify is done", users))
})
// ──────────────────────────────────── two factor verify  ───────────────────────────────────────────


