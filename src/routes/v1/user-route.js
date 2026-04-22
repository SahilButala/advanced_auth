

const { userController } = require("../../controllers")
const { authMiddleWare } = require("../../middlewares")



const router = require("express").Router()

// normal auth
router.post("/register", userController.registeruser)
router.post("/login", userController.loginuser)

// email verification part
router.get("/verify-email", userController.verifyEmailhandler)
router.post("/refresh", userController.refreshTokenhandler)

// password 
router.post("/forget-password", userController.forgotPassword)
router.post("/reset-password", userController.resetPassword)


// google 
router.get("/google", userController.googleStarthandler)
router.get("/google/callback", userController.getGoggleAuthCallBackHandler) // as per frontend we will change redirect url
//google


// logout
router.post("/logout", userController.logout)

// for test rbac model
router.use(authMiddleWare.authMiddleware)
router.post("/2fa/setup" , userController.twoFactorHandler )
router.post("/2fa/verify" , userController.twoFactorVerify )
router.get("/all", authMiddleWare.adminAccessOnly, userController.getAllUsers)

module.exports = router
