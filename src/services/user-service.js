

const { StatusCodes } = require("http-status-codes")
const { UserRepo } = require("../repositories")
const AppError = require("../utils/AppError")
const catchAsynchandler = require("../utils/catch-async")
const paginationResponse = require("../utils/pagination-response")
const jwt = require("jsonwebtoken")


const userRepo = new UserRepo()


const registerUser = async (data) => {
    const { name, password, email } = data
    if (!name) {
        throw new AppError("name is required for regitser user", 404)
    }
    if (!password) {
        throw new AppError("passowrd is required for regitser user", 404)
    }
    if (!email) {
        throw new AppError("email is required for regitser user", 404)
    }
    const user = await userRepo.registerUser(data)
    return user
}


const loginUser = async (data) => {
    const { password, email } = data

    if (!password) {
        throw new AppError("passowrd is required  to login", StatusCodes.BAD_REQUEST)
    }
    if (!email) {
        throw new AppError("email is required  to login", StatusCodes.BAD_REQUEST)
    }

    const user = await userRepo.loginUser(data)
    return user

}


const getUsers = async (data) => {
    const { page = 1, limit = 10 } = data
    const skip = (parseInt(page) - 1) * limit
    // let mongo = {
    //     limit,
    //     skip
    // }
    const { totalItems, row } = await userRepo.getAll()
    return new paginationResponse(Number(page), Math.ceil(totalItems / limit), row?.length, row)
}


const updateUserById = async (id, data) => {
    const user = await userRepo.updateById(id, data)
    return user
}


const verifyEmailhandler = async (token) => {
    if (!token) {
        throw new AppError("verified token is missing")
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET)

    const user = await userRepo.verifyEmail(payload)
    return user
}

const refreshTokenhandler = async (token) => {
    if (!token) {
        throw new AppError("invalid token or missing token", StatusCodes.UNAUTHORIZED)
    }

    const user = await userRepo.refreshToken(token)
    return user

}

const forgotPassword = async (email)=>{
     if(!email){
         throw new AppError("email is required" , StatusCodes.BAD_REQUEST)
     }

     const normalizedEmail = email.toLowerCase().trim()

     const passowrd = await userRepo.forgotPassword(normalizedEmail)
     return passowrd
}


const resetPassword = async(token , passowrd)=>{
     if(!token){
         throw new AppError("reset token is missing " , StatusCodes.BAD_REQUEST)
     }

     if(!passowrd || passowrd.length < 6 ){
            throw new AppError("password must be 6 letter long" , StatusCodes.BAD_REQUEST)
     }
    
     const resetpassword = await userRepo.resetPassword(token , passowrd)
     return resetpassword
}

module.exports = {
    registerUser,
    getUsers,
    updateUserById,
    loginUser,
    verifyEmailhandler,
    refreshTokenhandler,
    forgotPassword,
    resetPassword
}