import { HttpError } from '../middleware/errorHandler.js';
export function createAIService(config, fetchImpl = fetch) {
  // URL is configured by the operator, never taken from the request body.
  const url = config.AI_URL.replace(/\/+$/, '') + config.AI_PREDICT_PATH;
  return async input => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.AI_TIMEOUT_MS);
    try {
      const response = await fetchImpl(url, {
        method: 'POST', redirect: 'error', signal: controller.signal,
        headers: { 'Content-Type': 'application/json',
          ...(config.AI_API_KEY ? { Authorization: 'Bearer ' + config.AI_API_KEY } : {}) },
        body: JSON.stringify(input)
      });
      if (!response.ok) throw new HttpError(502, 'AI service returned an error');
      const result = await response.json();
      if (!result || typeof result !== 'object' || Array.isArray(result)) {
        throw new HttpError(502, 'AI service must return a JSON object');
      }
      return result;
    } catch (error) {
      if (controller.signal.aborted) throw new HttpError(504, 'AI service timed out');
      if (error instanceof HttpError) throw error;
      throw new HttpError(502, 'AI service unreachable or returned invalid JSON');
    } finally { clearTimeout(timer); }
  };
}
