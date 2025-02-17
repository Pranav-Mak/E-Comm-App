"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
router.use((0, cookie_parser_1.default)());
router.use((0, cors_1.default)({
    allowedHeaders: ['Content-Type', 'Authorization'],
    origin: ["http://localhost:5500"],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
function authMiddleware(req, res, next) {
    const token = req.cookies.token;
    console.log('Token from cookies:', token);
    if (!token) {
        console.error("No token found in cookies");
        res.status(400).json({ error: 'Access Denied1' });
        return;
    }
    if (!JWT_SECRET) {
        console.error("JWT_SECRET is not defined");
        res.status(400).json({ error: 'Access Denied2' });
        return;
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, function (err, user) {
        if (err) {
            console.error('Token verification failed:', err);
            res.status(400).json({ error: "Access Denied3" });
        }
        req.body.user = user;
        next();
    });
}
router.get('/', authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body.user.mainId2;
    try {
        const myorder = yield prisma.order.findMany({
            where: {
                userId: parseInt(userId)
            },
            include: {
                product: true,
            },
        });
        res.status(200).json(myorder);
    }
    catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ error: "Error fetching order" });
    }
}));
router.post('/move-to-order', authMiddleware, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = req.body.user.mainId2;
        try {
            const cartItems = yield prisma.cart.findMany({
                where: {
                    userId: parseInt(userId)
                },
                include: {
                    product: true,
                },
            });
            if (cartItems.length === 0) {
                res.status(400).json({ message: "Cart is empty" });
                return;
            }
            const ordersData = cartItems.map((item) => ({
                userId: parseInt(userId),
                productId: item.productId,
                totalPrice: item.product.price * 1,
            }));
            const orders = yield prisma.order.createMany({
                data: ordersData,
            });
            yield prisma.cart.deleteMany({
                where: {
                    userId: parseInt(userId)
                },
            });
            res.status(200).json({ message: "Cart moved to orders successfully", orders });
        }
        catch (e) {
            console.error("Error moving cart to orders:", e);
            res.status(500).json({ error: "Error moving to orders" });
        }
    });
});
exports.default = router;
