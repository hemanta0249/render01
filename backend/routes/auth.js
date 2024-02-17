const express = require('express');
const Users = require('../models/Users');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchUsers');

const JWT_SECRET = "Hemantisagoodboy@";

// route 1 - creating users

router.post('/createusers',[
    body('name', "enter a valid name").isLength({ min:3 }),
    body('email', "enter a valid email").isEmail(),
    body('password', "enter atleast 5 digits password").isLength({ min:5 })
] , async (req, res)=>{
    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({success, errors: errors.array() });
    }

    try{
        
        let user = await Users.findOne({email: req.body.email});
        if(user){
            success = false;
            return res.status(400).json({success, error: "this email id already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const securepass = await bcrypt.hash(req.body.password, salt);
        
        user = await Users.create({
            name: req.body.name,
            email: req.body.email,
            password: securepass
        });

        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true
        res.json({success, authToken});
    }
    catch(error){
        console.error(error.message);
        res.status(500).send("Internal error occored");
    }
      
})

// route 2 - login router

router.post('/login',[
    body('email', "enter a valid email").isEmail(),
    body('password', "Password cannot be blank").isLength({ min:5 })
] , async (req, res)=>{
    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({success, errors: errors.array() });
    }

    const {email, password} = req.body;
    try {
        let user = await Users.findOne({email});
        if(!user){
            return res.status(400).json({error: "please try to login with correct credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);

        if(!passwordCompare){
            success = false;
            return res.status(400).json({success, error: "please try to login with correct credentials" });
        }

        const data = {
            user: {
                id: user.id
            }
        }
        success = true;
        const authToken = jwt.sign(data, JWT_SECRET);
        res.json({success, authToken});
    } 
    catch(error){
        console.error(error.message);
        res.status(500).send("Internal error occored");
    }

})

// route 3 - get users data

router.post('/getuser', fetchuser, async (req, res)=>{

    try {
        const userId = req.user.id;
        const user = await Users.findById(userId).select("-password");
        res.send(user);
    } 
    catch(error){
        console.error(error.message);
        res.status(500).send("Internal error occored");
    }

})

module.exports = router;