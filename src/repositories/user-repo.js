

const CrudRepository = require("./crud-repo")
const { userModel } = require("../models")
const AppError = require("../utils/AppError")
const { StatusCodes } = require("http-status-codes")
const bycrpt = require("bcrypt")
const jwt = require("jsonwebtoken")


const generateValidToken = (id, email) => {
    return jwt.sign({ id, email }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    })
}


class UserRepo extends CrudRepository {
    constructor() {
        super(userModel)
    }

    async registerUser(data) {
        const { email, password } = data

        const user = await this.findByQuery({
            email : email
        })

        if (user) {
            throw new AppError("User already exsist please try another email", StatusCodes.CONFLICT)
        }

        const hasPassword = await bycrpt.hash(password, 10)


        return await userModel.create({
            ...data,
            password: hasPassword
        })
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

        const token = generateValidToken(user?._id, user?.email)

        const userRes = user?.toObject() ? user?.toObject() : { ...user }
        delete userRes.password

        return {
            user: userRes,
            token
        }

    }

}

module.exports = UserRepo