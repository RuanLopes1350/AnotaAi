import { z } from 'zod';
import mongoose from 'mongoose';

export const userZodSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(50, 'Nome deve ter no máximo 50 caracteres'),
    apelido: z.string().min(3, 'Apelido deve ter pelo menos 3 caracteres').max(50, 'Apelido deve ter no máximo 50 caracteres'),
    email: z.string().email('Email inválido').max(50, 'Email deve ter no máximo 50 caracteres'),
    senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(26, 'Senha deve ter no máximo 26 caracteres'),
    respostaSeguranca: z.string().max(100, 'Resposta de segurança deve ter no máximo 100 caracteres'),
    status: z.enum(['Ativo', 'Inativo', 'Banido'], {
        errorMap: () => ({message: 'Status deve ser um dos seguintes: Ativo, Inativo, Banido'})
    }),
})

export const userUpdateZodSchema = userZodSchema.partial();