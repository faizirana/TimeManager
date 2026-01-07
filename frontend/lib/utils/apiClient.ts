/**
 * Centralized API Client with Bearer Token Authentication
 *
 * Features:
 * - Automatically attaches Bearer token to requests
 * - Handles token refresh on 401 responses
 * - Provides type-safe HTTP methods (GET, POST, PUT, DELETE)
 * - Manages authentication lifecycle
 *
 * @example
 * ```typescript
 * const users = await apiClient.get<User[]>('/users');
 * const newUser = await apiClient.post<User>('/users', { name: 'John' });
 * ```
 */

interface ApiClientOptions extends RequestInit {
  /** Whether the request requires authentication (default: true) */
  requiresAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private getToken: (() => string | null) | null = null;
  private onUnauthorized: (() => void) | null = null;
  private refreshTokenFn: (() => Promise<string | null>) | null = null;

  /**
   * Creates a new API client instance
   * @param baseUrl - Base URL for all API requests (default: '/api')
   */
  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  /**
   * Sets the function to retrieve the current access token
   * @param getter - Function that returns the current token or null
   */
  setTokenGetter(getter: () => string | null) {
    this.getToken = getter;
  }

  /**
   * Sets the function to refresh the access token
   * @param refreshFn - Async function that refreshes and returns new token
   */
  setRefreshTokenFunction(refreshFn: () => Promise<string | null>) {
    this.refreshTokenFn = refreshFn;
  }

  /**
   * Sets the handler to call when user is unauthorized (e.g., logout)
   * @param handler - Function to execute on unauthorized access
   */
  setUnauthorizedHandler(handler: () => void) {
    this.onUnauthorized = handler;
  }

  /**
   * Internal fetch wrapper with automatic Bearer token injection and refresh logic
   * @param endpoint - API endpoint to call
   * @param options - Fetch options with optional auth requirement
   * @returns Response from the API
   */
  private async fetchWithAuth(endpoint: string, options: ApiClientOptions = {}): Promise<Response> {
    const { requiresAuth = true, headers = {}, ...restOptions } = options;

    const requestHeaders = new Headers(headers as HeadersInit);

    // Set default Content-Type if not provided
    if (!requestHeaders.has("Content-Type")) {
      requestHeaders.set("Content-Type", "application/json");
    }

    // Inject Bearer token if authentication is required
    if (requiresAuth && this.getToken) {
      const token = this.getToken();
      if (token) {
        requestHeaders.set("Authorization", `Bearer ${token}`);
      }
    }

    // Construct full URL
    const url = endpoint.startsWith("http") ? endpoint : `${this.baseUrl}${endpoint}`;

    // Execute initial request
    let response = await fetch(url, {
      ...restOptions,
      headers: requestHeaders,
    });

    // Handle token refresh on 401 Unauthorized
    if (response.status === 401 && requiresAuth && this.refreshTokenFn) {
      const newToken = await this.refreshTokenFn();

      if (newToken) {
        // Retry request with refreshed token
        requestHeaders.set("Authorization", `Bearer ${newToken}`);
        response = await fetch(url, {
          ...restOptions,
          headers: requestHeaders,
        });
      } else if (this.onUnauthorized) {
        // Call unauthorized handler if refresh failed (typically logout)
        this.onUnauthorized();
      }
    }

    return response;
  }

  /**
   * Performs a GET request
   * @param endpoint - API endpoint
   * @param options - Optional fetch options
   * @returns Parsed JSON response
   * @throws Error if request fails
   */
  async get<T>(endpoint: string, options?: ApiClientOptions): Promise<T> {
    const response = await this.fetchWithAuth(endpoint, {
      ...options,
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`GET ${endpoint} failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Performs a POST request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @param options - Optional fetch options
   * @returns Parsed JSON response
   * @throws Error if request fails
   */
  async post<T>(endpoint: string, data?: unknown, options?: ApiClientOptions): Promise<T> {
    const response = await this.fetchWithAuth(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message ?? `POST ${endpoint} failed`);
    }

    return response.json();
  }

  /**
   * Performs a PUT request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @param options - Optional fetch options
   * @returns Parsed JSON response
   * @throws Error if request fails
   */
  async put<T>(endpoint: string, data?: unknown, options?: ApiClientOptions): Promise<T> {
    const response = await this.fetchWithAuth(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`PUT ${endpoint} failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Performs a DELETE request
   * @param endpoint - API endpoint
   * @param options - Optional fetch options
   * @returns Parsed JSON response
   * @throws Error if request fails
   */
  async delete<T>(endpoint: string, options?: ApiClientOptions): Promise<T> {
    const response = await this.fetchWithAuth(endpoint, {
      ...options,
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`DELETE ${endpoint} failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
