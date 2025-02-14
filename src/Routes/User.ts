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
    const {username, password, fullname, address} = req.body;
    try{
        const user = await prisma.user.create({
            data:{
                username,
                password,
                fullname,
                address
            }
        });
        res.status(200).json(user)
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
        const user = await prisma.user.findFirst({
            where:{
                username,
                password
            }
        });
        if(!user){
            res.status(500).json({ error:"Error Signingin1"})
            return;
        }
        if(!JWT_SECRET){
            res.status(500).json({ error:"Error Signingin2"})
            return;
        }
        const token = jwt.sign({mainId2: user.id}, JWT_SECRET)
        res.cookie("token",token, {
            httpOnly: true,
        });
        res.json({message: "Looged in Succesfull",token})
    }catch(e){
        res.status(500).json({ error:"Error Signingin3"})
    }
})

export default router;