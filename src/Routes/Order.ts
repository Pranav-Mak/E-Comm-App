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

router.get('/',authMiddleware, async (req, res) => {
    const userId = req.body.user.mainId2
    try {
      const myorder = await prisma.order.findMany({
        where:{
            userId:parseInt(userId)
        },
        include: {
            product: true,
          },
      });
      
      res.status(200).json(myorder);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Error fetching order" });
    }
  });

  interface CartItem {
    productId: number;
    product: {
      id: number;
      name: string;
      price: number;
    };
    userId: number;
  }  

router.post('/move-to-order', authMiddleware, async function(req,res){
    const userId = req.body.user.mainId2;

    try {

        const cartItems = await prisma.cart.findMany({
            where: {
                userId: parseInt(userId)
            },
            include: {
                product: true,  
            },
        });

        if (cartItems.length === 0) {
             res.status(400).json({ message: "Cart is empty" });
             return
        }

        const ordersData = cartItems.map((item: any) => ({
            userId: parseInt(userId),
            productId: item.productId, 
            totalPrice: item.product.price * 1,
        }));

        const orders = await prisma.order.createMany({
            data: ordersData, 
        }); 

        await prisma.cart.deleteMany({
            where: {
                userId: parseInt(userId)
            },
        });

        res.status(200).json({ message: "Cart moved to orders successfully", orders });
    } catch (e) {
        console.error("Error moving cart to orders:", e);
        res.status(500).json({ error: "Error moving to orders" });
    }
});

export default router;

