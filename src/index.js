const express = require('express');

const { ServerConfig , Logger } = require('./config/index.js');
const apiRoutes = require('./routes/index.js');
const { ConnectDataBase } = require('./db/index.js');
const GlobalErrorhandler = require("./utils/error-handler.js")
const dns = require("dns") // for internet issue
dns.setServers(["8.8.8.8", "1.1.1.1"])
const cookieParser = require('cookie-parser');

require("dotenv").config()

const app = express();


// ----------------- DATABASE ENTRY  -----------------//
ConnectDataBase() 
// ----------------- DATABASE ENTRY  -----------------//




// ----------------- MIDDELWARES -----------------//
app.use(express.json())
app.use(express.urlencoded({extended  : true})) 
app.use(cookieParser())
// ----------------- MIDDELWARES -----------------//



// ----------------- ALL ROUTES -----------------//
app.use("/api" , apiRoutes)
// ----------------- ALL ROUTES -----------------// 


app.get("/" , (req, res)=>{
    res.send("Welcome to Node Starter Template")
}) 


// ----------------- SERVER RUNNING -----------------//
app.listen(ServerConfig.PORT, () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
    // Logger.info("Successfully started " , {}) you can enable to log the messages
});



// ----------------- SERVER RUNNING -----------------//


// ----------------- GLOBAL ERROR HANDLER -----------------//
app.use(GlobalErrorhandler)
// ----------------- GLOBAL ERROR HANDLER -----------------//

