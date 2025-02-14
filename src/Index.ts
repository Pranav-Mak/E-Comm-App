import express from "express";
import sellerRouter from "./Routes/Seller";
import productRouter from "./Routes/Product";
import userRouter from "./Routes/User";
import cartRouter from "./Routes/Cart";

const app = express();

app.use(express.json())
app.use('/seller', sellerRouter)
app.use('/products', productRouter)
app.use('/user', userRouter)
app.use('/cart', cartRouter)


const port : number = 3000;
app.listen(port, function(){
    console.log(`Server running on ${port}`)
});