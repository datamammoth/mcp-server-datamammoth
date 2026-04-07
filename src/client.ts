// ─── DataMammoth API Client ───

import type { ApiResponse } from './types.js';

export class DMClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.DM_API_KEY ?? '';
    this.baseUrl = process.env.DM_BASE_URL || 'https://app.datamammoth.com/api/v2';

    if (!this.apiKey) {
      throw new Error(
        'DM_API_KEY environment variable is required. ' +
        'Set it in your MCP server configuration or export it in your shell.'
      );
    }
  }

  private async request<T>(
    method: string,
    path: string,
    options?: {
      params?: Record<string, string | undefined>;
      body?: unknown;
    }
  ): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseUrl}${path}`);

    if (options?.params) {
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined && value !== '') {
          url.searchParams.set(key, value);
        }
      }
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/json',
      'User-Agent': 'datamammoth-mcp/0.1.0',
    };

    if (options?.body) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let message: string;
      try {
        const parsed = JSON.parse(errorBody);
        message = parsed.message || parsed.error || errorBody;
      } catch {
        message = errorBody;
      }
      throw new Error(`API Error ${response.status}: ${message}`);
    }

    return response.json() as Promise<ApiResponse<T>>;
  }

  async get<T>(path: string, params?: Record<string, string | undefined>): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, { params });
  }

  async post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, { body });
  }

  async put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, { body });
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path);
  }
}

let clientInstance: DMClient | null = null;

export function getClient(): DMClient {
  if (!clientInstance) {
    clientInstance = new DMClient();
  }
  return clientInstance;
}
