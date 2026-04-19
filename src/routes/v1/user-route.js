

const {userController} = require("../../controllers")



const router = require("express").Router()

router.post("/register" , userController.registeruser)
router.post("/login" , userController.loginuser)


router.get("/verify-email" , userController.verifyEmailhandler)
router.post("/refresh" , userController.refreshTokenhandler)

router.post("/forget-password" , userController.forgotPassword)
router.post("/reset-password" , userController.resetPassword)



router.post("/logout" , userController.logout)


router.get("/all" , userController.getAllUsers)
router.patch("/:id" , userController.updateById)

module.exports = router
