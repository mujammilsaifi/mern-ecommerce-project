import slugify from "slugify";
import productModel from "../models/productModel.js";
import fs from 'fs'
import categoryModel from "../models/categoryModel.js";
import braintree from "braintree";
import orderModel from "../models/orderModel.js";
import dotenv from 'dotenv'
dotenv.config();
//PAYMENT GATWAY
var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTTREE_PRIVATE_KEY,
  });

export const braintreeTokenController= async(req,res)=>{
    try {     
        gateway.clientToken.generate({},function(error,response){
            if(error){
                res.send(error);
            }else{
                res.send(response);
            }
        });
    } catch (error) {
        console.log(error);
    }
}

export const braintreePaymentController=async(req,res)=>{
    try {
        const {cart,nonce}=req.body;
        let total=0;
        cart?.map((i)=>{total=total+i.price});
        let newTransaction=gateway.transaction.sale({
            amount:total,
            paymentMethodNonce:nonce,
            options:{
                submitForSettlement:true
            }
        },
        function(error,result){
            if(result){
                const order=new orderModel({
                    products:cart,
                    payment:result,
                    buyer:req.user._id
                }).save()
                res.json({ok:true})
            }else{
                res.status(500).send({error});
            }
        }
        )
    } catch (error) {
        console.log(error);
    }
}





//CREATE PRODUCT CONTROLLER
export const createProductController=async (req,res)=>{
    try {
        const {name,slug,description,price,category,quantity,shipping}=req.fields;
        const {photo}=req.files;
        
        switch(true){
            case !name:
                return res.status(500).send({message:'Name is reuired'});
            case !description:
                return res.status(500).send({message:'Description is reuired'});
            case !price:
                return res.status(500).send({message:'Price is reuired'});
            case !category:
                return res.status(500).send({message:'Category is reuired'});
            case !quantity:
                return res.status(500).send({message:'Quantity is reuired'});
            case photo && photo.size>1000000:
                return res.status(500).send({message:'Photo is reuired and Photo Should be lessthan 1MB'});
        }
        const products=new productModel({...req.fields,slug:slugify(name)});
        if(photo){
            products.photo.data=fs.readFileSync(photo.path);
            products.photo.contentType=photo.type
        }
        await products.save();
        res.status(201).send({
            success:true,
            message:"Product Created SuccessFully",
            products
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in creating Product" 
        })
    }
};

//GET ALL PRODUCT CONTROLLER
export const getProductController=async(req,res)=>{
    try {
        const products= await productModel.find({}).populate("category").select("-photo").limit(12).sort({createdAt:-1});
        res.status(201).send({
            success:true,
            totalProduct:products.length,
            message:"All product fetched Successfully",
            products,
            
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:"Error in Geting Products" 
        })
    }
}

//GET SINGLE PRODUCT CONTROLLER
export const getSingleProductController=async(req,res)=>{
    try {
        const product= await productModel.findOne({slug:req.params.slug}).populate("category").select("-photo")
        res.status(200).send({
            success:true,
            message:"Product fetched Successfully",
            product,
            
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:"Error in Geting Single  Product" 
        })
    }
}

//GET PHOTO OF PRODUCT CONTROLLER
export const getProductPhotoController=async(req,res)=>{
    try {
        const product=await productModel.findById(req.params.pid).select("photo");
        if(product.photo.data){
            res.set("Content-type",product.photo.contentType);
            return res.status(200).send(product.photo.data);
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:"Error in Geting Photo of Product" 
        })
    }
}

//DELETE PRODUCT CONTROLLER
export const deleteProductController= async(req,res)=>{
    try {
        await productModel.findByIdAndDelete(req.params.pid).select("-photo");
        res.status(200).send({
            success:true,
            message:"Product Deleted Successfully",            
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:"error while product deleting" 
        })
    }
}

//UPDATE PRODUCT CONTROLLER
export const updateProductController=async (req,res)=>{
    try {
        const {name,slug,description,price,category,quantity,shipping}=req.fields;
        const {photo}=req.files;
        
       
        const products=await productModel.findByIdAndUpdate(req.params.pid,{...req.fields,slug:slugify(name)},{new:true});
        if(photo){
            products.photo.data=fs.readFileSync(photo.path);
            products.photo.contentType=photo.type
        }
        await products.save();
        res.status(200).send({
            success:true,
            message:"Product Updated SuccessFully",
            products
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in updating Product" 
        })
    }
};

//PRODUCT FILTER CONTROLLER
export const productFilterController=async (req,res)=>{
    try {
        const {checked,radio}=req.body;
        let args={};
        if(checked.length>0) args.category=checked;
        if(radio.length) args.price={$gte:radio[0],$lte:radio[1] };
        const products=await productModel.find(args);
        res.status(200).send({
            success:true,
            message:"Product Filtered SuccessFully",
            products
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in Filtering Product" 
        })
    }
}

//PORDUCT COUNT CONTROLLER
export const productCountController= async(req,res)=>{
    try {
        const total=await productModel.find({}).estimatedDocumentCount();
        res.status(200).send({
            success:true,
            message:"Product Counted SuccessFully",
           total
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in count Product" 
        })
    }
}

//PRODUCT LIST PER PAGE CONROLLER
export const productListController= async(req,res)=>{
    try {
    let perPage=3;
    const page=req.params.page?req.params.page:1;
    const products=await productModel.find({}).select("-photo").skip((page-1)*perPage).limit(perPage).sort({createdAt:-1});
    res.status(200).send({
        success:true,
        message:"Product Listed SuccessFully",
        products
    });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in List Product" 
        })   
    }
}

//SEARCH PRODUCT CONTROLLER
export const searchProductController=async(req,res)=>{
    try {
        const {keyword}=req.params
        const results=await productModel.find({
            $or:[
                {name:{$regex:keyword,$options:"i"}},
                {description:{$regex:keyword,$options:"i"}}
            ]
        }).select("-photo");
        res.json(results);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in Search Product" 
        })   
    }
    
}

//RELATED PRODUCT CONTROLLER
export const  relatedProductController= async(req,res)=>{
    try {
       const {pid,cid}=req.params;
       const products=await productModel.find({
        category:cid,_id:{$ne:pid}
       }).select("-photo").limit(3).populate("category")
       res.status(200).send({
        success:true,
        message:"related product successfully",
        products
       })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in Related Product" 
        })   
    }
}

//GET PRODUCT BY CATEGORY
export const getProductByCategoryController=async(req,res)=>{
    try {
        const category=await categoryModel.findOne({slug:req.params.slug});
        const products=await productModel.find({category}).populate("category");
        res.status(200).send({
            success:true,
            message:"products by category successfully",
            category,
            products
           })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error, while geting product by category" 
        })   
    }
}