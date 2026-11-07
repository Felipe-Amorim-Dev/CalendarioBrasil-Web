<img src="doc/Calendário Brasil_ Banner.png" alt="Capa" width="1920px" align="center">

# CalendarioBrasil-Web

Interface web para consulta e visualização de feriados nacionais e estaduais brasileiros, desenvolvida em **Angular 22**, TypeScript e SCSS, com integração à API CalendarioBrasil em .NET 10.

O projeto permite explorar calendários anuais, consultar múltiplas Unidades Federativas (UFs), filtrar feriados por abrangência e visualizar informações sobre suas respectivas bases legais.

## Visão geral

O CalendarioBrasil-Web foi desenvolvido para oferecer uma experiência de consulta visual aos feriados brasileiros, utilizando a API CalendarioBrasil como fonte para o cálculo e a identificação das datas.

Ao iniciar a aplicação, o calendário apresenta automaticamente o ano vigente e seus feriados nacionais. A seleção de uma ou mais UFs permite incorporar os feriados estaduais correspondentes.

A interface também permite navegar entre diferentes anos, identificar feriados coincidentes e consultar informações sobre cobertura e projeções legais.

## Funcionalidades

### Calendário anual

- Visualização dos 12 meses do ano.
- Inicialização automática no ano vigente.
- Navegação entre anos históricos e futuros.
- Suporte ao intervalo de 1583 a 9999, conforme a API.
- Identificação visual dos feriados no calendário.
- Destaque para a data atual.
- Seleção de datas para visualizar detalhes.

### Feriados nacionais e estaduais

- Consulta automática dos feriados nacionais.
- Seleção individual ou múltipla de UFs.
- Suporte às 27 Unidades Federativas.
- Pesquisa de UFs por nome ou sigla.
- Atualização automática ao alterar o ano ou os estados selecionados.
- Preservação de feriados de diferentes abrangências na mesma data.

### Filtros de visualização

O usuário pode escolher entre três modos de exibição:

| Filtro | Comportamento |
|--------|---------------|
| Todos | Exibe feriados nacionais e estaduais das UFs selecionadas |
| Somente nacionais | Exibe exclusivamente os feriados nacionais |
| Somente estaduais | Exibe exclusivamente os feriados estaduais das UFs selecionadas |

Os filtros são aplicados localmente sobre os resultados recebidos, evitando requisições HTTP desnecessárias.

### Detalhamento dos feriados

Ao selecionar uma data, a aplicação apresenta:

- Nome do feriado.
- Data de ocorrência.
- Abrangência nacional ou estadual.
- UF correspondente, quando aplicável.
- Fundamento legal informado pela API.
- Data original, quando houver transferência.
- Situação da data, incluindo pendências de confirmação.

### Cobertura e projeções

A aplicação apresenta os avisos de cobertura disponibilizados pela API, incluindo limitações dos catálogos e informações sobre projeções históricas ou futuras.

Os feriados estaduais são calculados conforme as regras cadastradas e podem sofrer alterações legislativas.

Os resultados não substituem a consulta à legislação oficial aplicável.

## Tecnologias utilizadas

| Tecnologia | Finalidade |
|------------|------------|
| Angular 22 | Framework principal do front-end |
| TypeScript | Linguagem de desenvolvimento |
| SCSS | Estilização da aplicação e componentes |
| Angular Standalone Components | Organização modular da interface |
| Angular Signals | Gerenciamento reativo de estado |
| Angular HttpClient | Comunicação com o backend |
| RxJS | Tratamento de operações assíncronas |
| Vitest | Testes automatizados |
| Git e GitHub | Versionamento e organização do projeto |

### Backend

A aplicação consome a API CalendarioBrasil, desenvolvida em .NET 10.

Repositório: [Felipe-Amorim-Dev/CalendarioBrasil](https://github.com/Felipe-Amorim-Dev/CalendarioBrasil)

## Arquitetura

A aplicação utiliza componentes standalone, separando responsabilidades de apresentação, gerenciamento de estado, modelos de dados e comunicação HTTP.

### Fluxo de comunicação

    Navegador
        |
        v
    CalendarioBrasil-Web
        |
        | Angular HttpClient
        v
    API CalendarioBrasil (.NET 10)
        |
        +-- Feriados nacionais
        |
        +-- Catálogos estaduais
        |
        +-- Cálculo de datas móveis
        |
        +-- Avisos de cobertura
        |
        +-- Integração Databricks

O Angular é responsável pela apresentação e interação. As regras de cálculo e a definição dos feriados permanecem no backend.

### Organização dos componentes

**App**

Componente principal, responsável pelo estado global da consulta, seleção do ano, integração com os serviços HTTP e comunicação entre os componentes.

**CalendarioAnual**

Responsável pela construção e apresentação do calendário de 12 meses, destacando datas com feriados e emitindo eventos de seleção.

**FiltrosFeriados**

Responsável pela seleção de UFs, pesquisa de estados e aplicação dos filtros de abrangência.

**DetalhesFeriados**

Apresenta os feriados relacionados à data selecionada, incluindo abrangência, fundamento legal e informações de transferência.

**DatabricksPanel**

Apresenta o estado da configuração Databricks e disponibiliza o diagnóstico de conexão quando autorizado pelo backend.

## Estrutura de diretórios

    CalendarioBrasil-Web/
    |
    +-- public/
    |
    +-- src/
    |   |
    |   +-- app/
    |   |   |
    |   |   +-- components/
    |   |   |   +-- calendario-anual/
    |   |   |   +-- databricks-panel/
    |   |   |   +-- detalhes-feriados/
    |   |   |   +-- filtros-feriados/
    |   |   |
    |   |   +-- core/
    |   |   |   +-- data/
    |   |   |   |   +-- ufs.ts
    |   |   |   |
    |   |   |   +-- models/
    |   |   |   |   +-- calendario.model.ts
    |   |   |   |   +-- databricks.model.ts
    |   |   |   |
    |   |   |   +-- services/
    |   |   |       +-- calendario.service.ts
    |   |   |       +-- databricks.service.ts
    |   |   |
    |   |   +-- app.config.ts
    |   |   +-- app.html
    |   |   +-- app.scss
    |   |   +-- app.ts
    |   |
    |   +-- environments/
    |   |   +-- environment.ts
    |   |   +-- environment.development.ts
    |   |
    |   +-- main.ts
    |   +-- styles.scss
    |
    +-- angular.json
    +-- package.json
    +-- package-lock.json
    +-- proxy.conf.json
    +-- tsconfig.json
    +-- LICENSE
    +-- README.md

## Pré-requisitos

Para executar o front-end em ambiente de desenvolvimento, são necessários:

- Node.js em versão compatível com Angular 22.
- npm.
- Git.
- API CalendarioBrasil acessível para consultas reais.

Para executar o backend localmente, também é necessário o SDK .NET 10.

O Angular CLI está disponível como dependência do projeto, portanto não é necessária uma instalação global.

## Instalação

### 1. Clonar o repositório

    git clone https://github.com/Felipe-Amorim-Dev/CalendarioBrasil-Web.git

    cd CalendarioBrasil-Web

### 2. Instalar as dependências

    npm ci

O comando utiliza o arquivo `package-lock.json` para instalar as versões de dependências registradas no projeto.

### 3. Iniciar a API

Clone também o repositório do backend, caso ainda não esteja disponível:

    git clone https://github.com/Felipe-Amorim-Dev/CalendarioBrasil.git

No diretório do backend, execute:

    dotnet run --project ./CalendarioBrasil.Host --launch-profile http

O perfil HTTP de desenvolvimento disponibiliza a API em:

    http://localhost:5082

Para verificar a API diretamente:

    http://localhost:5082/api/v1/feriados?ano=2026

### 4. Iniciar o Angular

Com o backend em execução, volte ao diretório CalendarioBrasil-Web:

    npm start

A aplicação ficará disponível em:

    http://localhost:4200

O servidor de desenvolvimento possui um proxy configurado para encaminhar requisições `/api` ao backend.

## Configuração de ambientes

O projeto possui configurações separadas para desenvolvimento e produção.

### Desenvolvimento

Arquivo:

    src/environments/environment.development.ts

Configuração:

    export const environment = {
      production: false,
      apiBaseUrl: '/api/v1'
    };

### Produção

Arquivo:

    src/environments/environment.ts

Configuração:

    export const environment = {
      production: true,
      apiBaseUrl: '/api/v1'
    };

O Angular utiliza uma URL relativa para a API, permitindo que a comunicação seja intermediada pelo proxy de desenvolvimento ou por um proxy reverso no ambiente de produção.

### Proxy de desenvolvimento

Arquivo:

    proxy.conf.json

Configuração:

    {
      "/api/**": {
        "target": "http://127.0.0.1:5082",
        "secure": false,
        "changeOrigin": true
      }
    }

O `angular.json` referencia esse arquivo na configuração do servidor de desenvolvimento.

Em produção, será necessário configurar o servidor responsável por hospedar o front-end para encaminhar `/api` ao backend.

## Integração com a API

O serviço `CalendarioService` centraliza as consultas HTTP.

### Endpoint principal

    GET /api/v1/feriados

### Exemplos de consultas

**Feriados nacionais de 2026**

    GET /api/v1/feriados?ano=2026

**Feriados nacionais e do Rio de Janeiro**

    GET /api/v1/feriados?ano=2026&uf=RJ

**Feriados nacionais e de múltiplas UFs**

    GET /api/v1/feriados?ano=2026&uf=RJ,SP,MG

**Consulta histórica**

    GET /api/v1/feriados?ano=1900

**Projeção futura**

    GET /api/v1/feriados?ano=2130&uf=RJ,SP

As respostas incluem informações como:

| Propriedade | Descrição |
|-------------|-----------|
| ano | Ano consultado |
| uf | UF única, quando aplicável |
| ufs | UFs incluídas na consulta |
| cobertura | Situação da cobertura dos dados |
| total | Quantidade de registros retornados |
| feriados | Coleção de feriados |
| limitacoes | Avisos e limitações da consulta |
| alertas | Alertas identificados pela API |

O front-end utiliza esses dados para construir e atualizar a visualização anual.

## Integração Databricks

O CalendarioBrasil-Web possui um painel dedicado à integração com Databricks.

A comunicação acontece exclusivamente por meio da API CalendarioBrasil.

### Funcionalidades do painel

- Consulta do estado de configuração da integração.
- Identificação da disponibilidade do teste de conexão.
- Solicitação de diagnóstico da conexão quando permitido.
- Exibição do resultado do teste e de possíveis erros.

### Endpoints utilizados

    GET /api/v1/databricks/status

    POST /api/v1/databricks/testar

O endpoint de teste foi projetado para ficar disponível somente em ambiente de desenvolvimento.

### Segurança

Credenciais, client secrets e tokens OAuth não devem ser armazenados no Angular.

A autenticação com o workspace Databricks é responsabilidade do backend.

O painel atual oferece diagnóstico de conectividade. A leitura e a exportação de feriados para tabelas Delta não fazem parte das funcionalidades implementadas nesta versão.

## Testes automatizados

O projeto utiliza Angular TestBed e Vitest.

Os testes existentes abrangem funcionalidades como:

- Renderização dos 12 meses.
- Tratamento de anos bissextos.
- Identificação de datas com feriados.
- Seleção de datas.
- Pesquisa de UFs.
- Seleção e limpeza de estados.
- Alteração dos filtros.
- Requisições HTTP do serviço Databricks.

### Executar os testes

    npm test -- --watch=false

### Compilar a aplicação

    npm run build

O build de produção é gerado no diretório `dist/`.

A execução desses comandos é recomendada antes de realizar commits ou preparar versões.

## Publicação

A aplicação pode ser compilada para produção utilizando:

    npm run build

Os arquivos gerados devem ser publicados em um servidor compatível com aplicações Angular.

Além de disponibilizar os arquivos estáticos, o ambiente deverá encaminhar as requisições `/api` para a API CalendarioBrasil.

A configuração de Docker e a implantação integrada com o backend são atividades separadas do código de interface.

## Limitações e observações

- A aplicação depende da disponibilidade da API para consultar os feriados.
- A cobertura estadual depende dos catálogos e regras disponíveis no backend.
- Consultas históricas podem representar projeções retroativas, sem garantir equivalência com a legislação do período.
- Consultas futuras estão sujeitas a alterações legislativas.
- Pontos facultativos e feriados municipais não devem ser interpretados automaticamente como feriados nacionais ou estaduais.
- Para uso oficial, recomenda-se confirmar as informações junto à legislação e às autoridades competentes.

## Projetos relacionados

### CalendarioBrasil — Backend

API responsável pelo cálculo e disponibilização dos feriados nacionais e estaduais.

[Repositório CalendarioBrasil](https://github.com/Felipe-Amorim-Dev/CalendarioBrasil)


## Licença

Este projeto é disponibilizado sob a licença **MIT**.

Consulte o arquivo [LICENSE](LICENSE) para mais informações.

---

**CalendarioBrasil-Web** — Uma interface interativa para explorar feriados nacionais e estaduais brasileiros.
