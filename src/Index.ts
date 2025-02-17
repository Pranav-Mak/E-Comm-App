import express from "express";
import sellerRouter from "./Routes/Seller";
import productRouter from "./Routes/Product";
import userRouter from "./Routes/User";
import cartRouter from "./Routes/Cart";
import orderRouter from "./Routes/Order"

const app = express();

app.use(express.json())
app.use('/seller', sellerRouter)
app.use('/products', productRouter)
app.use('/user', userRouter)
app.use('/cart', cartRouter)
app.use('/orders',orderRouter)


const port : number = 3000;
app.listen(port, function(){
    console.log(`Server running on ${port}`)
});