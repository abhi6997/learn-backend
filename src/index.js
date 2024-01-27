//require ('dotenv').config({path: './env'})

//import mongoose from "mongoose"
//import {DB_NAME} from "./constants"

import dotenv from "dotenv"


import express from "express"
const app = express();
import connectDB from "./db/index.js"

dotenv.config({
    path: './env'
})

connectDB().then(()=>{
    app.listen(process.env.PORT || 8000  , ()=>{
        console.log("server is running at port : ", process.env.PORT)
    })

    app.on("error",(error)=>{
        console.log("server failed!!!! due to: ", error)
        throw error;
    })
}).catch((error)=>{
    console.log("MONGO db connection failed !!!! ", error)    
})



/*( async()=>{

    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERROR: ",error)
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT} `)
        })
    }
    catch(error){
        console.error("ERROR: ",error)
        throw err
    }
})()*/