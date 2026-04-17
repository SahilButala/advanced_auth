

const { StatusCodes } = require("http-status-codes")
const { UserRepo } = require("../repositories")
const AppError = require("../utils/AppError")
const catchAsynchandler = require("../utils/catch-async")
const paginationResponse = require("../utils/pagination-response")


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


const loginUser = async (data)=> {
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
    let mongo = {
        limit,
        skip
    }
    const { totalItems, row } = await userRepo.getAll(mongo)
    return new paginationResponse(Number(page), Math.ceil(totalItems / limit), row?.length, row)
}


const updateUserById = async (id, data) => {
    const user = await userRepo.updateById(id, data)
    return user
}

module.exports = {
    registerUser,
    getUsers,
    updateUserById,
    loginUser
}