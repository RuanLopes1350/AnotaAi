import Logger from '../utils/helpers/logger.js';

const requestLogger = (req, res, next) => {
  // Gerar ID único para a requisição
  const idRequisicao = req.headers['x-request-id'] || 
                        Math.random().toString(36).substring(2, 15);
  req.idRequisicao = idRequisicao;
  
  // Registrar informações básicas da requisição
  const metodo = req.method;
  const rota = req.originalUrl;
  const ip = req.ip;
  const userAgent = req.headers['user-agent'];
  
  // Log de início da requisição
  Logger.info(`[${idRequisicao}] Requisição recebida: ${metodo} ${rota}`, {
    metodo,
    rota,
    ip,
    userAgent,
    query: req.query,
    params: req.params,
    body: ocultarDadosSensiveis(req.body)
  });
  
  // Registrar o tempo de início
  req.tempoInicio = Date.now();
  
  // Interceptar a resposta para logar quando concluir
  const envioOriginal = res.send;
  res.send = function(body) {
    res.body = body;
    
    // Calcular duração
    const duracao = Date.now() - req.tempoInicio;
    const statusCode = res.statusCode;
    
    // Determinar nível de log com base no código de status
    const nivelLog = statusCode >= 500 ? 'error' : 
                    statusCode >= 400 ? 'warn' : 'info';
    
    Logger[nivelLog](`[${idRequisicao}] Resposta enviada: ${metodo} ${rota} ${statusCode} - ${duracao}ms`, {
      statusCode,
      duracao,
      tamanhoResposta: Buffer.isBuffer(body) ? body.length : 
                       typeof body === 'string' ? body.length : 
                       JSON.stringify(body).length
    });
    
    return envioOriginal.apply(res, arguments);
  };
  
  next();
};

// Função para ocultar dados sensíveis
function ocultarDadosSensiveis(dados) {
  if (!dados || typeof dados !== 'object') return dados;
  
  const dadosOcultos = { ...dados };
  const camposSensiveis = ['senha', 'password', 'token', 'segredo', 'cartao', 'credito'];
  
  camposSensiveis.forEach(campo => {
    if (dadosOcultos[campo]) {
      dadosOcultos[campo] = '[OCULTO]';
    }
  });
  
  return dadosOcultos;
}

export default requestLogger;