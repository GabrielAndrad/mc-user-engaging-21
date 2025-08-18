class ApiService {
  private baseLocal = 'http://localhost:5009/api';
  private baseProd = 'https://api-prod.meucliente.app.br';
  private baseDev = 'https://api-dev.meucliente.app.br/api';
  private baseKoch = 'https://api-koch.meucliente.app.br/api';
  private baseHml = 'https://api-hml.meucliente.app.br';
  private accessToken: string | null = null;
  
  private get baseURL() {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    if (currentUrl.includes('localhost')) {
      return this.baseLocal;
    }
    if (currentUrl.includes('koch')) {
      return this.baseKoch;
    }
    if (currentUrl.includes('dev')) {
      return this.baseDev;
    }
    if (currentUrl.includes('hml')) {
      return this.baseHml;
    }
    // Default para produção
    return this.baseProd;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const apiService = new ApiService();