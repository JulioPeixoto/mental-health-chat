import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateCsrfToken } from "@/lib/csrf";
import { rateLimiter } from "@/middlewares/rate-limiter";
import { logger } from "@/lib/logger";
import { verifyToken, markTokenAsVerified, cleanupTokens } from "@/db/verification.repository";

/**
 * Handler para verificação de token por GET (link de email)
 */
export async function GET(req: NextRequest) {
  // Aplicar rate limiting (max 5 tentativas por minuto)
  const rateLimit = rateLimiter(req, {
    maxRequests: 5,
    windowMs: 60 * 1000,
    message: "Muitas tentativas de verificação. Tente novamente em 1 minuto."
  });
  
  if (rateLimit) return rateLimit;
  
  try {
    // Obter parâmetros da URL
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const email = url.searchParams.get('email');
    
    if (!token || !email) {
      logger.warn("Tentativa de verificação sem token ou email");
      // Redirecionar para a página de erro
      return NextResponse.redirect(new URL('/auth/error?error=invalid_params', req.url));
    }
    
    // Verificar o token
    const { record: verificationData, alreadyVerified } = await verifyToken(token, email);
    
    if (!verificationData) {
      logger.warn({ email }, "Tentativa de verificação com token inválido ou expirado via GET");
      // Redirecionar para a página de erro
      return NextResponse.redirect(new URL('/auth/error?error=invalid_token', req.url));
    }
    
    // Se já foi verificado, redirecionar para login com sucesso
    if (alreadyVerified) {
      logger.info({ email }, "Email já foi verificado anteriormente via GET");
      return NextResponse.redirect(new URL('/login?verified=true', req.url));
    }
    
    // Marcar o token como verificado
    await markTokenAsVerified(verificationData.id);
    await cleanupTokens(email, verificationData.id);
    
    logger.info({ email }, "Email verificado com sucesso via GET");
    // Redirecionar para página de login com sucesso
    return NextResponse.redirect(new URL('/login?verified=true', req.url));
    
  } catch (error) {
    logger.error("Erro ao processar verificação de email via GET", { error });
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
      logger.warn("Tentativa de verificação sem token CSRF válido");
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
      logger.info({ email }, "Email já foi verificado anteriormente");
      return NextResponse.json({ success: true, message: "Email já verificado" });
    }
    
    // Marcar o token como verificado
    await markTokenAsVerified(verificationData.id);
    await cleanupTokens(email, verificationData.id);
    
    logger.info({ email }, "Email verificado com sucesso via API");
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