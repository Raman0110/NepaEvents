const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ message: "Token not found!" })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error!" })
  }
}
module.exports = verifyToken;