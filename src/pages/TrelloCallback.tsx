
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle } from "lucide-react";

const TrelloCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Extrair token da URL (tanto do hash quanto dos query params)
    const extractToken = () => {
      // Primeiro tentar do hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      let token = hashParams.get('token');
      
      // Se não encontrar no hash, tentar nos query params
      if (!token) {
        const urlParams = new URLSearchParams(window.location.search);
        token = urlParams.get('token');
      }
      
      return token;
    };

    const token = extractToken();
    
    console.log('TrelloCallback - URL completa:', window.location.href);
    console.log('TrelloCallback - Token encontrado:', token);

    if (token) {
      // Salvar o token no localStorage
      localStorage.setItem('trello_token', token);
      
      // Redirecionar de volta para a página principal com sucesso
      navigate('/?trello_success=true');
    } else {
      console.error('TrelloCallback - Nenhum token encontrado na URL');
      // Redirecionar de volta com erro
      navigate('/?trello_error=no_token');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
      <Card className="w-96 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Processando Login
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600">
            Finalizando sua autenticação com o Trello...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrelloCallback;
