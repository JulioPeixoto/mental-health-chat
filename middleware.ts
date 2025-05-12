import NextAuth from "next-auth";
import { authConfig } from "@/app/(auth)/auth.config";

export default NextAuth(authConfig).auth;

/**
 * Configura quais rotas são processadas pelo middleware
 */
export const config = {
  matcher: [
    // Rotas protegidas
    '/',
    '/:id',
    '/chat/:path*',
    '/api/chat/:path*',
    '/api/agent/:path*',
    '/api/document/:path*',
    '/api/files/:path*',
    '/api/history/:path*',
    '/api/suggestions/:path*',
    '/api/vote/:path*',
    
    // Rotas públicas
    '/login',
    '/register',
    '/verify',
    '/api/verify',
    '/auth/api/verify',
  ],
};
