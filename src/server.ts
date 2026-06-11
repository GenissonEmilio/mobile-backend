import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "PriceWatch API funcionando"
    });
});

app.get("/products", (req: Request, res: Response) => {
    res.json({
        name: "teste",
        price: 50
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});