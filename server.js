// Importações dos pacotes que vamos usar
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Inicializa o aplicativo Express
const app = express();
// Define a porta do servidor. Pega do .env ou usa 3001 como padrão.
const port = process.env.PORT || 3001; 
// Pega a chave da API do OpenWeatherMap do .env
const apiKey = process.env.API_KEY;

app.use(express.static(path.join(__dirname)))

/*app.get("/", (req, res)=>{
    res.sendFile(path.join(__dirname, "index.html"))
})*/

// Middleware para habilitar o CORS (Cross-Origin Resource Sharing)
// Permite que seu frontend (em outra porta/domínio) acesse este backend.
app.use((req, res, next) => {
    // Permite acesso de qualquer origem. Em produção, restrinja para o seu domínio.
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// ----- NOSSO PRIMEIRO ENDPOINT: Previsão do Tempo -----
// Rota GET que espera um parâmetro 'cidade' na URL
app.get('/api/previsao/:cidade', async (req, res) => {
    // Pega o parâmetro :cidade da URL (ex: /api/previsao/curitiba)
    const { cidade } = req.params; 

    // Validações de segurança e de dados
    if (!apiKey) {
        return res.status(500).json({ error: 'Chave da API OpenWeatherMap não configurada no servidor.' });
    }
    if (!cidade) {
        return res.status(400).json({ error: 'Nome da cidade é obrigatório.' });
    }

    // Monta a URL da API do OpenWeatherMap
    const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
        console.log(`[Servidor] Buscando previsão para: ${cidade}`);
        // O backend faz a chamada para a API externa usando axios
        const apiResponse = await axios.get(weatherAPIUrl);
        console.log('[Servidor] Dados recebidos da OpenWeatherMap com sucesso.');
        
        // Envia a resposta da API OpenWeatherMap de volta para o nosso frontend
        res.json(apiResponse.data);

    } catch (error) {
        // Tratamento de erro robusto
        console.error("[Servidor] Erro ao buscar previsão:", error.response?.data || error.message);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Erro ao buscar previsão do tempo no servidor.';
        res.status(status).json({ error: message });
    }
});

// Inicia o servidor e faz ele "escutar" na porta definida
app.listen(port, () => {
    console.log(`Servidor backend da Garagem Inteligente rodando em http://localhost:${port}`);
});