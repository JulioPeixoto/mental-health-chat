'server-only';

import { eq, and, or, lte, not } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

import { VerificationTokenT, verificationToken} from './schema';
import { logger } from '@/lib/logger';
import  db  from '@/lib/drizzle/drizzle';

/**
 * Gera um token de verificação para o usuário
 */
export async function createVerificationToken(userId: string, email: string): Promise<string> {
    try {
        const token = crypto.randomBytes(32).toString('hex');
        logger.info('Token gerado:', { token });
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        const expires = new Date();
        expires.setHours(expires.getHours() + 72);
        logger.info(' 2 Token expira em:', { expires });
        await db.insert(verificationToken).values({
            id: uuidv4(),
            token: hashedToken, 
            userId,
            email,
            expires,
            createdAt: new Date(),
            verified: 'N'
        });
        logger.info('3 Token inserido no banco de dados:', { hashedToken });
        return token; 
    } catch (error) {
        logger.error('Erro ao criar token de verificação:', { error });
        throw error;
    }
}

/**
 * Verifica se um token é válido para o email fornecido
 */
export async function verifyToken(token: string, email: string): Promise<{ record: VerificationTokenT | null, alreadyVerified: boolean }> {
    try {
        const now = new Date();
        
        // Hash do token fornecido para comparar com o banco
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        // Verificar se o token existe, independente do status
        const results = await db.select()
            .from(verificationToken)
            .where(
                and(
                    eq(verificationToken.token, hashedToken), // Comparação com o hash
                    eq(verificationToken.email, email)
                )
            );
        
        if (results.length === 0) {
            return { record: null, alreadyVerified: false };
        }
        
        const verificationRecord = results[0];
        
        // Verificar se o token expirou
        if (new Date(verificationRecord.expires) < now) {
            return { record: null, alreadyVerified: false };
        }
        
        // Verificar se o token já foi verificado
        const alreadyVerified = verificationRecord.verified === 'S';
        
        return { 
            record: verificationRecord, 
            alreadyVerified 
        };
    } catch (error) {
        logger.error('Erro ao verificar token:', { error });
        throw error;
    }
}

/**
 * Marca um token como verificado
 */
export async function markTokenAsVerified(tokenId: string): Promise<void> {
    try {
        await db.update(verificationToken)
            .set({ verified: 'S' })
            .where(eq(verificationToken.id, tokenId));
    } catch (error) {
        logger.error('Erro ao marcar token como verificado:', { error });
        throw error;
    }
}

/**
 * Apaga tokens expirados ou já verificados para o email fornecido
 */
export async function cleanupTokens(email: string, excludeTokenId?: string): Promise<void> {
    try {
        const now = new Date();
        
        let query = and(
            eq(verificationToken.email, email),
            or(
                lte(verificationToken.expires, now),
                eq(verificationToken.verified, 'S')
            )
        );
        
        if (excludeTokenId) {
            query = and(
                query,
                not(eq(verificationToken.id, excludeTokenId))
            );
        }
        
        await db.delete(verificationToken).where(query);
    } catch (error) {
        logger.error('Erro ao limpar tokens:', { error });
        throw error;
    }
} 