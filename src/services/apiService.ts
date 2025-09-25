class ApiService {
  private baseLocal = 'http://localhost:5009/api';
  private baseProd = 'https://api-prod.meucliente.app.br';
  private baseDev = 'https://api-dev.meucliente.app.br/api';
  private baseKoch = 'https://api-koch.meucliente.app.br/api';
  private baseHml = 'https://api-hml.meucliente.app.br';
  private accessToken: string | null = null;

  private parentUrl: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Verifica se está em iframe
      const isInIframe = window !== window.parent;
      
      if (isInIframe) {
        // Se está em iframe, captura a URL do pai através do referrer
        this.parentUrl = document.referrer;
        console.log("URL do pai capturada via referrer:", this.parentUrl);
        
        // Também escuta mensagens do pai caso seja enviada explicitamente
        window.addEventListener("message", (event: MessageEvent) => {
          if (event.origin.includes("meucliente.app.br") && event.data?.parentUrl) {
            this.parentUrl = event.data.parentUrl;
            console.log("URL do pai atualizada via postMessage:", this.parentUrl);
          }
        });
        
        // Solicita a URL do pai
        window.parent.postMessage({ type: "REQUEST_PARENT_URL" }, "*");
      } else {
        // Se não está em iframe, usa a URL atual
        this.parentUrl = window.location.href;
        console.log("Usando URL atual (não está em iframe):", this.parentUrl);
      }
    }
  }

  private get baseURL() {
    const currentUrl = this.parentUrl || window.location.href;
    
    console.log('Determinando baseURL a partir de:', currentUrl);

    if (currentUrl.includes('localhost')) {
      console.log('Usando baseLocal:', this.baseLocal);
      return this.baseLocal;
    }
    if (currentUrl.includes('koch')) {
      console.log('Usando baseKoch:', this.baseKoch);
      return this.baseKoch;
    }
    if (currentUrl.includes('stage')) {
      console.log('Usando baseDev (stage):', this.baseDev);
      return this.baseDev;
    }
    if (currentUrl.includes('dev')) {
      console.log('Usando baseDev:', this.baseDev);
      return this.baseDev;
    }
    if (currentUrl.includes('hml')) {
      console.log('Usando baseHml:', this.baseHml);
      return this.baseHml;
    }
    
    console.log('Usando baseProd (default):', this.baseProd);
    return this.baseProd;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
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
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }
}

export const apiService = new ApiService();
