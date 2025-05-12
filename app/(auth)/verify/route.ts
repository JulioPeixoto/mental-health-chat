import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateCsrfToken } from "@/lib/csrf";
import { rateLimiter } from "@/middlewares/rate-limiter";
import { logger } from "@/lib/logger";
import { verifyToken, cleanupTokens, markTokenAsVerifiedAndActivateUser } from "@/db/verification.repository";

/**
 * Handler para verificação de token por GET (link de email)
 */
export async function GET(req: NextRequest) {
  const rateLimit = rateLimiter(req, {
    maxRequests: 5,
    windowMs: 60 * 1000,
    message: "Muitas tentativas. Tente novamente em 1 minuto."
  });
  
  if (rateLimit) return rateLimit;
  
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const email = url.searchParams.get('email');

    if (!token || !email) {
      return NextResponse.redirect(new URL('/auth/error?error=invalid_params', req.url));
    }

    const { record, alreadyVerified } = await verifyToken(token, email);

    if (!record) {
      return NextResponse.redirect(new URL('/auth/error?error=invalid_token', req.url));
    }

    if (!alreadyVerified) {
      await markTokenAsVerifiedAndActivateUser(record.id, record.userId);
      await cleanupTokens(email, record.id);
    }
    
    return NextResponse.redirect(new URL('/login?verified=true', req.url));
    
  } catch (error) {
    logger.error("Erro ao processar verificação", { error });
    return NextResponse.redirect(new URL('/auth/error?error=server_error', req.url));
  }
}

/**
 * Handler para verificação de token por POST (API)
 */
export async function POST(req: NextRequest) {
  // Aplicar rate limiting (max 3 tentativas por minuto)
  const rateLimit = rateLimiter(req, {
    maxRequests: 3,
    windowMs: 60 * 1000,
    message: "Muitas tentativas de verificação. Tente novamente em 1 minuto."
  });
  
  if (rateLimit) return rateLimit;
  
  try {
    // Validar CSRF token
    const csrfToken = req.headers.get("X-CSRF-Token");
    const cookieStore = cookies();
    
    if (!validateCsrfToken(await cookieStore, csrfToken)) {
      return NextResponse.json(
        { error: "Solicitação inválida" },
        { status: 403 }
      );
    }
    
    // Obter dados do corpo da requisição
    const body = await req.json();
    const { token, email } = body;
    
    if (!token || !email) {
      return NextResponse.json(
        { error: "Token e email são obrigatórios" },
        { status: 400 }
      );
    }
    
    // Verificar o token
    const { record: verificationData, alreadyVerified } = await verifyToken(token, email);
    
    if (!verificationData) {
      logger.warn({ email }, "Tentativa de verificação com token inválido ou expirado");
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 400 }
      );
    }
    
    // Se já foi verificado, apenas retornar sucesso
    if (alreadyVerified) {
      return NextResponse.json({ success: true, message: "Email já verificado" });
    }
    
    await markTokenAsVerifiedAndActivateUser(verificationData.id, verificationData.userId);
    await cleanupTokens(email, verificationData.id);
    
    return NextResponse.json({ 
      success: true, 
      message: "Email verificado com sucesso" 
    });
    
  } catch (error) {
    logger.error("Erro ao processar verificação de email", { error });
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
} 