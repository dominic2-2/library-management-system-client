import { ENV } from "@/config/env";
import { getBrowserInfo } from "@/utils/browserDetection";
import toast from "react-hot-toast";

interface RequestConfig {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  headers?: Record<string, string>;
  token?: string;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = ENV.apiUrl;
    this.timeout = 10000; // 10 seconds
  }

  // ✅ Add browser fingerprint headers to all requests
  private addBrowserHeaders(): Record<string, string> {
    if (typeof window === "undefined") {
      // Server-side rendering - return empty headers
      return {};
    }

    const browserInfo = getBrowserInfo();

    return {
      "X-Browser-Name": browserInfo.browserName,
      "X-Browser-Version": browserInfo.browserVersion,
      "X-Operating-System": browserInfo.operatingSystem,
      "X-Language": browserInfo.language,
      "X-Timezone": browserInfo.timezone,
      "X-Screen-Resolution": browserInfo.screenResolution,
    };
  }

  // ✅ Core request method with auto browser headers and error handling
  private async request<T>(
    endpoint: string,
    config: RequestConfig
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // ✅ Merge browser headers with custom headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.addBrowserHeaders(), // Auto-add browser fingerprint headers
      ...config.headers,
    };

    // Add authorization header if token provided
    if (config.token) {
      headers["Authorization"] = `Bearer ${config.token}`;
    }

    const requestOptions: RequestInit = {
      method: config.method,
      headers,
      body: config.body ? JSON.stringify(config.body) : undefined,
    };

    // ✅ FIX: Initialize timeoutId properly
    let timeoutId: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error("Request timeout")),
        this.timeout
      );
    });

    try {
      const response = (await Promise.race([
        fetch(url, requestOptions),
        timeoutPromise,
      ])) as Response;

      // ✅ FIX: Clear timeout safely
      if (timeoutId) clearTimeout(timeoutId);

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        // ✅ Handle browser fingerprint mismatch (401 with requireRelogin)
        if (response.status === 401 && responseData.requireRelogin === true) {
          console.warn(
            "🚨 Browser fingerprint mismatch detected:",
            responseData.message
          );
          this.handleBrowserFingerprintMismatch(responseData);
          throw new BrowserFingerprintMismatchError(
            responseData.message || "Browser fingerprint mismatch"
          );
        }

        throw new Error(
          responseData.message ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }

      // ✅ Log successful requests (only in development)
      if (process.env.NODE_ENV === "development") {
        console.log(`✅ API Success: ${config.method} ${endpoint}`, {
          browser: getBrowserInfo().browserName,
          status: response.status,
        });
      }

      return responseData;
    } catch (error) {
      // ✅ FIX: Clear timeout safely
      if (timeoutId) clearTimeout(timeoutId);

      if (error instanceof BrowserFingerprintMismatchError) {
        throw error; // Re-throw fingerprint mismatch errors
      }

      console.error(`❌ API Failed: ${config.method} ${endpoint}`, error);
      throw error;
    }
  }

  // ✅ Handle browser fingerprint mismatch
  private handleBrowserFingerprintMismatch(errorData: any) {
    if (typeof window === "undefined") return;

    // Clear all stored authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiration");
    localStorage.removeItem("sessionInfo");
    sessionStorage.clear();

    // Show security notification
    toast.error(
      "🔒 Security Alert: Browser fingerprint mismatch. Redirecting to login...",
      {
        duration: 4000,
      }
    );

    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = "/auth/login";
    }, 2000);
  }

  // ✅ HTTP Methods
  async get<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", token });
  }

  async post<T>(endpoint: string, body?: any, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body, token });
  }

  async put<T>(endpoint: string, body?: any, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body, token });
  }

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", token });
  }

  async patch<T>(endpoint: string, body?: any, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", body, token });
  }
}

// ✅ Custom error class for browser fingerprint mismatch
export class BrowserFingerprintMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BrowserFingerprintMismatchError";
  }
}

// ✅ Export singleton instance
export const apiClient = new ApiClient();
