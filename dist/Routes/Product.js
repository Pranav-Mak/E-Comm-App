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
    if (!token) {
        console.error("No token found in cookies");
        res.status(400).json({ error: 'Access Denied1' });
        return;
    }
    if (!JWT_SECRET) {
        console.error("No token found in cookies");
        res.status(400).json({ error: 'Access Denied1' });
        return;
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, function (err, user) {
        if (err) {
            console.error('Token Failed', err);
            res.status(400).json({ error: "Access Denied3" });
        }
        req.body.seller = user;
        next();
    });
}
router.post('/', authMiddleware, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { title, description, price } = req.body;
        console.log('Decoded User:', req.body.seller);
        const sellerId = req.body.seller.mainId;
        try {
            const product = yield prisma.products.create({
                data: {
                    title,
                    description,
                    price,
                    sellerId: parseInt(sellerId)
                }
            });
            res.status(200).json(product);
        }
        catch (e) {
            console.error('Error:', e);
            res.status(500).json({ error: "Error Creating Meeting" });
        }
    });
});
router.put('/', authMiddleware, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id, title, description, price } = req.body;
        console.log('Decoded User:', req.body.seller);
        const sellerId = req.body.seller.mainId;
        try {
            const product = yield prisma.products.update({
                where: {
                    id: parseInt(id)
                },
                data: {
                    title,
                    description,
                    price,
                    sellerId: parseInt(sellerId)
                }
            });
            res.status(200).json(product);
        }
        catch (e) {
            console.error('Error:', e);
            res.status(500).json({ error: "Error Editing product" });
        }
    });
});
router.get('/bulk', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const products = yield prisma.products.findMany();
            res.status(200).json(products);
        }
        catch (e) {
            console.error("Error fetching meetings:", e);
            res.status(500).json({ error: "Error fetching meetings" });
        }
    });
});
exports.default = router;
