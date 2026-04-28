# 🚀 NewTech Cursos

Plataforma web desenvolvida em **React** para gerenciamento e visualização de cursos profissionalizantes voltados para **engenharia, segurança do trabalho e normas regulamentadoras (NRs)**.

---

## 🎯 Objetivo

Desenvolver uma aplicação moderna e funcional que permita:

- Visualização de cursos
- Sistema de login (Aluno e Administrador)
- Gerenciamento completo de cursos
- Área do usuário com dados e histórico
- Interface limpa e profissional

---

## 🧑‍💻 Tecnologias Utilizadas

- ⚛️ React (Vite)
- 🔀 React Router DOM
- 🟨 JavaScript (ES6+)
- 🎨 CSS moderno (responsivo)
- 💾 LocalStorage (simulação de banco de dados)

---

## 🎨 Padrão Visual

### Paleta de cores

- Azul principal: `#0B5FA5`
- Azul escuro: `#143B63`
- Azul profundo: `#0B2742`
- Laranja: `#F97316`
- Laranja escuro: `#D85B00`
- Azul claro: `#EAF4FF`
- Branco: `#FFFFFF`

### Diretrizes

- Design clean e profissional  
- Layout responsivo (mobile-first)  
- Componentização com React  
- Consistência visual e espaçamento  

---

## 🔐 Tipos de Acesso

### 👨‍🎓 Aluno
- Visualiza cursos
- Se inscreve nos cursos
- Acompanha inscrições
- Acessa sua conta (dados pessoais, endereço, histórico)

### 🛠️ Administrador
- Cadastra cursos
- Edita cursos
- Exclui cursos
- Visualiza alunos cadastrados
- Acompanha inscrições dos alunos

---

## 📄 Funcionalidades

### 🔎 Pesquisa
- Busca na Home
- Busca na tela de cursos
- Busca na área administrativa

### 📚 Cursos
- Listagem com layout alinhado
- Página de detalhes completa
- Inscrição direta na plataforma

### 👤 Minha Conta
- Dados pessoais
- Endereço
- Histórico de inscrições
- Informações de segurança

### 🧩 Área Administrativa
- Interface organizada por abas:
  - Cadastro de cursos
  - Gerenciamento de cursos
  - Alunos cadastrados
- Visualização de dados dos alunos
- Controle completo dos cursos

---

## 🔄 Experiência do Usuário

- Transições suaves entre telas
- Scroll automático ao trocar de página
- Navegação fluida
- Interface moderna e intuitiva

---

## 📂 Estrutura do Projeto
src/
├── components/
├── pages/
├── services/
├── routes/
├── assets/
└── styles/


---

## ⚙️ Como rodar o projeto

```bash
# instalar dependências
npm install

# rodar o projeto
npm run dev



🔑 Acessos de Teste
🛠️ Administrador

Email: admin@newtech.com

Senha: admin123

👨‍🎓 Aluno

Email: aluno@newtech.com

Senha: aluno123



💾 Persistência de Dados

O projeto utiliza LocalStorage para simular:

Usuários
Cursos
Inscrições


📈 Melhorias Futuras
Integração com backend real (API)
Sistema de pagamento
Upload de imagens
Controle de permissões avançado
Dashboard com métricas