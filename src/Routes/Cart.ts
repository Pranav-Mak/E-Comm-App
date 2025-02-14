import { Router, Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import cookieParser from "cookie-parser";
import cors from 'cors';
import { PrismaClient } from "@prisma/client";


const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET: string | undefined = process.env.JWT_SECRET;

router.use(cookieParser());
router.use(cors({
    allowedHeaders: ['Content-Type','Authorization'],
    origin: ["http://localhost:5500"],
    methods:['GET','POST','PUT','DELETE']
}))

function authMiddleware(req:Request, res:Response, next:NextFunction):void{
    const token = req.cookies.token;
    console.log('Token from cookies:', token);
    if(!token){
        console.error("No token found in cookies");
         res.status(400).json({ error: 'Access Denied1' });
         return
    }
    if(!JWT_SECRET){
         console.error("JWT_SECRET is not defined");
         res.status(400).json({ error: 'Access Denied2' });
         return
    }
    jwt.verify(token,JWT_SECRET,function(err: Error | null, user: any){
        if(err){
            console.error('Token verification failed:', err);
            res.status(400).json({ error: "Access Denied3" });
        }
        req.body.user = user;
        next();
})
}

router.post('/add', authMiddleware, async function(req,res){
    const productId = req.body.productId;
    const userId = req.body.user.mainId2;
    try{
        const existingEntry = await prisma.cart.findUnique({
            where:{
                userId_productId:{
                    userId: parseInt(userId),
                    productId: parseInt(productId)
                }
            }
        })
        if (existingEntry) {
            res.status(400).json({ message: "Employee has already joined the meeting" });
            return
        }
        const add = await prisma.cart.create({
            data:{
                userId: parseInt(userId),
                productId: parseInt(productId)
            }
        })
        res.status(200).json(add)
    }catch(e){
        console.error("Error updating cart:", e);
        res.status(500).json({ error: "Error adding in cart" });
    }
})


router.get('/',authMiddleware, async (req, res) => {
    const userId = req.body.user.mainId2
    try {
      const mycart = await prisma.cart.findMany({
        where:{
            userId:parseInt(userId)
        },
        include: {
            product: true,  // Include related products in the response
          },
      });
      
      res.status(200).json(mycart);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ error: "Error fetching cart" });
    }
  });

router.delete('/', authMiddleware, async function(req,res){
    const userId = req.body.user.mainId2
    const productId = req.body.productId;
    try{
        const remove = await prisma.cart.delete({
            where:{
                userId_productId:{
                    userId: parseInt(userId),
                    productId: parseInt(productId)
                }
            }
        })
        res.status(200).json("Item Removed from the cart");
    }catch(e){
        console.error("Error updating cart:", e);
        res.status(500).json({ error: "Error deleting in cart" });
    }
})

export default router;
