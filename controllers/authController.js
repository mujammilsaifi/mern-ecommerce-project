import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js"
import JWT from "jsonwebtoken"

//POST REGISTER USER
export const registerController= async (req,res)=>{
    try {
        const {name,email,password,phone,address,answer}=req.body;
        //validation
        if(!name){
            return res.send({message:"Name is required"})
        }
        if(!email){
            return res.send({message:"Email is required"})
        }
        if(!password){
            return res.send({message:"Password is required"})
        }
        if(!phone){
            return res.send({message:"Phone No. is required"})
        }
        if(!address){
            return res.send({message:"Address is required"})
        }
        if(!answer){
            return res.send({message:"Answer is required"})
        }

        //check user
        const exisitingUser=await userModel.findOne({email});
        //exisiting user
        if(exisitingUser){
            return res.status(200).send({
                success:false,
                message:"User Already Register please login"
            })
        }
        //register user
        const hashedPassword=await hashPassword(password)
        const user=await new userModel({name,email,phone,address,password:hashedPassword,answer}).save();
        res.status(201).send({
            success:true,
            message:"User Register SuccessFully",
            user
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Error in Registration",
            error
        })
    }
}


//POST LOGIN USER
export const loginController=async(req,res)=>{
    try {
        const {email,password}=req.body
        // validation
        if(!email || !password){
            return res.status(404).send({
                success:false,
                message:"Invalid Email or Password"
            })
        }
        //check user
        const user =await userModel.findOne({email});
        if(!user){
            return res.status(404).send({
                success:false,
                message:"email is not register"
            })
        }
        const match= await comparePassword(password,user.password);
        if(!match){
            return res.status(200).send({
                success:false,
                message:"invalid password"
            })
        }
        //token
        const token=await JWT.sign({_id:user._id},process.env.JWT_SECRET,{expiresIn:"7d"});
        res.status(200).send({
            success:true,
            message:"Login Successfully",
            user:{
                _id:user._id,
                name:user.name,
                email:user.email,
                phone:user.phone,
                address:user.address,
                role:user.role
            },
            token
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Error in Login",
            error
        })
    }
}

//FORGET PASSWORD
export const forgotPasswordController= async(req,res)=>{
    try {
        const {email,answer,newPassword}=req.body
        if(!email){
            res.status(400).send("Email is required")
        }
        if(!answer){
            res.status(400).send("Answer is required")
        }
        if(!newPassword){
            res.status(400).send("New Password is required")
        }
        //check
        const user=await userModel.findOne({email,answer});
        // validation
        if(!user){
            return res.status(404).send({
                success:false,
                message:"Wrong email and Answer"
            })
        }
        const newHashed= await hashPassword(newPassword);
        await userModel.findByIdAndUpdate(user._id,{password:newHashed});
        res.status(200).send({
            success:true,
            message:"Password Reset Successfully"
        });
    } catch (error) {
        console.log(error)
        return res.status(500).send({success:false,message:"Something went wrong forget password!"});
    }
}

// UPDATE FROFILE CONTROLLER
export const profileUpdateController=async(req,res)=>{
    try {
        const {name,email,phone,address,password}=req.body;
        const user=await userModel.findById(req.user._id);
        if(password && password.length<6){
            return res.json({message:"Password is required and 6 Character long"});
        }
        const hashPass=password? await hashPassword(password) : undefined;
        const updatedUser=await userModel.findByIdAndUpdate(req.user._id,{
            name:name || user.name,
            password:hashPass || user.password,
            phone:phone ||user.phone,
            address: address ||user.address
        },{new:true})
        res.status(200).send({success:true,message:"user updated successfully",updatedUser});
    } catch (error) {
        console.log(error)
        return res.status(500).send({success:false,message:"Something went wrong update profile!"});
    }
}
//GET USER ORDERS CONTROLLER
export const userOrdersController=async(req,res)=>{
    try {
    const orders=await orderModel.find({buyer:req.user._id}).populate("products","-photo").populate("buyer","name");
    res.json(orders);
    } catch (error) {
        console.log(error);
        return res.status(500).send({success:false,message:"Something went wrong while get user orders"});
    }
}
//GET ALL OREDERS
export const getAllOrdersController=async(req,res)=>{
    try {
        const allOrders=await orderModel.find({}).populate("products","-photo").populate("buyer","name").sort({createdAt:"-1"});
        res.json(allOrders); 
    } catch (error) {
        console.log(error);
        return res.status(500).send({success:false,message:"Something went wrong while All Orders in admin"});
    }
} 


//ORDER STATUS CONTROLLER
export const orderStatusController=async(req,res)=>{
    try {    
    const {status}=req.body
    const {orderId}=req.params
    const orders=await orderModel.findByIdAndUpdate(orderId,{status},{new:true});
    res.json(orders);
    } catch (error) {
    console.log(error);
    return res.status(500).send({success:false,message:"Something went wrong while order status update"});   
}

}
// testing purpose
export const testingController=(req,res)=>{
    res.send("protected routes");
}