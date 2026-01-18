import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { RequestOptions } from "https";
import {
  deleteAccessToken,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/entities/token";
import { adminService } from "@/entities/admin/api";

export class AxiosClient {
  private baseQueryV1Instance: AxiosInstance;

  constructor(baseURL: string, withAuth = false) {
    const config: AxiosRequestConfig = {
      baseURL,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    };

    this.baseQueryV1Instance = axios.create(config);

    if (withAuth) {
      this.addAuthInterceptor();
      this.addAuthResponseInterceptor();
    }
  }

  private addAuthInterceptor() {
    this.baseQueryV1Instance.interceptors.request.use((config) => {
      const token = getAccessToken();
      if (config && config.headers && token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      } else {
        deleteAccessToken();
      }

      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }

      return config;
    });
  }

  private redirectToAuth() {
    // window.location.href = `/${ERouteNames.AUTH_ROUTE}`;
  }

  public addAuthResponseInterceptor() {
    let isRefreshing = false;
    this.baseQueryV1Instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          if (isRefreshing) {
            await new Promise((resolve) => {
              const interval = setInterval(() => {
                if (!isRefreshing) {
                  clearInterval(interval);
                  resolve("");
                }
              }, 100);
            });
          }

          isRefreshing = true;

          try {
            const tokens = await adminService.refreshToken({
              refresh_token: getRefreshToken() ?? "",
            });
            setRefreshToken(tokens.refresh_token);
            setAccessToken(tokens.access_token);

            isRefreshing = false;
            return this.baseQueryV1Instance(originalRequest);
          } catch (error) {
            isRefreshing = false;
            this.redirectToAuth();
            return Promise.reject(error);
          }
        }

        if (error.response?.status === 401 || error.response?.status === 403) {
          this.redirectToAuth();
        }

        return Promise.reject(error);
      }
    );
  }

  private handleResponse<T>(response: AxiosResponse<T>): AxiosResponse<T> {
    return response;
  }

  private handleError(error: AxiosError<{ message?: string; detail?: string }>): never {
    const message = error.response?.data?.detail || 
                   error.response?.data?.message || 
                   error.message || 
                   "Error";
    throw new Error(message);
  }

  public async get<T>(
    url: string,
    params: Omit<RequestOptions, "body"> = {}
  ): Promise<AxiosResponse<T>> {
    try {
      const response = await this.baseQueryV1Instance.get<T>(url, { params });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError<{ message?: string }>);
    }
  }

  public async post<T>(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    try {
      const response = await this.baseQueryV1Instance.post<T>(
        url,
        data,
        config
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError<{ message?: string }>);
    }
  }

  public async put<T>(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    try {
      const response = await this.baseQueryV1Instance.put<T>(url, data, config);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError<{ message?: string }>);
    }
  }

  public async patch<T>(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    try {
      const response = await this.baseQueryV1Instance.patch<T>(
        url,
        data,
        config
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError<{ message?: string }>);
    }
  }

  public async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    try {
      const response = await this.baseQueryV1Instance.delete<T>(url, config);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError<{ message?: string }>);
    }
  }
}

export const axiosNoAuth = new AxiosClient("https://api.lascovo.ru/");
export const axiosAuth = new AxiosClient("https://api.lascovo.ru/", true);
