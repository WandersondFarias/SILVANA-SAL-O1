<h1 align="center">✂️ Salão Unissex — Sistema de Gestão</h1>

<p align="center">
  Sistema web para gestão de salão de beleza unissex: agenda, clientes, serviços, produtos, equipe,<br>
  pagamentos, cancelamentos, gráficos e relatórios em PDF.<br>
  Feito com <strong>HTML, CSS e JavaScript puro</strong>, sem framework e sem instalação.
</p>

<p align="center">
  <img alt="HTML5" src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
  <img alt="CSS3" src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
  <img alt="Chart.js" src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white">
  <img alt="Responsivo" src="https://img.shields.io/badge/Responsivo-celular%20%7C%20tablet%20%7C%20PC-a4532f?style=for-the-badge">
</p>

<p align="center">
  <a href="#-sobre-o-projeto">Sobre</a> •
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#-capturas-de-tela">Telas</a> •
  <a href="#-tecnologias">Tecnologias</a> •
  <a href="#-como-executar">Como executar</a> •
  <a href="#-como-usar">Como usar</a> •
  <a href="#-estrutura-do-projeto">Estrutura</a> •
  <a href="#-personalização">Personalização</a>
</p>

---

## 📌 Sobre o projeto

O **Salão Unissex — Sistema de Gestão** foi criado para o dia a dia de um salão de beleza que atende público feminino e masculino. Ele reúne em uma única página tudo o que a recepção e o dono do salão precisam:

- marcar, finalizar e cancelar atendimentos;
- receber por **Pix, débito, crédito (com parcelas) ou dinheiro**;
- vender **produtos** junto com os serviços, com baixa automática no estoque;
- acompanhar o faturamento com **gráficos simples de entender**;
- gerar **PDFs** de comprovantes e relatórios.

O sistema roda direto no navegador, funciona no **computador, tablet e celular** e tem **tema claro e escuro**.

**Dados do salão (exibidos no rodapé e nos PDFs):**
📍 Rua Nair Borges Bento, 515 — Manoel Mendes — Uberaba - MG — CEP 38082-167

---

## ✨ Funcionalidades

### 📊 Painel (dashboard)
- Indicadores do período: **faturamento**, **atendimentos concluídos**, **ticket médio** e **cancelamentos e faltas**, com comparação com o período anterior.
- Filtro rápido: *Hoje, 7 dias, 30 dias, Este mês, Este ano*.
- Gráficos:
  - faturamento por dia (ou por mês no ano);
  - formas de pagamento (Pix, Débito, Crédito, Dinheiro) com percentual;
  - serviços mais realizados;
  - faturamento por profissional.
- Composição da receita: serviços × produtos × descontos.
- Lista dos **próximos horários de hoje** com botão de finalizar.
- Alerta de **estoque baixo**.

### 🗓️ Agenda
- Visualização por **dia, semana, mês ou todos**, com navegação ◀ ▶ e botão "Hoje".
- Filtros por **situação**, **profissional** e **busca por cliente**.
- Situações: `Agendado`, `Concluído`, `Cancelado` e `Não compareceu`.
- Ações em cada atendimento: **Finalizar**, **Editar**, **Cancelar**, **Faltou**, **Reativar**, **Excluir**, **Comprovante PDF** e **lembrete por WhatsApp**.
- Aviso de **conflito de horário** quando o profissional já tem cliente no mesmo horário.

### 💳 Pagamentos
- Formas: **Pix**, **Débito**, **Crédito** (de 1x a 12x) e **Dinheiro**.
- **Desconto** em reais com cálculo automático do total.
- Atendimento pode ter **serviços + produtos**, ou ser só uma **venda de produtos**.
- Os preços ficam guardados no atendimento: mudar o preço de um serviço depois **não altera o histórico**.

### 🚫 Cancelamento
- Registra **quem cancelou** (cliente ou salão), o **motivo** e detalhes.
- Opção de **reagendar na hora** para nova data e horário, mantendo os mesmos serviços.
- Relatório próprio de cancelamentos e faltas, com o valor previsto perdido.

### 👥 Clientes
- Cadastro com nome, telefone/WhatsApp, e-mail, gênero, data de nascimento e observações (preferências, alergias, fórmula de cor…).
- Estatísticas por cliente: visitas, total gasto, última visita e cancelamentos (com destaque para quem cancela muito).
- **Histórico completo** do cliente, com PDF.
- Cadastro rápido de cliente direto na tela de novo atendimento.

### ✂️ Serviços
- Nome, **categoria** (Corte, Barba, Coloração, Química, Tratamento, Escova/Penteado, Estética, Outros), **público** (Unissex, Feminino, Masculino), preço e duração.
- Serviços podem ser **desativados** sem perder o histórico.

### 🧴 Produtos e estoque
- Cadastro com marca, preço, estoque atual e **estoque mínimo**.
- **Baixa automática** do estoque ao concluir uma venda (e devolução ao estoque se o atendimento for cancelado, excluído ou editado).
- Botão **"+ Entrada"** para registrar reposição.
- Indicador de itens abaixo do mínimo e valor total em estoque.

### 💇 Equipe
- Cadastro de profissionais com especialidade e **% de comissão**.
- Cartão de cada profissional com atendimentos, faturamento e **comissão do mês**.

### 📄 Relatórios e PDFs
- Filtro por **período** e por **profissional**.
- Resumo financeiro, tabela por forma de pagamento, por profissional (com comissão), serviços realizados e cancelamentos.
- PDFs disponíveis:

  | PDF | Onde gerar |
  |---|---|
  | Comprovante do atendimento | Agenda → *Comprovante PDF* |
  | Relatório financeiro | Relatórios → *PDF financeiro* |
  | Cancelamentos e faltas | Relatórios → *PDF de cancelamentos* |
  | Lista de clientes | Clientes → *PDF* |
  | Histórico do cliente | Clientes → *Histórico* → *PDF do histórico* |
  | Estoque de produtos | Produtos → *PDF do estoque* |

  Todos os PDFs saem com o **nome, endereço, WhatsApp, telefone e CNPJ** do salão no cabeçalho, além de data de geração e número de página.

### ⚙️ Ajustes
- Dados do salão: nome, WhatsApp, telefone fixo, endereço, bairro, cidade, CEP, horário de funcionamento, Instagram, e-mail e CNPJ/CPF.
- **Catálogo padrão** com serviços, produtos e equipe de exemplo para começar rápido.
- **Dados de demonstração** (clientes e atendimentos fictícios) para testar os gráficos, que podem ser apagados com um clique.
- **Backup** (download em `.json`) e **restauração**.

### 🎨 Interface
- Botões **Claro** e **Escuro** separados, com destaque no tema ativo (a escolha fica salva).
- **Rodapé** com dados do salão, WhatsApp clicável, telefone fixo, endereço e botão **"Ver no mapa / Como chegar"** (Google Maps).
- Botão flutuante **voltar ao topo**.
- **Totalmente responsivo**: no celular o menu vira grade, as tabelas viram cartões e os formulários ocupam a tela inteira, sem cortar textos.

---

## 🖼️ Capturas de tela

| Painel — tema claro | Painel — tema escuro |
|---|---|
| ![Painel no tema claro](docs/screenshots/painel-claro.png) | ![Painel no tema escuro](docs/screenshots/painel-escuro.png) |

| Agenda | Novo atendimento |
|---|---|
| ![Agenda semanal](docs/screenshots/agenda.png) | ![Formulário de novo atendimento](docs/screenshots/novo-atendimento.png) |

| Relatórios | Rodapé |
|---|---|
| ![Relatórios](docs/screenshots/relatorios.png) | ![Rodapé com dados do salão](docs/screenshots/rodape.png) |

<p align="center">
  <img src="docs/screenshots/celular.png" alt="Versão para celular" width="300"><br>
  <em>Versão para celular</em>
</p>

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| **HTML5** | Estrutura da página (`index.html`) |
| **CSS3** | Visual, temas claro/escuro com variáveis CSS, Grid/Flexbox e responsividade (`style.css`) |
| **JavaScript (ES6+)** | Toda a lógica do sistema, sem framework (`app.js`) |
| [Chart.js 4.4.1](https://www.chartjs.org/) | Gráficos de barras |
| [jsPDF 2.5.1](https://github.com/parallax/jsPDF) | Geração dos PDFs |
| [jsPDF-AutoTable 3.8.2](https://github.com/simonbengtsson/jsPDF-AutoTable) | Tabelas dentro dos PDFs |
| Google Fonts | Fontes *Inter* e *Playfair Display* |
| `localStorage` | Armazenamento dos dados no navegador |

As bibliotecas são carregadas por CDN (jsDelivr), então **não é preciso instalar nada**.

---

## 🚀 Como executar

### Opção 1 — Abrir direto no computador
1. Baixe ou clone o repositório:
   ```bash
   git clone https://github.com/SEU-USUARIO/salao-unissex.git
   ```
2. Abra o arquivo **`index.html`** no navegador (Chrome, Edge, Firefox ou Safari).

> É preciso estar conectado à internet para carregar os gráficos, o gerador de PDF e as fontes.

### Opção 2 — Servidor local (opcional)
```bash
# com Python
python -m http.server 8000

# ou com Node.js
npx serve .
```
Depois acesse `http://localhost:8000`.

### Opção 3 — Publicar no GitHub Pages
1. Suba os arquivos para um repositório no GitHub.
2. Vá em **Settings → Pages**.
3. Em *Branch*, selecione `main` e a pasta `/ (root)` e clique em **Save**.
4. Em alguns minutos o sistema estará disponível em
   `https://SEU-USUARIO.github.io/salao-unissex/`.

---

## 📖 Como usar

1. **Primeiro acesso:** o sistema já vem com um catálogo de serviços, produtos e equipe de exemplo. Edite ou exclua à vontade.
2. **Ajustes:** preencha o nome do salão, WhatsApp, telefone fixo e endereço. Esses dados aparecem no topo, no rodapé e nos PDFs.
3. **Equipe e serviços:** cadastre os profissionais (com % de comissão) e ajuste os preços dos serviços.
4. **Agendar:** clique em **+ Agendar**, escolha o cliente (ou cadastre na hora com **+ Novo**), o profissional, a data, o horário e os serviços.
5. **Finalizar:** na Agenda, clique em **Finalizar**, escolha a forma de pagamento (e as parcelas, se for crédito) e confirme.
6. **Cancelar:** clique em **Cancelar**, informe quem cancelou e o motivo e, se quiser, já reagende.
7. **Acompanhar:** veja os números no **Painel** e gere os PDFs em **Relatórios**.
8. **Fazer backup:** em **Ajustes → Baixar backup**, de preferência toda semana.

> 💡 Quer ver os gráficos funcionando antes de usar de verdade? Vá em **Ajustes → Gerar demonstração**. Depois é só clicar em **Apagar demonstração**.

---

## 📁 Estrutura do projeto

```
salao-unissex/
├── index.html          # Estrutura: topo, menu, área de conteúdo, rodapé, janelas
├── style.css           # Estilos, temas claro/escuro e responsividade
├── app.js              # Lógica: dados, telas, formulários, gráficos e PDFs
├── README.md           # Este arquivo
└── docs/
    └── screenshots/    # Imagens usadas no README
```

### Organização do `app.js`

| Seção | O que faz |
|---|---|
| Utilitários | Formatação de moeda (R$), datas, escape de HTML |
| Dados do salão | Endereço padrão e função `cfg()` com os dados de contato |
| Estado e persistência | Coleções `clientes`, `servicos`, `produtos`, `profissionais`, `atendimentos` e `config`, salvas no `localStorage` |
| Estoque | Baixa e devolução automática de produtos |
| Cálculos | Resumo financeiro, ranking de serviços, comissão por profissional |
| Gráficos | Função `barChart()` sobre o Chart.js, respeitando o tema |
| Telas (`VIEWS`) | Painel, Agenda, Clientes, Serviços, Produtos, Equipe, Relatórios, Ajustes |
| Formulários | Atendimento, finalização, cancelamento, cliente, serviço, produto, profissional |
| PDF | Cabeçalho, tabelas, rodapé com paginação e cada relatório |
| Ações e eventos | Cliques, filtros, tema, rodapé, voltar ao topo |

### Modelo de dados (atendimento)

```json
{
  "id": "lzx1abc",
  "clienteId": "c01",
  "clienteNome": "Juliana Alves",
  "profissionalId": "p01",
  "profNome": "Ana",
  "data": "2026-10-30",
  "hora": "14:30",
  "servicos": [{ "id": "s01", "nome": "Corte feminino", "preco": 80 }],
  "produtos": [{ "id": "pr01", "nome": "Leave-in 150 ml", "preco": 49.9, "qtd": 1 }],
  "desconto": 0,
  "total": 129.9,
  "status": "concluido",
  "pagamento": "pix",
  "parcelas": 1,
  "cancel": null,
  "obs": ""
}
```

`status`: `agendado` | `concluido` | `cancelado` | `faltou`
`pagamento`: `pix` | `debito` | `credito` | `dinheiro`

---

## 🎨 Personalização

### Cores
Todas as cores ficam em variáveis no início do `style.css`. Para trocar a cor principal (cobre), altere:

```css
:root {
  --accent: #a4532f;   /* tema claro */
  --gold:   #a87b1f;
}
:root[data-theme="dark"] {
  --accent: #e08a62;   /* tema escuro */
  --gold:   #d9ab4c;
}
```

### Nome e dados do salão
Pela própria tela **Ajustes**, sem mexer no código. O título da aba do navegador fica na tag `<title>` do `index.html`.

### Endereço padrão
No `app.js`, em `SALAO_PADRAO`:

```js
const SALAO_PADRAO = {
  endereco: 'Rua Nair Borges Bento, 515',
  bairro: 'Manoel Mendes',
  cidade: 'Uberaba - MG',
  cep: '38082-167'
};
```

### Catálogo inicial
Os serviços, produtos e profissionais de exemplo estão na função `catalogoPadrao()` do `app.js`.

---

## 💾 Armazenamento dos dados

- Os dados ficam salvos no **`localStorage` do navegador**, no próprio aparelho.
- Não há servidor nem banco de dados externo: nada é enviado para a internet.
- **Atenção:** limpar os dados do navegador apaga as informações. Use **Ajustes → Baixar backup** regularmente.
- Para passar os dados para outro computador ou celular: baixe o backup em um e use **Restaurar backup** no outro.

---

## 📱 Compatibilidade

| Navegador | Situação |
|---|---|
| Google Chrome / Edge | ✅ |
| Mozilla Firefox | ✅ |
| Safari (Mac e iPhone) | ✅ |
| Chrome no Android | ✅ |

Testado em telas de **320 px** (celulares pequenos) até **monitores largos**.

---

## 🗺️ Melhorias futuras

- [ ] Login com usuário e senha para a equipe
- [ ] Banco de dados em nuvem (sincronizar vários aparelhos)
- [ ] Envio automático de lembretes por WhatsApp
- [ ] Agenda em formato de calendário (grade de horários)
- [ ] Controle de despesas e fluxo de caixa
- [ ] Programa de fidelidade para clientes

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Você pode usar, copiar e modificar livremente, mantendo os créditos.

---

## 👤 Autor

Desenvolvido por **Wanderson de Farias**.

- GitHub: [@SEU-USUARIO](https://github.com/SEU-USUARIO)
- E-mail: wandersondefarias74@gmail.com

<p align="center">Feito com 💇 e ☕ — Uberaba, MG</p>
