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

function authMiddleware (req: Request,res: Response,next: NextFunction){
    const token = req.cookies.token;
    if(!token){
        console.error("No token found in cookies");
         res.status(400).json({ error: 'Access Denied1' });
         return
    }
    if(!JWT_SECRET){
        console.error("No token found in cookies");
         res.status(400).json({ error: 'Access Denied1' });
         return
    }
    jwt.verify(token,JWT_SECRET, function(err :Error | null, user: any){
    if(err){
        console.error('Token Failed',err)
        res.status(400).json({ error: "Access Denied3" });
    }
    req.body.seller = user
    next();
})
}

router.post('/', authMiddleware, async function (req,res){
    const {title, description, price} = req.body
    console.log('Decoded User:', req.body.seller);
    const sellerId = req.body.seller.mainId
    try{
    const product = await prisma.products.create({
        data:{
            title,
            description,
            price,
            sellerId:parseInt(sellerId)
        }
    })
    res.status(200).json(product)
    }catch(e){
        console.error('Error:', e);
        res.status(500).json({ error: "Error Creating Meeting" });
    }
})

router.put('/', authMiddleware, async function(req, res){
    const {id,title, description, price} = req.body
    console.log('Decoded User:', req.body.seller);
    const sellerId = req.body.seller.mainId
    try{
        const product = await prisma.products.update({
            where:{
                id:parseInt(id)
            },
            data:{
                title,
                description,
                price,
                sellerId:parseInt(sellerId)
            }
        })
        res.status(200).json(product)
        }catch(e){
            console.error('Error:', e);
            res.status(500).json({ error: "Error Editing product" });
        }
})

router.get('/bulk', async function(req,res){
    try{
    const products = await prisma.products.findMany()
    res.status(200).json(products)
    }catch(e){
        console.error("Error fetching meetings:", e);
      res.status(500).json({ error: "Error fetching meetings" });
    }
})















export default router;
