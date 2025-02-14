import { Router, Request, Response } from "express";
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


router.post('/signup', async function(req,res){
    const {username, password, fullname} = req.body;
    try{
        const seller = await prisma.seller.create({
            data:{
                username,
                password,
                fullname
            }
        });
        res.status(200).json(seller)
    }catch(e){
        res.status(400).json({ error:"Error Signingup"})
    }
})

router.post('/signin',  async function(req,res){
    const {username, password} = req.body;
    if (!username || !password) {
        res.status(400).json({ error: "Username and password are required" });
        return
   }
    try{
        const seller = await prisma.seller.findFirst({
            where:{
                username,
                password
            }
        });
        if(!seller){
            res.status(500).json({ error:"Error Signingin1"})
            return;
        }
        if(!JWT_SECRET){
            res.status(500).json({ error:"Error Signingin2"})
            return;
        }
        const token = jwt.sign({mainId: seller.id}, JWT_SECRET)
        res.cookie("token",token, {
            httpOnly: true,
        });
        res.json({message: "Looged in Succesfull",token})
    }catch(e){
        res.status(500).json({ error:"Error Signingin3"})
    }
})

export default router;

