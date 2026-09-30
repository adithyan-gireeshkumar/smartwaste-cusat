import serverless from 'serverless-http';
import { createApiApp } from '../../server';

const app = createApiApp();

export const handler = async (event: Parameters<ReturnType<typeof serverless>>[0], context: Parameters<ReturnType<typeof serverless>>[1]) => {
  const functionPrefix = '/.netlify/functions/api';
  const functionPath = event.path.startsWith(functionPrefix)
    ? event.path.slice(functionPrefix.length) || '/'
    : event.path;
  const path = functionPath === '/api' || functionPath.startsWith('/api/')
    ? functionPath
    : `/api${functionPath.startsWith('/') ? functionPath : `/${functionPath}`}`;

  return serverless(await app)({ ...event, path }, context);
};