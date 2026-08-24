import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

const SampleRequest = z.object({ sample: z.string().max(2048) }).passthrough();
const SuccessResponse = z
  .object({ success: z.boolean(), message: z.string() })
  .passthrough();

export const schemas = {
  SampleRequest,
  SuccessResponse,
};

const endpoints = makeApi([
  {
    method: 'get',
    path: '/health',
    alias: 'getHealth',
    requestFormat: 'json',
    response: z
      .object({ success: z.boolean(), message: z.string() })
      .passthrough(),
  },
  {
    method: 'get',
    path: '/sample-endpoint',
    alias: 'getSampleEndpoint',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({ sample: z.string().max(2048) }).passthrough(),
      },
    ],
    response: SuccessResponse,
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
