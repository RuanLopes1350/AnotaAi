import { z } from 'zod';
import mongoose from 'mongoose';

// Schema para validação da query string
export const queryTaskZodSchema = z.object({
    // Campos de busca textual com suporte a busca parcial
    titulo: z.string().optional()
        .transform(val => val ? { $regex: val, $options: 'i' } : undefined),
    
    descricao: z.string().optional()
        .transform(val => val ? { $regex: val, $options: 'i' } : undefined),
    
    // Campos enumerados
    status: z.enum(['Pendente', 'Em Progresso', 'Concluída', 'Abandonada', 'Atrasada'])
        .optional(),
    
    // Campos de data com suporte a intervalos
    dataLimiteInicio: z.coerce.date().optional(),
    dataLimiteFim: z.coerce.date().optional(),
    
    dataCriacaoInicio: z.coerce.date().optional(),
    dataCriacaoFim: z.coerce.date().optional(),
    
    // Para tarefas concluídas
    comDataConclusao: z.boolean().optional()
        .transform(val => val === true ? { $ne: null } : undefined),
    
    dataConclusaoInicio: z.coerce.date().optional(),
    dataConclusaoFim: z.coerce.date().optional(),
    
    // Referência a usuário
    usuario: z.string()
        .refine(val => val ? mongoose.Types.ObjectId.isValid(val) : true, {
            message: 'ID de usuário inválido'
        })
        .optional(),
    
    // Paginação
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    
    // Ordenação
    sortBy: z.enum(['titulo', 'status', 'dataLimite', 'dataConclusao', 'data_criacao', 'data_ultima_atualizacao'])
        .default('data_criacao'),
    
    sortOrder: z.enum(['asc', 'desc']).default('desc')
})
.refine(
    data => !(data.dataLimiteInicio && data.dataLimiteFim && data.dataLimiteInicio > data.dataLimiteFim),
    {
        message: "Data limite inicial não pode ser posterior à data limite final",
        path: ["dataLimiteInicio"]
    }
)
.refine(
    data => !(data.dataCriacaoInicio && data.dataCriacaoFim && data.dataCriacaoInicio > data.dataCriacaoFim),
    {
        message: "Data de criação inicial não pode ser posterior à data de criação final",
        path: ["dataCriacaoInicio"]
    }
)
.refine(
    data => !(data.dataConclusaoInicio && data.dataConclusaoFim && data.dataConclusaoInicio > data.dataConclusaoFim),
    {
        message: "Data de conclusão inicial não pode ser posterior à data de conclusão final",
        path: ["dataConclusaoInicio"]
    }
);

// Função para transformar parâmetros de consulta em filtros do MongoDB
export const buildMongoQueryFromParams = (queryParams) => {
    const validatedParams = queryTaskZodSchema.parse(queryParams);
    const filter = {};
    
    // Filtros de texto
    if (validatedParams.titulo) filter.titulo = validatedParams.titulo;
    if (validatedParams.descricao) filter.descricao = validatedParams.descricao;
    
    // Status
    if (validatedParams.status) filter.status = validatedParams.status;
    
    // Usuário
    if (validatedParams.usuario) filter.usuario = validatedParams.usuario;
    
    // Data limite (entre duas datas)
    if (validatedParams.dataLimiteInicio || validatedParams.dataLimiteFim) {
        filter.dataLimite = {};
        if (validatedParams.dataLimiteInicio) filter.dataLimite.$gte = validatedParams.dataLimiteInicio;
        if (validatedParams.dataLimiteFim) filter.dataLimite.$lte = validatedParams.dataLimiteFim;
    }
    
    // Data de criação (entre duas datas)
    if (validatedParams.dataCriacaoInicio || validatedParams.dataCriacaoFim) {
        filter.data_criacao = {};
        if (validatedParams.dataCriacaoInicio) filter.data_criacao.$gte = validatedParams.dataCriacaoInicio;
        if (validatedParams.dataCriacaoFim) filter.data_criacao.$lte = validatedParams.dataCriacaoFim;
    }
    
    // Data de conclusão
    if (validatedParams.comDataConclusao === true) {
        filter.dataConclusao = { $ne: null };
    } else if (validatedParams.comDataConclusao === false) {
        filter.dataConclusao = null;
    }
    
    if (validatedParams.dataConclusaoInicio || validatedParams.dataConclusaoFim) {
        filter.dataConclusao = filter.dataConclusao || {};
        if (validatedParams.dataConclusaoInicio) filter.dataConclusao.$gte = validatedParams.dataConclusaoInicio;
        if (validatedParams.dataConclusaoFim) filter.dataConclusao.$lte = validatedParams.dataConclusaoFim;
    }
    
    // Opções de paginação e ordenação
    const options = {
        page: validatedParams.page,
        limit: validatedParams.limit,
        sort: { [validatedParams.sortBy]: validatedParams.sortOrder === 'asc' ? 1 : -1 }
    };
    
    return { filter, options };
};