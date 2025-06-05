import { z } from 'zod';
import mongoose from 'mongoose';

export const taskZodSchema = z.object({
    titulo: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(100, 'Título deve ter no máximo 100 caracteres'),
    descricao: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
    status: z.enum(['Pendente', 'Em Progresso', 'Concluída', 'Abandonada', 'Atrasada'], {
        errorMap: () => ({ message: 'Status deve ser um dos seguintes: Pendente, Em Progresso, Concluída, Abandonada, Atrasada' })
    }),
    // Usar coerce.date() para converter strings em objetos Date
    dataLimite: z.coerce.date().refine(date => date > new Date(), 'Data limite deve ser uma data futura'),
    // Corrigir a validação de dataConclusao
    dataConclusao: z.coerce.date().optional().nullable(),
    usuario: z.string()
        .refine(val => mongoose.Types.ObjectId.isValid(val), {
            message: 'ID do usuário deve ser um ObjectId válido'
        })
})

export const taskUpdateZodSchema = taskZodSchema.partial();