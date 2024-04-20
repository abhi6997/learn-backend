//require ('dotenv').config({path: './env'})

//import mongoose from "mongoose"
//import {DB_NAME} from "./constants"

import dotenv from "dotenv"
import {app} from "./app.js"

import connectDB from "./db/mongodbconnect.js"

dotenv.config({
    path: './.env'
})


const port = process.env.PORT || 8000;
connectDB().then(()=>{
    app.listen(port , ()=>{
        console.log("server is running at port : ",port)
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