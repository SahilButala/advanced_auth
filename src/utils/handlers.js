
const nodemailer = require("nodemailer")
const AppError = require("./AppError")
const { StatusCodes } = require("http-status-codes")
const bycrpt = require("bcrypt")
const jwt = require("jsonwebtoken")


const sendMail = async (to , subject  , html  )=>{

    if(!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS){
         throw new AppError("email service problem" , StatusCodes.INTERNAL_SERVER_ERROR)
    }   

    const host = process.env.SMTP_HOST
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const port = process.env.SMTP_PORT || "587"

    const form = process.env.EMAIL_FROM

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure : false,
        auth : {
             user,
             pass
        }
    })


    await transporter.sendMail({
        from : process.env.EMAIL_FROM || form,
        to,
        subject,
        html
    })

}

const checkPass = (password , haspass)=>{
    return bycrpt.compare(password , haspass)
}

const createRefreshToken = (userId , tokenVersion)=>{
   const payload = {id : userId , tokenVersion}

   return jwt.sign(payload , process.env.JWT_SECRET , {
    expiresIn : "30m"
   })
}

const verifiedRefrreshToken = (token)=>{
      return jwt.verify(token , process.env.JWT_SECRET)
}




module.exports = {sendMail , createRefreshToken , verifiedRefrreshToken}