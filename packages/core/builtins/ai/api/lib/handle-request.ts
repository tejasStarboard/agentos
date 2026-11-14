import { embed, generateImage, generateText } from 'ai';

import type { AiModels } from './create-model';
import type { FetchLike } from './fetch-like';
import { fetchAgentRegistry, runChat } from './run-chat';

export type AiHandlerContext = {
  models: AiModels;
  gatewayUrl: string;
  fetchImpl?: FetchLike;
};

function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/json; charset=utf-8');
  }
  return new Response(JSON.stringify(data), { ...init, headers });
}

async function readJsonBody(
  request: Request,
): Promise<Record<string, unknown> | null> {
  try {
    const body = (await request.json()) as unknown;
    if (body && typeof body === 'object' && !Array.isArray(body)) {
      return body as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

function readPrompt(body: Record<string, unknown> | null): string | null {
  if (!body) return null;
  if (typeof body.prompt === 'string' && body.prompt.length > 0) {
    return body.prompt;
  }
  if (typeof body.message === 'string' && body.message.length > 0) {
    return body.message;
  }
  if (typeof body.text === 'string' && body.text.length > 0) {
    return body.text;
  }
  return null;
}

/**
 * Thin Bun request router for `/api/ext/ai/*` upstream paths.
 */
export async function handleAiRequest(
  ctx: AiHandlerContext,
  request: Request,
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const method = request.method.toUpperCase();
  const fetchImpl = ctx.fetchImpl ?? fetch;

  if (method === 'GET' && path === '/health') {
    return json({ ok: true, mode: ctx.models.mode });
  }

  if (method !== 'POST') {
    return json({ error: 'not found' }, { status: 404 });
  }

  try {
    switch (path) {
      case '/generate-text': {
        const body = await readJsonBody(request);
        const prompt = readPrompt(body);
        if (!prompt) {
          return json({ error: 'prompt required' }, { status: 400 });
        }
        const result = await generateText({
          model: ctx.models.language,
          prompt,
          ...(typeof body?.temperature === 'number'
            ? { temperature: body.temperature }
            : {}),
          ...(typeof body?.maxTokens === 'number'
            ? { maxOutputTokens: body.maxTokens }
            : {}),
        });
        return json({ text: result.text });
      }
      case '/generate-image': {
        const body = await readJsonBody(request);
        const prompt = readPrompt(body);
        if (!prompt) {
          return json({ error: 'prompt required' }, { status: 400 });
        }
        const result = await generateImage({
          model: ctx.models.image,
          prompt,
        });
        const first = result.images[0];
        return json({
          stub: ctx.models.mode === 'mock',
          mediaType: first?.mediaType ?? 'image/png',
          base64: first
            ? Buffer.from(first.uint8Array).toString('base64')
            : null,
        });
      }
      case '/embed': {
        const body = await readJsonBody(request);
        const value =
          typeof body?.value === 'string'
            ? body.value
            : typeof body?.text === 'string'
              ? body.text
              : null;
        if (!value) {
          return json({ error: 'value required' }, { status: 400 });
        }
        const result = await embed({
          model: ctx.models.embedding,
          value,
        });
        return json({
          embedding: result.embedding,
          stub: ctx.models.mode === 'mock',
        });
      }
      case '/chat': {
        const body = await readJsonBody(request);
        const prompt = readPrompt(body);
        if (!prompt) {
          return json({ error: 'prompt required' }, { status: 400 });
        }
        const registry =
          body?.registry &&
          typeof body.registry === 'object' &&
          !Array.isArray(body.registry)
            ? (body.registry as Awaited<ReturnType<typeof fetchAgentRegistry>>)
            : await fetchAgentRegistry(ctx.gatewayUrl, fetchImpl);
        const result = await runChat({
          prompt,
          models: ctx.models,
          gatewayUrl: ctx.gatewayUrl,
          registry,
          fetchImpl,
        });
        return json({
          text: result.text,
          toolNames: result.toolNames,
        });
      }
      default:
        return json({ error: 'not found' }, { status: 404 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return json({ error: message }, { status: 500 });
  }
}
