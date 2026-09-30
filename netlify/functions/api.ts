import serverless from 'serverless-http';
import { createApiApp } from '../../server';

const app = createApiApp();

export const handler = async (event: Parameters<ReturnType<typeof serverless>>[0], context: Parameters<ReturnType<typeof serverless>>[1]) => {
  return serverless(await app)(event, context);
};