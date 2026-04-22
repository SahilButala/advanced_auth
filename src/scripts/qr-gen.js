const qrcode = require("qrcode")
const AppError = require("../utils/AppError")
const { StatusCodes } = require("http-status-codes")


const otpAuthUrl = process.argv[2]

if (!otpAuthUrl) {
    throw new AppError("Pass Auth url is arrgument", StatusCodes.INTERNAL_SERVER_ERROR)
}

const main = async () => {
    await qrcode.toFile("totp.png", otpAuthUrl)
    console.log("Saved Qr Code Successfully...")
}

main().catch((err) => {
    console.log(err, "error during create qr code")
    process.exit(1)
})

