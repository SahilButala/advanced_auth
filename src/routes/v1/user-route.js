

const {userController} = require("../../controllers")



const router = require("express").Router()

router.post("/register" , userController.registeruser)
router.post("/login" , userController.loginuser)
router.get("/all" , userController.getAllUsers)
router.patch("/:id" , userController.updateById)

module.exports = router
