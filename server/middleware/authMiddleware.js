import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const protectRoute = async (req, res, next) => {
  // Token extractor block
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true } // Excludes restricted password hash
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Conditional passthrough authenticator
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    // Guest fallback condition
    if (!token) {
      req.user = null;
      return next();
    }

    // Token verification pass
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      req.user = null;
      return next();
    }

    // Entity hydration pass
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true } 
    });

    // Context binding
    req.user = user || null;
    next();
    
  } catch (error) {
    // Prevents halting request lifecycle on invalid states, handling as unauthenticated
    console.log("Error in optionalAuth middleware (proceeding as guest): ", error.message);
    req.user = null;
    next();
  }
};