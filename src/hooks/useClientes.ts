import { useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';
import { useAccessToken } from './useAccessToken';

interface Cliente {
  ClienteId: number;
  ClientePaiId: number;
  NomeEmpresa: string;
  CnpjEmpresa: string;
  IsRevenda: boolean;
  Endereco: string;
  Numero: number;
  Complemento: string;
  Bairro: string;
  Cep: string;
  Cidade: string;
  Uf: string;
  LogoSmall: string;
  LogoBig: string;
  UsuarioId: number;
  NomeUsuario: string;
  EmailUsuario: string;
  CpfUsuario: string;
  Observacoes: string | null;
  Ativo: boolean;
  Funcoes: any;
}

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const accessToken = useAccessToken();

  useEffect(() => {
    const fetchClientes = async () => {
      if (!accessToken) return;
      
      try {
        setLoading(true);
        apiService.setAccessToken(accessToken);
        const data = await apiService.get<Cliente[]>('/Cliente/completo');
        setClientes(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar clientes');
        setClientes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, [accessToken]);

  return { clientes, loading, error };
}