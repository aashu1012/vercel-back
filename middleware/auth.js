import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access Denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // Set req.user instead of req.userId for consistency
    next();
  } catch (err) {
    return res.status(400).json({ error: "Invalid Token" });
  }
};

export default auth; 