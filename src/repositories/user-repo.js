

const CrudRepository = require("./crud-repo")
const { userModel } = require("../models")
const AppError = require("../utils/AppError")
const { StatusCodes } = require("http-status-codes")
const bycrpt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { sendMail, createRefreshToken, verifiedRefrreshToken } = require("../utils/handlers")
const ApiRes = require("../utils/api-response")


const getAppUrl = () => {
    return process.env.APP_URL || `http://localhost:${process.env.PORT}`
}


const generateAccessValidToken = (id, email, role = null , tokenVersion) => {
    return jwt.sign({ id, email, role , tokenVersion }, process.env.JWT_SECRET, {
        expiresIn: "30m"
    })
}


class UserRepo extends CrudRepository {
    constructor() {
        super(userModel)
    }

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


    async loginUser(data) {
        const { email, password } = data

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

        if (!user?.isEmailVerified) {
            throw new AppError("please verify email before login", StatusCodes.FORBIDDEN)
        }

        const token = generateAccessValidToken(user?._id, user?.email , user?.role , user?.tokenVersion )

        const refreshToken = createRefreshToken(user?._id , user?.tokenVersion)

        const userRes = user?.toObject() ? user?.toObject() : { ...user }
        delete userRes.password

        return {
            user: userRes,
            token,
            refreshToken
        }

    }   


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


    async refreshToken(token){
          
        const payload = verifiedRefrreshToken(token)

        console.log(payload , "payload")

        const user = await userModel.findById(payload?.id)

        if(!user){
             throw new AppError("invalid user" , StatusCodes.BAD_REQUEST)
        }

        if(user?.tokenVersion !== payload?.tokenVersion){
            throw new AppError("invalid token validated" , StatusCodes.UNAUTHORIZED)
        }

        const newAccessToken = generateAccessValidToken(user?._id , user?.email , user?.role , user?.tokenVersion)

        const refreshToken = createRefreshToken(user?._id , user?.tokenVersion)


        const userRes = user?.toObject() ? user?.toObject() : { ...user }
        delete userRes?.password

        return {
             user : userRes,
             accessToken : newAccessToken,
             refreshToken
        }




    }

}

module.exports = UserRepo