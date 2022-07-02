const dotenv = require('dotenv');
const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const http = require('http');
const mongoose = require('mongoose');

const User = require('./models/UserSchema');
const Message = require('./models/MsgSchema');

const app = express();

dotenv.config();

mongoose.connect(process.env.MONGO_URL, () => {
    console.log('database connected');
});


//This method are used to get Data and Cookies from front-end
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

//Registration
app.post('/register', async (req, res) => {
    try {
        //Get body
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        const createUser = new User({
            username : username,
            email : email,
            password : password
        });
        
        //Save method is used to create or insert new User
        const created = await createUser.save();
        console.log(created);
        res.status(200).send('User Registered Successfully...');

    } catch (error) {
        res.status(400).send(error);
    }
})

//LoginUser
app.post('/login', async (req, res) => {

    try {
        const email = req.body.email;
        const password = req.body.password;

        //Find User if Exist
        const user = await User.findOne({email});
        if(user){
            const isMatch = await bcrypt.compare(password, user.password);

            if(isMatch){
                //Generated Tocken which is defined in User Schema
                const token = await user.generateToken();
                res.cookie("jwt", token, {
                    //Expire Token in 24h
                    expires : new Date(Date.now() + 86400000),
                    httpOnly : true
                    
                })
                res.status(200).send("You Are LoggedIn");
            }else{
                res.status(400).send("Invalid Credentials");
            }
        }else{
            res.status(400).send("Invalid Credentials");  
        }    
    } catch (error) {
        res.status(400).send(error);
    }
    
})


//Message send from User
app.post('/message', async (req, res) => {
    try {
        //Get body
        const name = req.body.name;
        const email = req.body.email;
        const message = req.body.message;

        const sendMsg = new Message({
            name : name,
            email : email,
            message : message
        });
        
        //Save method is used to send message from User
        const created = await sendMsg.save();
        console.log(created);
        res.status(200).send('Message Sent Successfully');

    } catch (error) {
        res.status(400).send(error);
    }
})

//Logout Page
app.get('/logout', (req, res) =>{
    res.clearCookie("jwt", {path : '/'})
    res.status(200).send('User logged Out')
})


const port = 5000;

const myServer = http.createServer(app);
myServer.listen(process.env.PORT || port, () => {
    console.log(`SERVER IS RUNNING ON PORT ${port}!!`);
});



