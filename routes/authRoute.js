import  express  from "express";
import {registerController,loginController,forgotPasswordController,testingController, profileUpdateController, userOrdersController, getAllOrdersController, orderStatusController} from "../controllers/authController.js"
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
//routes object
const router=express.Router()

//testing routs
router.get('/test',requireSignIn,isAdmin,testingController);

//PROTECTED ROUTE FOR USER
router.get('/user-auth',requireSignIn,(req,res)=>{
    res.status(200).send({ok:true});
});

//PROTECTED ROUTE FOR ADMIN
router.get('/admin-auth',requireSignIn,isAdmin,(req,res)=>{
    res.status(200).send({ok:true});
});


//FORGOT PASSWORD | METHOD POST
router.post('/forgot-password',forgotPasswordController);

//REGISTER | METHOD POST
router.post('/register',registerController);

//LOGIN  | METHOD POST
router.post('/login',loginController);
export default router

//UPDATE PROFILE
router.put('/profile',requireSignIn,profileUpdateController);

//GET USER ORDERS
router.get("/orders",requireSignIn,userOrdersController);

//GET ALL ORDERS In ADMIN
router.get("/all-orders",requireSignIn,isAdmin,getAllOrdersController);

//ORDER STATUS SET
router.put("/order-status/:orderId",requireSignIn,isAdmin,orderStatusController);