"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Seller_1 = __importDefault(require("./Routes/Seller"));
const Product_1 = __importDefault(require("./Routes/Product"));
const User_1 = __importDefault(require("./Routes/User"));
const Cart_1 = __importDefault(require("./Routes/Cart"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/seller', Seller_1.default);
app.use('/products', Product_1.default);
app.use('/user', User_1.default);
app.use('/cart', Cart_1.default);
const port = 3000;
app.listen(port, function () {
    console.log(`Server running on ${port}`);
});
