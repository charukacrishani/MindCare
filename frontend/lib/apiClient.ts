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
    this.baseUrl = '/api';
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private buildUrl(path: string, params?: Record<string, any>): string {
    // Ensure baseUrl always ends with '/'
    const base = this.baseUrl.endsWith('/') ? this.baseUrl : this.baseUrl + '/';

    // Ensure path does not start with '/', so we don't get double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    const backend = (process.env.NEXT_PUBLIC_BACKEND || window.location.origin) as string;
    const url = new URL(base + cleanPath, backend);

    // Append query params
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async request<T>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<ServerResponse<T>> {
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
      let errorData: any = null;

      try {
        errorData = await response.json();
        // pull message from nested detail if necessary
        errorMessage =
          errorData?.message ||
          errorData?.detail?.message ||
          errorMessage;
      } catch {
        // ignore JSON parsing errors
      }

      // if server sent a redirect instruction, perform it immediately
      if (
        errorData?.detail?.redirect?.value === true &&
        errorData?.detail?.redirect?.url
      ) {
        // Don't redirect if we're already on an auth page to prevent redirect loops
        const currentPath = window.location.pathname;
        const authPaths = ['/signin', '/signup', '/forgot-password'];
        if (!authPaths.includes(currentPath)) {
          // navigate before throwing so caller doesn't continue
          window.location.href = errorData.detail.redirect.url;
        }
        // return a rejected promise so callers can still handle the error if needed
        return Promise.reject(
          new Error(errorMessage || 'Redirecting…')
        ) as unknown as ServerResponse<T>;
      }

      switch (response.status) {
        case 400:
          throw new Error(errorMessage || 'Bad Request');
        case 401:
          throw new Error('Unauthorized');
        case 403:
          throw new Error(errorMessage || 'Forbidden');
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
