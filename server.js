import app from './src/app.js';
import * as dotenv from 'dotenv';

const port = process.env.PORT || 5130;
const url = process.env.URL || 'http://localhost';

app.listen(port, () => {
    console.log(`Servidor rodando em ${url}:${port}`);
})