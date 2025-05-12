import { NextAuthConfig } from 'next-auth';
import { publicRoutes, authRoutes, defaultLoginRedirect } from '@/lib/routes';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      
      // Verificar se a rota atual é uma rota de autenticação (login/registro)
      const isAuthRoute = authRoutes.some(route => 
        pathname === route || pathname.startsWith(route + '/')
      );
      
      // Verificar se a rota atual é uma rota pública
      const isPublicRoute = publicRoutes.some(route => {
        if (route.endsWith('*')) {
          // Para rotas com wildcard
          const baseRoute = route.slice(0, -1);
          return pathname === baseRoute || pathname.startsWith(baseRoute);
        }
        return pathname === route;
      });
      
      // Redirecionar usuários autenticados tentando acessar páginas de auth
      if (isLoggedIn && isAuthRoute) {
        return Response.redirect(new URL(defaultLoginRedirect, nextUrl));
      }
      
      // Sempre permitir acesso a rotas públicas
      if (isPublicRoute) {
        return true;
      }
      
      // Permitir acesso a todas as outras rotas apenas se estiver logado
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
