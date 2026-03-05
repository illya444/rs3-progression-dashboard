import pino from "pino";
import pinoHttp from "pino-http";
import { config } from "./config/config.js";

type MetricsState = {
  startedAt: number;
  requestsTotal: number;
  requests4xx: number;
  requests5xx: number;
  upstreamFailures: number;
  fallbackResponses: number;
  byRoute: Record<string, number>;
};

const metrics: MetricsState = {
  startedAt: Date.now(),
  requestsTotal: 0,
  requests4xx: 0,
  requests5xx: 0,
  upstreamFailures: 0,
  fallbackResponses: 0,
  byRoute: {}
};

export const logger = pino({
  level: config.logLevel,
  timestamp: pino.stdTimeFunctions.isoTime
});

export const httpLogger = pinoHttp({ logger });

export function recordRequest(route: string, statusCode: number): void {
  metrics.requestsTotal += 1;
  metrics.byRoute[route] = (metrics.byRoute[route] ?? 0) + 1;
  if (statusCode >= 400 && statusCode < 500) metrics.requests4xx += 1;
  if (statusCode >= 500) metrics.requests5xx += 1;
}

export function recordUpstreamFailure(source: string, error: unknown): void {
  metrics.upstreamFailures += 1;
  logger.warn(
    {
      source,
      error: error instanceof Error ? { name: error.name, message: error.message } : error
    },
    "upstream_request_failed"
  );
}

export function recordFallbackResponse(source: string): void {
  metrics.fallbackResponses += 1;
  logger.info({ source }, "serving_fallback_response");
}

export function getMetricsSnapshot(): Record<string, unknown> {
  return {
    uptimeSeconds: Math.floor((Date.now() - metrics.startedAt) / 1000),
    ...metrics
  };
}
