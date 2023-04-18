import slugify from "slugify";
import categoryModel from "../models/categoryModel.js";

// CREATE CATEGORY CONTROLLER
export const createCategoryController= async (req,res)=>{
    try {
        const {name}=req.body;
        if(!name){
            return res.status(401).send({message:"Name is Required"});
        }
        const exisitingCategory= await categoryModel.findOne({name});
        if(exisitingCategory){
            return res.status(200).send({
                success:false,
                message:"Category Already Exisits"
            })
        }
        const category= await new categoryModel({name,slug:slugify(name)}).save();
        res.status(201).send({
            success:true,
            message:"New Category Created Successfully",
            category
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"error in category"
        })
    }
};

// UPDATE CATEGORY CONTROLLER 
export const updateCategoryController= async (req,res)=>{
    try {
        const {name} =req.body;
        const category=await categoryModel.findByIdAndUpdate(req.params.cid,{name,slug:slugify(name)},{new:true});    
        res.status(201).send({
            success:true,
            message:"Category updated Successfully",
            category
        })  
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error, While in category Updating"
        })
    }
}

//GET ALL CATEGORY CONTROLLER
export const allCategoryController= async (req,res)=>{
    try {
        const category=await categoryModel.find({});
        res.status(201).send({
            success:true,
            message:"All Category Feched Successfully",
            category
        }) 
        
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error, Get All Category "
        })
    }
}
//GET SINGLE CATEGORY
export const singleCategorycontroller=async (req,res)=>{
    try {
        const category= await categoryModel.findOne({slug:req.params.slug});
        res.status(201).send({
            success:true,
            message:"Get Single Category Successfully",
            category
        }) 
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error, Get Single Category "
        })
        
    }
}

//DELETE CATEGORY CONTROLLER
export const deleteCategoryController=async (req,res)=>{
    try {
        const {id}=req.params
        await categoryModel.findByIdAndDelete(id);
        res.status(201).send({
            success:true,
            message:"Delelte Category Successfully",
        }) 
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"error in category delete"
        })
    }
}