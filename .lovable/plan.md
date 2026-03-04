

# Minas Taxi - Gestão de Rotas

## Visão Geral
Aplicação web de gestão inteligente de rotas para uma empresa de táxi, com importação de passageiros, otimização de rotas via IA (mockada) e geração de resumos para motoristas.

## Design & Identidade Visual
- Paleta corporativa premium: amarelo escuro (#D4A017), preto, branco e cinza claro
- Tipografia moderna e limpa
- Layout responsivo com componentes shadcn/ui e ícones Lucide
- Cantos arredondados, sombras suaves, visual profissional

## Páginas e Funcionalidades

### 1. Tela de Login
- Tela centralizada e minimalista com logo "Minas Taxi"
- Subtítulo "Painel de Inteligência de Rotas"
- Campos de e-mail e senha com botão "Entrar"
- Login mockado — redireciona direto ao Dashboard

### 2. Dashboard Principal (Área Logada)
- **Header** com logo, nome do usuário e botão "Sair"
- Layout em duas colunas: Entrada de Dados (esquerda) e Resultados da IA (direita)
- Em telas menores, as colunas empilham verticalmente

### 3. Coluna Esquerda — Entrada de Dados

**Bloco 1: Dados da Viagem**
- Nome da Empresa, Endereço de Destino, Data do Agendamento (datepicker), Horário de Chegada (time picker), Horário de Retorno (opcional), Forma de Pagamento (select)

**Bloco 2: Importação de Passageiros**
- Área de drag-and-drop estilizada com ícone grande de upload
- Aceita CSV, Excel, PDF (simulado)
- Ao fazer upload, preenche automaticamente a tabela com 5-6 passageiros fictícios

**Bloco 3: Tabela de Revisão de Passageiros**
- Colunas: Nome, Endereço Completo, Celular, Centro de Custo
- Edição inline em cada célula
- Botão de excluir (lixeira) por linha
- Botão "+ Adicionar passageiro manualmente" no rodapé

**Botão Principal**
- "Otimizar Rotas com IA" com ícone de mapa
- Ao clicar, exibe estado de loading "Analisando endereços e calculando rotas..."

### 4. Coluna Direita — Resultados da IA

- Cards de veículos gerados após a otimização
- Máximo 3 passageiros por carro
- Cada card exibe:
  - Timeline visual conectando: Casa do Passageiro 1 → Passageiro 2 → Passageiro 3 → Destino (Empresa)
  - Horário de saída do primeiro passageiro
  - Horários estimados de embarque dos demais
  - Horário de chegada ao destino
- Botão "Copiar Resumo da Rota" em cada card (copia texto formatado para WhatsApp/Email)

### 5. Lógica de Estado (Mock)
- Upload simula preenchimento da tabela com dados fictícios
- Otimização simula agrupamento em carros de até 3 passageiros com horários lógicos calculados a partir do horário de chegada obrigatório

