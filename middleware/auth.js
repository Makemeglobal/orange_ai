const jwt = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
  const auth = req.header("Authorization");
  const token = auth.split(' ')[1]
  console.log(token)
  if (!token) {
    return res.status(401).json({ Message: "Unauthorized user" });
  }
  
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded.userId;
    next();
  } catch (err) {
    console.log(err)
    res.status(401).json({ Message: "Unauthorized user" });
  }
};
