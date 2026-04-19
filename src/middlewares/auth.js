const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catch-async");
const jwt = require("jsonwebtoken")

const { StatusCodes } = require("http-status-codes");
const { userModel } = require("../models");


const authMiddleware = catchAsync(async (req, res, next) => {
    const authHeader = req?.headers?.authorization

    if (!authHeader) {
        throw new AppError("header is missing or token is invalid", StatusCodes.BAD_REQUEST)
    }

    const token = authHeader.split(" ")[1]


    const payload = jwt.verify(token, process.env.JWT_SECRET)

    const user = await userModel.findById(payload?.id)


    if (!user) {
        throw new AppError("User not found ", StatusCodes.INTERNAL_SERVER_ERROR)
    }

    if (user?.tokenVersion !== payload?.tokenVersion) {
        throw new AppError("token invalid unauthorized user", StatusCodes.UNAUTHORIZED)
    }

    req.user = {
        id: payload?.id,
        email: payload?.email,
        role: payload?.role
    }

    next()

})


const adminAccessOnly = catchAsync(async (req , res , next)=>{
     const {id , role} = req?.user

     console.log(role , "role")

     if(!id || !role){
         throw new AppError("Invalid Token" , StatusCodes.UNAUTHORIZED)
     }

     if(role !== "admin"){
         throw new AppError("you can not access this perticular feature it can only accessible for admin" , StatusCodes.FORBIDDEN)
     }

     next()


})


module.exports = {
    authMiddleware,
    adminAccessOnly
}