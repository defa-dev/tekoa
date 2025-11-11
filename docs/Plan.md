| **Fase**       | **Foco**                                       | **Pacotes**         |
| -------------- | ---------------------------------------------- | ------------------- |
| **Foundation** | Configuração do ambiente e arquitetura.        | 1 (Infraestrutura)  |
| **Structure**  | Desenvolvimento da base visual e reutilizável. | 2 (Componentes)     |
| **Core MVP**   | Lançamento da funcionalidade essencial.        | 3 (Trocas/Serviços) |
| **Expansion**  | Adição das funcionalidades secundárias.        | 4 (Feira e Mural)   |


#### Pacote 1: Infraestrutura e Abstração de Dados (Backend Focus)

Este desenvolvedor (ou equipe) será responsável por configurar o ambiente e criar a camada que isola o Front-end do banco de dados, mantendo a flexibilidade.

| **ID**  | **Tarefa**                                        | **Detalhes/Requisitos**                                                                                                                                                                                                                              |
| ------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **I.1** | **Configuração Inicial do Supabase**              | Criar tabelas necessárias para o MVP (`users`, `services`, `products`, `mural_posts`, `chats`, `messages`).                                                                                                                                          |
| **I.2** | **Implementação da Autenticação**                 | Configurar o **Supabase Auth** (email/senha) e a lógica de redirecionamento em Next.js (rotas privadas).                                                                                                                                             |
| **I.3** | **Criação da Camada de Abstração (Data Service)** | Desenvolver uma biblioteca/módulo (ex: `src/data/supabaseService.ts`) que encapsule todas as chamadas ao Supabase (CRUD). **Objetivo:** O Front-end só chama funções como `getPosts()` ou `createService()`, sem saber que o Supabase está por trás. |
| **I.4** | **Configuração do Realtime para Chat**            | Implementar a inicialização do **Supabase Realtime** e as funções de envio/recebimento de mensagens para o chat (_match_ e _feira_).                                                                                                                 |
| **I.5** | **Estruturação do Projeto Next.js**               | Inicializar o projeto na Vercel, configurar variáveis de ambiente e definir a estrutura de pastas (`/components`, `/pages` ou App Router, `/data`, `/types`).                                                                                        |

#### Pacote 2: 🖼️ Componentes e Design System (Frontend Focus)

Este desenvolvedor (ou equipe) criará todos os blocos de construção visuais, garantindo que o design seja responsivo e limpo.

| **ID**  | **Tarefa**                                      | **Detalhes/Requisitos**                                                                                                                         |
| ------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **C.1** | **Definição da Paleta de Cores/Tipografia**     | Criar um arquivo de configuração global de estilos (_design tokens_) que siga as notas de UX/UI ("Interface limpa e afetiva, cores vibrantes"). |
| **C.2** | **Criação de Componentes Base (Design System)** | Desenvolver componentes reutilizáveis: `Button`, `Input`, `Card` (para serviços/produtos/posts), `Header/Navbar` (mobile-first), `Layout`.      |
| **C.3** | **Desenvolvimento da Tela de Cadastro/Login**   | Componentes de UI que interagem com as funções de autenticação do Pacote I.                                                                     |
| **C.4** | **Implementação da Navegação Mobile**           | Criar um **menu de navegação inferior** responsivo e intuitivo, conforme o padrão de apps mobile.                                               |
#### Pacote 3: 🤝 Funcionalidade Principal: Tinder de Trocas / Serviços

Este pacote foca na principal funcionalidade do MVP.

|**ID**|**Tarefa**|**Detalhes/Requisitos**|
|---|---|---|
|**T.1**|**Página de Cadastro de Ofertas/Pedidos**|Criar formulário para o usuário registrar um serviço (campos como `título`, `descrição`, `tipo`, `proximidade`).|
|**T.2**|**Algoritmo e Página de Matching**|**Implementar a lógica de _matching_ simples** (função que filtra serviços/pedidos compatíveis por tipo/proximidade, utilizando a Camada de Abstração). Criar a UI para visualizar e dar "match".|
|**T.3**|**Tela de Chat Interno**|Implementar a UI do chat, conectando-a às funções de **Realtime** (I.4) e **Data Service** (I.3) para exibir o histórico e enviar novas mensagens.|
|**T.4**|**Sistema de Avaliação Pós-Troca**|Criar um formulário simples de avaliação (ex: 1 a 5 estrelas) que se conecta à Camada de Abstração para gravar o _rating_ no DB.|

#### Pacote 4: 🛒 Feira do Rolo e Mural de Avisos

|**ID**|**Tarefa**|**Detalhes/Requisitos**|
|---|---|---|
|**F.1**|**Página de Publicação de Item (Feira)**|Criar o formulário para cadastro de produtos, incluindo o _upload_ de imagens via **Supabase Storage** (também via Camada de Abstração).|
|**F.2**|**Listagem de Itens e Filtros (Feira)**|Criar a página de listagem principal, usando os componentes `Card` (C.2) e implementando filtros básicos (categoria, preço, proximidade).|
|**F.3**|**Página de Detalhes do Item**|Exibir detalhes do produto e um botão para iniciar o chat de negociação (usando a mesma estrutura de chat do pacote T.3).|
|**F.4**|**Mural de Avisos (CRUD Simples)**|Criar as telas para **publicação** e **visualização** (feed) de avisos comunitários (texto + fotos), utilizando o **Supabase Realtime** para um _feed_ dinâmico.|

### Manutenção da Abstração e Boas Práticas

Para garantir que a tecnologia de base possa mudar, é vital reforçar o seguinte ponto com todos os desenvolvedores:

> **Regra de Ouro:** **Nenhuma chamada direta à API ou biblioteca do Supabase deve ser feita fora do módulo de Abstração de Dados** (`src/data/supabaseService.ts`).

Se um dia você precisar migrar de Supabase para Firebase ou MongoDB:

- **Apenas o código dentro do módulo `src/data/` precisará ser reescrito.**
    
- Todo o Front-end e lógica de negócios (_matching_, _feeds_) permanecerão intocados, pois eles só "conversam" com as funções abstratas (ex: `DataService.getMatchesForUser()`).
    

Com essa divisão, você pode alocar os Pacotes 1 e 2 para desenvolvedores mais experientes em arquitetura, e os Pacotes 3 e 4 para desenvolvedores mais focados em UI/UX e integração de funcionalidades.

Gostaria de detalhar os **tipos de dados (schemas)** que seriam necessários para as tabelas principais no Supabase?