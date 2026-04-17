
const nodemailer = require("nodemailer")
const AppError = require("./AppError")
const { StatusCodes } = require("http-status-codes")


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
        from,
        to,
        subject,
        html
    })

}



module.exports = {sendMail}