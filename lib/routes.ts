/**
 * Este arquivo contém a configuração das rotas públicas e privadas da aplicação
 */

/**
 * Rotas públicas - acessíveis sem autenticação
 * Importante: Utilize padrões exatos ou com curinga no final (ex: '/api/public/*')
 */
export const publicRoutes = [
  '/login',
  '/register',
  '/verify',  // Rota para verificação de email
  '/api/verify',  // API de verificação de email
  '/auth/api/verify', // Considerando possível rota com prefixo /auth
];

/**
 * Rotas protegidas - requerem autenticação
 * (Todas as rotas protegidas específicas que devem exigir autenticação)
 */
export const protectedRoutes = [
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
];

/**
 * Rotas de autenticação - redirecionadas para a página principal se autenticado
 */
export const authRoutes = [
  '/login',
  '/register',
];

/**
 * Prefixo da rota de login
 */
export const loginURL = '/login';

/**
 * Prefixo da rota inicial após login bem-sucedido
 */
export const defaultLoginRedirect = '/'; 