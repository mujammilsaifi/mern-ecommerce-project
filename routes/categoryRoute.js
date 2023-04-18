import  express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import { allCategoryController, createCategoryController, deleteCategoryController, singleCategorycontroller, updateCategoryController } from "../controllers/categoryController.js";

const router=express.Router();

//CREATE CATEGORY
router.post('/create-category',requireSignIn,isAdmin,createCategoryController);

//UPDATE CATEGORY
router.put('/update-category/:cid',requireSignIn,isAdmin,updateCategoryController);

//GET ALL CATEGORY
router.get('/get-category',allCategoryController);

//GET SINGLE CATEGORY
router.get('/single-category/:slug',singleCategorycontroller);

// DELETE CATEGORY
router.delete('/delete-category/:id',requireSignIn,isAdmin,deleteCategoryController);
export default router