import jwt from 'jsonwebtoken'

const authMiddleware = (req,res,next) => {
const token = req.headers.authorization?.split(' ')[1]

try{
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    req.user = decoded
    next()
    }catch(err){
    res.status(401).json({error: 'Unauthorized credentials'});
    
    }
}

export default authMiddleware