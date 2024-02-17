const jwt = require('jsonwebtoken');

const JWT_SECRET = "Hemantisagoodboy@";

const fetchuser = (req, res, next)=>{
    try {
        const token = req.header('auth-token');
        if(!token){
            req.status(401).send("please use a valid authentication token");
        }
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } 
    catch (error) {
        res.status(401).send("please use a valid authentication token");
    }
}

module.exports = fetchuser;