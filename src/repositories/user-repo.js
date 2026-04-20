

const CrudRepository = require("./crud-repo")
const { userModel } = require("../models")
const AppError = require("../utils/AppError")
const { StatusCodes } = require("http-status-codes")
const bycrpt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { sendMail, createRefreshToken, verifiedRefrreshToken } = require("../utils/handlers")
const ApiRes = require("../utils/api-response")
const crypto = require("crypto")

const otblib = require("otplib")
const paginationResponse = require("../utils/pagination-response")



const getAppUrl = () => {
    return process.env.APP_URL || `http://localhost:${process.env.PORT}`
}




const generateAccessValidToken = (id, email, role = null, tokenVersion) => {
    return jwt.sign({ id, email, role, tokenVersion }, process.env.JWT_SECRET, {
        expiresIn: "30m"
    })
}


class UserRepo extends CrudRepository {
    constructor() {
        super(userModel)
    }

    // ─── register user ───
    async registerUser(data) {
        const { email, password } = data

        const user = await this.findByQuery({
            email: email
        })

        if (user) {
            throw new AppError("User already exsist please try another email", StatusCodes.CONFLICT)
        }

        const hasPassword = await bycrpt.hash(password, 10)


        const newUser = await userModel.create({
            ...data,
            password: hasPassword,
            twoFactorEnabled: false,
            twofactorEnabled: false,
            role: "user",
            isEmailVerified: false,

        })

        // email verification part

        const verifyToken = jwt.sign({
            id: newUser?._id,
        },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        )


        const verifyUrl = `${getAppUrl()}/api/v1/auth/verify-email?token=${verifyToken}`



        await sendMail(newUser?.email, "Verify your email", `<p>please verify your email by clicking this link :</p>
            <p><a  href="${verifyUrl}">${verifyUrl}</a></p>
            ` )


        return newUser

    }
    // ─── register user ───

    // ─── login email ───
    async loginUser(data) {
        const { email, password, twoFactorCode } = data

        const user = await this.findByQuery({
            email
        })

        if (!user) {
            throw new AppError("email is not found please try again", StatusCodes.BAD_REQUEST)
        }

        const isValidPass = await bycrpt.compare(password, user?.password)

        if (!isValidPass) {
            throw new AppError("password is not correct please type correct password", StatusCodes.BAD_REQUEST)
        }

        // if (!user?.isEmailVerified) {
        //     throw new AppError("please verify email before login", StatusCodes.FORBIDDEN)
        // }

        // // two factor configuration

        // if(user?.twoFactorEnabled){
        //     if(!twoFactorCode || typeof  twoFactorCode !== "string"){
        //          throw new AppError("Two Factor code is missig " , StatusCodes.UNAUTHORIZED)
        //     }
        // }

        // if(!user?.twofactorSecret){
        //       throw new AppError("Two factor missconfigured this account" , StatusCodes.UNAUTHORIZED)
        // }

        // verify the code using otpLib




        const token = generateAccessValidToken(user?._id, user?.email, user?.role, user?.tokenVersion)

        const refreshToken = createRefreshToken(user?._id, user?.tokenVersion)

        const userRes = user?.toObject() ? user?.toObject() : { ...user }
        delete userRes.password

        return {
            user: userRes,
            token,
            refreshToken
        }



    }
    // ─── login email ───

    // ─── get all users ───
    async getAllUsers(filter, data, limit = 1, page = 1) {
        const total = await userModel.countDocuments(filter)
        const skip = ((parseInt(page) - 1) * limit)

        const user = await userModel.find(filter).limit(limit).skip(skip)
        return new paginationResponse(Number(page), Math.ceil(total / limit), total, user)
    }
    // ─── get all users ───

    // ─── verify email ───
    async verifyEmail(token) {
        const user = await userModel.findById(token?.id)

        if (!user) {
            throw new AppError("user not found", StatusCodes.BAD_REQUEST)
        }

        if (user?.isEmailVerified) {
            return new ApiRes(StatusCodes.OK, true, "email is already verified")
        }

        user.isEmailVerified = true
        await user.save()

        return user
    }
    // ─── verify email ───

    // ─── refresh token ───
    async refreshToken(token) {

        const payload = verifiedRefrreshToken(token)

        console.log(payload, "payload")

        const user = await userModel.findById(payload?.id)

        if (!user) {
            throw new AppError("invalid user", StatusCodes.BAD_REQUEST)
        }

        if (user?.tokenVersion !== payload?.tokenVersion) {
            throw new AppError("invalid token validated", StatusCodes.UNAUTHORIZED)
        }

        const newAccessToken = generateAccessValidToken(user?._id, user?.email, user?.role, user?.tokenVersion)

        const refreshToken = createRefreshToken(user?._id, user?.tokenVersion)


        const userRes = user?.toObject() ? user?.toObject() : { ...user }
        delete userRes?.password

        return {
            user: userRes,
            accessToken: newAccessToken,
            refreshToken
        }
    }
    // ─── refresh token ───


    // ─── forgetPassword ───
    async forgotPassword(email) {
        const user = await this.findByQuery({
            email
        })

        if (!user) {
            throw new AppError("If an account with this email exsist , we will send you reset link", StatusCodes.OK)
        }

        const rawToken = crypto.randomBytes(32).toString("hex")

        const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex")

        user.resetPasswordToken = tokenHash
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000)// imp expire in 15min

        await user.save()

        const resetUrl = `${getAppUrl()}/api/v1/auth/reset-password?token=${rawToken}`

        await sendMail(user?.email, "Reset Password", `<p>You Reseted password reset . Click on the link below to reset password</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            `)

        return
    }
    // ─── forgetPassword ───

    // ─── RESET PASSWORD ───
    async resetPassword(token, passowrd) {
        console.log(token, passowrd, "reset password repo getting credentials")
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

        const user = await this.findByQuery({
            resetPasswordToken: tokenHash,
            resetPasswordExpires: { $gt: new Date() }
        })

        console.log(user, "user from db reset password")

        if (!user) {
            throw new AppError("invalid or expired token", StatusCodes.BAD_REQUEST)
        }

        const newPass = await bycrpt.hash(passowrd, 10)
        user.password = newPass

        user.resetPasswordToken = undefined

        user.resetPasswordExpires = undefined
        user.tokenVersion = user?.tokenVersion + 1

        await user?.save()

        return
    }
    // ─── RESET PASSWORD ───


    //  google auth user

    async createUserThroughGoogleAuth(email, name) {
        let user = await this.findByQuery({
            email
        })

        const cryppassowrd = crypto.randomBytes(16).toString("hex")
        const hashPassword = await bycrpt.hash(cryppassowrd, 10)
        console.log(hashPassword, "hash password")

        if (!user) {
            console.log("if statement executed")
            user = await userModel.create({
                email,
                name,
                password: hashPassword,
                role: "user",
                isEmailVerified: true,
                twofactorEnabled: false

            })
        } else {
            console.log("else statement executed")
            if (!user?.isEmailVerified) {
                user.isEmailVerified = true;
                await user?.save()
            }
        }
        const acceessToken = generateAccessValidToken(user?._id, user?.email, user?.role, user?.tokenVersion)

        const refreshToken = createRefreshToken(user?._id, user?.tokenVersion)


        return {
            acceessToken,
            refreshToken,
            user
        }
    }
    //  google auth user



}

module.exports = UserRepo