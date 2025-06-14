
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Upload, CheckCircle, AlertCircle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TrelloCard {
  name: string;
}

interface TrelloList {
  name: string;
  cards: TrelloCard[];
}

interface TrelloBoard {
  name: string;
  lists: TrelloList[];
}

const Index = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [parsedBoard, setParsedBoard] = useState<TrelloBoard | null>(null);
  const [isValidJson, setIsValidJson] = useState(true);
  const [trelloApiFormat, setTrelloApiFormat] = useState('');
  const { toast } = useToast();

  const sampleJson = `{
  "name": "Fin Aii - MVP",
  "lists": [
    {
      "name": "To Do",
      "cards": [
        {
          "name": "🔐 Autenticação (Firebase)"
        },
        {
          "name": "Implementar cadastro de usuário"
        }
      ]
    },
    {
      "name": "Doing",
      "cards": []
    },
    {
      "name": "Done",
      "cards": []
    }
  ]
}`;

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    
    if (!value.trim()) {
      setParsedBoard(null);
      setIsValidJson(true);
      setTrelloApiFormat('');
      return;
    }

    try {
      const parsed = JSON.parse(value);
      if (parsed.name && Array.isArray(parsed.lists)) {
        setParsedBoard(parsed);
        setIsValidJson(true);
        generateTrelloApiFormat(parsed);
      } else {
        setIsValidJson(false);
        setParsedBoard(null);
        setTrelloApiFormat('');
      }
    } catch (error) {
      setIsValidJson(false);
      setParsedBoard(null);
      setTrelloApiFormat('');
    }
  };

  const generateTrelloApiFormat = (board: TrelloBoard) => {
    const apiFormat = {
      name: board.name,
      desc: `Board importado automaticamente - ${new Date().toLocaleDateString()}`,
      defaultLists: false,
      prefs_permissionLevel: "private",
      lists: board.lists.map((list, listIndex) => ({
        name: list.name,
        pos: listIndex + 1,
        cards: list.cards.map((card, cardIndex) => ({
          name: card.name,
          pos: cardIndex + 1,
          desc: ""
        }))
      }))
    };
    
    setTrelloApiFormat(JSON.stringify(apiFormat, null, 2));
  };

  const loadSample = () => {
    setJsonInput(sampleJson);
    handleJsonChange(sampleJson);
    toast({
      title: "JSON de exemplo carregado!",
      description: "Você pode editar este exemplo ou colar seu próprio JSON.",
    });
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: `${type} copiado para a área de transferência.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar para a área de transferência.",
        variant: "destructive",
      });
    }
  };

  const downloadJson = (data: string, filename: string) => {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download iniciado!",
      description: `Arquivo ${filename} baixado com sucesso.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Trello JSON Importer
          </h1>
          <p className="text-gray-600 text-lg">
            Transforme seu JSON em um board do Trello facilmente
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Importar JSON
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button 
                    onClick={loadSample}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Carregar Exemplo
                  </Button>
                </div>
                
                <Textarea
                  placeholder="Cole seu JSON aqui..."
                  value={jsonInput}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  rows={12}
                  className={`font-mono text-sm resize-none ${
                    !isValidJson ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
                
                {!isValidJson && jsonInput && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    JSON inválido. Verifique a sintaxe.
                  </div>
                )}
                
                {isValidJson && parsedBoard && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    JSON válido! Board "{parsedBoard.name}" detectado.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Visualização do Board
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {parsedBoard ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {parsedBoard.name}
                    </h3>
                    <Badge variant="secondary">
                      {parsedBoard.lists.length} listas
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {parsedBoard.lists.map((list, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-white/50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-700">
                            {list.name}
                          </h4>
                          <Badge variant="outline">
                            {list.cards.length} cards
                          </Badge>
                        </div>
                        
                        {list.cards.length > 0 && (
                          <div className="space-y-1">
                            {list.cards.map((card, cardIndex) => (
                              <div 
                                key={cardIndex}
                                className="text-sm text-gray-600 bg-white rounded px-2 py-1 border-l-2 border-blue-400"
                              >
                                {card.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Cole um JSON válido para visualizar o board</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Trello API Format Section */}
        {trelloApiFormat && (
          <Card className="mt-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Formato API do Trello
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    onClick={() => copyToClipboard(trelloApiFormat, 'Formato API')}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar JSON
                  </Button>
                  <Button 
                    onClick={() => downloadJson(trelloApiFormat, 'trello-import.json')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download JSON
                  </Button>
                </div>
                
                <Textarea
                  value={trelloApiFormat}
                  rows={8}
                  readOnly
                  className="font-mono text-sm bg-gray-50"
                />
                
                <div className="text-sm text-gray-600 space-y-2">
                  <p className="font-semibold">Como usar:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Copie o JSON formatado acima</li>
                    <li>Use a API do Trello para criar o board</li>
                    <li>Ou importe manualmente no Trello usando ferramentas de terceiros</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Como usar este importador
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <span className="font-medium">Importar</span>
                </div>
                <p>Cole seu JSON na área de texto ou use o exemplo fornecido para testar.</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <span className="font-medium">Visualizar</span>
                </div>
                <p>Confira a estrutura do board, listas e cards na visualização lateral.</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <span className="font-medium">Exportar</span>
                </div>
                <p>Baixe ou copie o JSON formatado para usar com a API do Trello.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
