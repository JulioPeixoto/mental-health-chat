import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

// Armazenamento em memória para limites de requisição
// Em produção, você deve usar Redis ou outro armazenamento distribuído
const ipRequestMap = new Map<string, { count: number, timestamp: number }>();

interface RateLimitConfig {
  maxRequests: number;  // Número máximo de requisições no período
  windowMs: number;     // Período de tempo em milissegundos
  message?: string;     // Mensagem de erro personalizada
}

/**
 * Middleware de limitação de taxa para rotas específicas
 * 
 * @param req Objeto de requisição Next.js
 * @param config Configuração do limitador de taxa
 * @returns NextResponse
 */
export function rateLimiter(
  req: NextRequest,
  config: RateLimitConfig = { maxRequests: 5, windowMs: 60 * 1000 }
): NextResponse | null {
  // Obter IP do cliente
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  
  // Obter timestamp atual
  const now = Date.now();
  
  // Obter registro atual do IP ou criar um novo
  const ipData = ipRequestMap.get(ip) || { count: 0, timestamp: now };
  
  // Resetar contador se a janela de tempo expirou
  if (now - ipData.timestamp > config.windowMs) {
    ipData.count = 0;
    ipData.timestamp = now;
  }
  
  // Incrementar contador de requisições
  ipData.count++;
  
  // Atualizar registro do IP
  ipRequestMap.set(ip, ipData);
  
  // Verificar se o limite foi excedido
  if (ipData.count > config.maxRequests) {
    // Limpar IPs antigos periodicamente para evitar vazamento de memória
    cleanupOldEntries(config.windowMs);
    
    // Registrar tentativa bloqueada
    logger.warn(`Rate limit excedido para IP: ${ip}`, {
      ip,
      count: ipData.count,
      path: req.nextUrl.pathname
    });
    
    // Retornar resposta de erro 429 (Too Many Requests)
    const errorMessage = config.message || "Muitas requisições, tente novamente em breve.";
    return new NextResponse(
      JSON.stringify({ error: errorMessage }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil(config.windowMs / 1000))
        }
      }
    );
  }
  
  // Se não excedeu o limite, não bloqueia a requisição
  return null;
}

/**
 * Limpa entradas antigas do mapa de IPs
 */
function cleanupOldEntries(windowMs: number): void {
  const now = Date.now();
  for (const [ip, data] of ipRequestMap.entries()) {
    if (now - data.timestamp > windowMs * 2) {
      ipRequestMap.delete(ip);
    }
  }
} 