// src/api/ApiClient.ts
type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface ServerResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

interface RequestOptions {
  params?: Record<string, any>;
  body?: any;
  headers?: HeadersInit;
}

class ApiClient {
  private static instance: ApiClient;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = 'https://localhost:8080/api';
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private buildUrl(path: string, params?: Record<string, any>): string {
    const url = new URL(this.baseUrl + path);
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async request<T>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<ServerResponse<T>>  {
    const { params, body, headers } = options;
    const url = this.buildUrl(path, params);

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch {
        // ignore JSON parsing errors
      }

      switch (response.status) {
        case 400:
          throw new Error(errorMessage || 'Bad Request');
        case 401:
          throw new Error('Unauthorized');
        case 403:
          throw new Error('Forbidden');
        case 404:
          throw new Error('Not Found');
        case 500:
          throw new Error('Internal Server Error');
        default:
          throw new Error(errorMessage || 'Something went wrong');
      }
    }

    // If 204 No Content
    if (response.status === 204) {
      return {
        success: true,
        message: "No Content",
        data: null as T,
      };
    }

    const json = (await response.json()) as ServerResponse<T>;
    return json;
  }

  // Public methods
  public get<T>(path: string, params?: Record<string, any>, headers?: HeadersInit) {
    return this.request<T>('GET', path, { params, headers });
  }

  public post<T>(path: string, body?: any, headers?: HeadersInit) {
    return this.request<T>('POST', path, { body, headers });
  }

  public patch<T>(path: string, body?: any, headers?: HeadersInit) {
    return this.request<T>('PATCH', path, { body, headers });
  }

  public delete<T>(path: string, params?: Record<string, any>, headers?: HeadersInit) {
    return this.request<T>('DELETE', path, { params, headers });
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();
