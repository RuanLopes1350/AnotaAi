import { z } from 'zod';
import mongoose from 'mongoose';

export const queryUserZodSchema = z.object({
    // Campos de busca textual com suporte a busca parcial
    nome: z.string().optional()
        .transform(val => val ? { $regex: val, $options: 'i' } : undefined),
    
    apelido: z.string().optional()
        .transform(val => val ? { $regex: val, $options: 'i' } : undefined),
        
    email: z.string().optional()
        .transform(val => val ? { $regex: val, $options: 'i' } : undefined),
    
    // Data de cadastro com suporte a intervalos
    dataCadastroInicio: z.coerce.date().optional(),
    dataCadastroFim: z.coerce.date().optional(),
    
    // Data de última atualização com suporte a intervalos
    dataAtualizacaoInicio: z.coerce.date().optional(),
    dataAtualizacaoFim: z.coerce.date().optional(),
    
    // Status do usuário (para implementação futura)
    status: z.enum(['ativo', 'inativo', 'bloqueado']).optional(),

    // ID específico de usuário
    id: z.string()
        .refine(val => val ? mongoose.Types.ObjectId.isValid(val) : true, {
            message: 'ID de usuário inválido'
        })
        .optional(),
    
    // Paginação
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    
    // Ordenação
    sortBy: z.enum(['nome', 'apelido', 'email', 'createdAt', 'updatedAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
})
.refine(
    data => !(data.dataCadastroInicio && data.dataCadastroFim && data.dataCadastroInicio > data.dataCadastroFim),
    {
        message: "Data de cadastro inicial não pode ser posterior à data final",
        path: ["dataCadastroInicio"]
    }
)
.refine(
    data => !(data.dataAtualizacaoInicio && data.dataAtualizacaoFim && data.dataAtualizacaoInicio > data.dataAtualizacaoFim),
    {
        message: "Data de atualização inicial não pode ser posterior à data final",
        path: ["dataAtualizacaoInicio"]
    }
);

// Função para transformar parâmetros de consulta em filtros do MongoDB
export const buildMongoUserQueryFromParams = (queryParams) => {
    const validatedParams = queryUserZodSchema.parse(queryParams);
    const filter = {};
    
    // Filtros de texto
    if (validatedParams.nome) filter.nome = validatedParams.nome;
    if (validatedParams.apelido) filter.apelido = validatedParams.apelido;
    if (validatedParams.email) filter.email = validatedParams.email;
    
    // Status (para implementação futura)
    if (validatedParams.status) filter.status = validatedParams.status;
    
    // ID específico
    if (validatedParams.id) filter._id = validatedParams.id;
    
    // Data de cadastro (entre duas datas)
    if (validatedParams.dataCadastroInicio || validatedParams.dataCadastroFim) {
        filter.createdAt = {};
        if (validatedParams.dataCadastroInicio) filter.createdAt.$gte = validatedParams.dataCadastroInicio;
        if (validatedParams.dataCadastroFim) filter.createdAt.$lte = validatedParams.dataCadastroFim;
    }
    
    // Data de atualização (entre duas datas)
    if (validatedParams.dataAtualizacaoInicio || validatedParams.dataAtualizacaoFim) {
        filter.updatedAt = {};
        if (validatedParams.dataAtualizacaoInicio) filter.updatedAt.$gte = validatedParams.dataAtualizacaoInicio;
        if (validatedParams.dataAtualizacaoFim) filter.updatedAt.$lte = validatedParams.dataAtualizacaoFim;
    }
    
    // Opções de paginação e ordenação
    const options = {
        page: validatedParams.page,
        limit: validatedParams.limit,
        sort: { [validatedParams.sortBy]: validatedParams.sortOrder === 'asc' ? 1 : -1 }
    };
    
    return { filter, options };
};