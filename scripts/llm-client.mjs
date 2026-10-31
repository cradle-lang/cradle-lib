import {readFile} from 'node:fs/promises';
import {parseEnv} from 'node:util';

export async function loadLlmEnv(filename, env = process.env) {
  let content;
  try {content = await readFile(filename, 'utf8');} catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  for (const [key, value] of Object.entries(parseEnv(content))) {
    if (env[key] === undefined) env[key] = value;
  }
}

export function llmConfig(env = process.env) {
  const remote = env.SERVER?.trim();
  if (!remote && env.LOCAL_LLM_MODEL?.trim()) throw new Error('Direct Hugging Face loading is not supported. Serve the local model through an OpenAI-compatible SERVER endpoint.');
  const url = new URL(remote || env.OPENAI_BASE_URL || 'https://api.openai.com/v1');
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('SERVER must be an HTTP(S) API base URL without embedded credentials, query or fragment.');
  const key = (remote ? env.REMOTE_LLM_API_KEY : env.OPENAI_API_KEY)?.trim();
  if (!remote && !key) throw new Error('Set SERVER for remote mode, or OPENAI_API_KEY and OPENAI_MODEL for OpenAI mode.');
  return {
    baseUrl: url.href.replace(/\/+$/, ''),
    apiKey: key,
    model: (remote ? env.REMOTE_LLM_MODEL : env.OPENAI_MODEL)?.trim(),
    remote: Boolean(remote),
  };
}

export async function completeArticle(messages, {env = process.env, fetchImpl = fetch} = {}) {
  const config = llmConfig(env);
  const headers = {'Content-Type': 'application/json'};
  if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;
  async function request(route, options = {}) {
    let response;
    try {
      response = await fetchImpl(`${config.baseUrl}/${route}`, {
        ...options, headers, redirect: 'error', signal: AbortSignal.timeout(120000),
      });
    } catch (error) {
      const code = String(error.cause?.code || error.name || 'network error').replace(/[^A-Za-z0-9_-]/g, '');
      throw new Error(`LLM request failed (${code}). Check SERVER, network access, certificates and server availability.`);
    }
    // Do not echo response bodies: gateways can include credentials or prompt data.
    if (!response.ok) throw new Error(`LLM returned HTTP ${response.status}. Check endpoint, model and API key in .env.`);
    try {return await response.json();} catch {throw new Error('LLM endpoint returned invalid JSON.');}
  }
  let model = config.model;
  if (!model && config.remote) {
    const models = await request('models');
    model = models.data?.[0]?.id;
  }
  if (typeof model !== 'string' || !model.trim()) throw new Error('Set REMOTE_LLM_MODEL (or OPENAI_MODEL); no usable model was configured/discovered.');
  const response = await request('chat/completions', {
    method: 'POST', body: JSON.stringify({model, messages, stream: false}),
  });
  const choice = response.choices?.[0];
  if (choice?.finish_reason && choice.finish_reason !== 'stop') throw new Error(`LLM did not finish the article normally (${choice.finish_reason}). Existing article preserved.`);
  if (typeof choice?.message?.content !== 'string' || !choice.message.content.trim()) throw new Error('LLM returned no article text.');
  return {text: choice.message.content, model};
}
