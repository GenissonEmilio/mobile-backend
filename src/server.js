require('dotenv').config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "PriceWatch API funcionando"
    });
});

app.get("/products", (req, res) => {
    res.json({
        name: "teste",
        price: 50
    })
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});