import express from 'express'
import colors from 'colors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoute.js'
import categoryRoutes from './routes/categoryRoute.js'
import productRoutes from './routes/productRoute.js'
import cors from 'cors'
import path from 'path'
// import {fileURLToPath} from 'url'
// configure dotenv 
dotenv.config()

//rest object
const app=express();

//Database config
connectDB()
// const __filename=fileURLToPath(import.meta.url);
// const __dirname=path.dirname(__filename);


//middleware
app.use(cors());
app.use(express.json())
app.use(morgan('dev'))
app.use(express.static(path.join(__dirname,'./client/build')));

//routes
app.use('/api/v1/product',productRoutes);
app.use('/api/v1/category',categoryRoutes);
app.use('/api/v1/auth',authRoutes);

//rest api
// app.get("/",(req,res)=>{
//     res.send("<h1> Wel come to MARN Ecommerce App</h1>")
// })
app.use('*',function(req,res){
    res.sendFile(path.join(__dirname,'./client/build/index.html'))
})

//PORT
const PORT=process.env.PORT ||8080;

app.listen(PORT,()=>{
    console.log(`Running Server On Port ${PORT}`.bgCyan.white)
})
