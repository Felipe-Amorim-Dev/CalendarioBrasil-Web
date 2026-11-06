export interface DatabricksStatus {
  configurado: boolean;
  testeDisponivel: boolean;
  mensagem: string;
}

export interface DatabricksTeste {
  conectado: boolean;
  mensagem: string;
}