import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);

  if (url.pathname.startsWith('/dashboard')) {
    const sessionCookie = context.cookies.get('jsos_session')?.value;

    if (!sessionCookie) {
      return context.redirect('/login');
    }

    const kv = context.locals.runtime.env.SESSION;
    const sessionData = await kv.get(sessionCookie);

    if (!sessionData) {
      context.cookies.delete('jsos_session', { path: '/' });
      return context.redirect('/login');
    }
  }

  return next();
});
