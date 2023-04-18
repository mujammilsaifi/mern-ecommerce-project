import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import { braintreePaymentController, braintreeTokenController, createProductController, deleteProductController, getProductByCategoryController, getProductController, getProductPhotoController, getSingleProductController, productCountController, productFilterController, productListController, relatedProductController, searchProductController, updateProductController } from "../controllers/productController.js";
import formidable from "express-formidable";//USE FOR PHOTO UPLOAD
const router=express.Router();

//CREATE PRODUCT
router.post('/create-product',requireSignIn,isAdmin,formidable(),createProductController);

//GET ALL PRODUCTS
router.get('/get-product',getProductController);

//GET SINGLE PRODUCTS
router.get('/get-product/:slug',getSingleProductController);

//GET PHOTO OF PRODUCTS
router.get('/product-photo/:pid',getProductPhotoController);

//DELETE PRODUCT
router.delete('/delete-product/:pid',deleteProductController);

//UPDATE PRODUCT
router.put('/update-product/:pid',requireSignIn,isAdmin,formidable(),updateProductController);

//PRODUCT FILTER
router.post('/product-filter',productFilterController);

//PRODUCT COUNT
router.get('/product-count',productCountController);

//PRODUCT LIST
router.get('/product-list/:page',productListController);

//PRODUCT LIST
router.get('/search/:keyword',searchProductController);

//RELATED PRODUCT 
router.get('/related-product/:pid/:cid',relatedProductController);

//GET PRODUCT BY CATEGORY
router.get("/product-by-category/:slug",getProductByCategoryController);

//PAYMENT ROUTES
// token
router.get("/braintree/token",braintreeTokenController);
//payment
router.post("/braintree/payment",requireSignIn,braintreePaymentController);
export default router;