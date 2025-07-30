import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api-prod.meucliente.app.br/api/Cliente/completo');
        
        if (!response.ok) {
          throw new Error('Erro ao buscar clientes');
        }
        
        const data = await response.json();
        setClientes(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setClientes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  return { clientes, loading, error };
}