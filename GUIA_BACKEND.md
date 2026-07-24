# Guia — Backend compartilhado (Hostinger PHP + MySQL)

Este guia explica como colocar no ar o painel admin com **banco de dados compartilhado**:
tudo que o admin criar/editar/excluir passa a aparecer para **todos os visitantes** do site.

---

## Como funciona (resumo)

```
Visitante  ─┐
Visitante  ─┼──►  produtos.html / noticias.html  ──►  api/*.php  ──►  MySQL (Hostinger)
Visitante  ─┘                                                              ▲
                                                                          │
Admin  ──►  admin.html  ──(login + salvar)──►  api/*.php  ─────────────────┘
```

- O site lê os produtos e notícias do **banco MySQL** (fonte única).
- O painel grava no mesmo banco. Por isso a edição vale para todo mundo.
- Se a API estiver fora do ar, as páginas caem no `js/seed-data.js` (catálogo base) para nunca ficarem vazias.

---

## Passo 1 — Criar o banco MySQL no hPanel

1. Entre no **hPanel da Hostinger** → **Bancos de dados** → **Gerenciamento de bancos de dados MySQL**.
2. Crie um banco novo. Anote os 4 dados:
   - **Host** (quase sempre `localhost` na Hostinger)
   - **Nome do banco** (ex.: `u123456789_csp`)
   - **Usuário** (ex.: `u123456789_admin`)
   - **Senha**

> Não precisa criar tabelas manualmente — o sistema cria sozinho no primeiro acesso.

## Passo 2 — Criar o arquivo de credenciais (fora do site)

O arquivo com as senhas **não fica no repositório** — ele é criado direto no servidor.

1. No **Gerenciador de Arquivos** da Hostinger, vá para a pasta que **contém** `public_html`
   (ex.: `/home/u123456789/`) — ou seja, **um nível acima** do site.
2. Crie ali um arquivo chamado **`csp-config.php`**.
3. Copie o conteúdo de `api/config.example.php` para dentro dele e preencha os 4 valores:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'u123456789_csp');       // seu banco
define('DB_USER', 'u123456789_admin');     // seu usuário
define('DB_PASS', 'sua-senha-secreta');    // sua senha
```

Por ficar fora do `public_html`, esse arquivo é **inacessível pela web** — ninguém consegue
abrir pelo navegador nem por engano.

> Para testar no seu computador, copie `api/config.example.php` para `api/config.php` e
> preencha com os dados de um banco local. O sistema procura `csp-config.php` primeiro e,
> se não achar, usa `api/config.php`. Os dois estão no `.gitignore`.

## Passo 3 — Enviar os arquivos

Envie **todo o site** para a pasta `public_html` (via **Gerenciador de Arquivos** do hPanel ou FTP),
incluindo a pasta **`api/`** inteira (com o `seed.json`) e a pasta **`js/`**.

## Passo 4 — Primeiro acesso (cria tabelas + carrega os 70 produtos)

1. Acesse `https://SEU-DOMINIO.com/admin.html`.
2. Na primeira vez aparece **“Primeiro acesso — defina a senha de administrador”**. Crie uma senha (mín. 6 caracteres).
   - Nesse momento o sistema cria as tabelas e importa automaticamente os **70 produtos** e as **2 notícias** já existentes.
3. Pronto. As tabelas Produtos e Notícias já vêm preenchidas e **editáveis**.

## Passo 5 — Testar

- Edite um produto no painel → abra `produtos.html` em outro navegador/celular → a alteração aparece para todos.
- Crie uma notícia → aparece em `noticias.html`.

---

## Segurança

- **HTTPS:** ative o SSL grátis da Hostinger (hPanel → Segurança → SSL). O login usa cookie de sessão; use sempre `https://`.
- **Senha:** guardada como *hash* bcrypt no banco (`password_hash`), nunca em texto puro.
- **Credenciais do banco:** ficam em `csp-config.php`, **fora do `public_html`** e fora do repositório Git (`.gitignore`). Nunca são publicadas no GitHub nem acessíveis pela web.
- As gravações (`POST`) só funcionam com sessão de admin ativa; a leitura (`GET`) é pública (como deve ser para o catálogo).

## Backup

No painel → **Configurações → Exportar dados** baixa um `.json` com tudo.
**Importar dados** relê esse `.json` e regrava no banco.

---

## Arquivos do backend

| Arquivo | Papel |
|---|---|
| `api/config.example.php` | Modelo das credenciais (copie para `csp-config.php` no servidor) |
| `api/db.php` | Conexão PDO, criação das tabelas, carga inicial (seed), funções de gravação |
| `api/auth.php` | Login / logout / primeiro acesso / troca de senha (sessão PHP) |
| `api/produtos.php` | Listar (público) e criar/editar/excluir (admin) produtos |
| `api/noticias.php` | Listar e criar/editar/excluir notícias |
| `api/seed.json` | Catálogo base (70 produtos + 2 notícias) para a primeira carga |
| `js/csp-api.js` | Cliente JS que conversa com a API |

## Problemas comuns

- **“Sem conexão com o servidor” no login:** o `csp-config.php` está com dados errados, não foi criado na pasta acima do `public_html`, o banco não foi criado, ou os arquivos `api/` não foram enviados.
- **“config ausente” na resposta da API:** o `csp-config.php` não foi encontrado. Confirme que ele está **um nível acima** do `public_html` (ex.: `/home/u123456789/csp-config.php`).
- **Catálogo aparece mas edições não salvam:** você não está logado, ou o site está sendo aberto por `file://` em vez do domínio. Use sempre a URL `https://SEU-DOMINIO.com/...`.
- **Produtos duplicados:** só aconteceria se o `seed.json` fosse reimportado com o banco já cheio — o sistema evita isso (só semeia quando a tabela está vazia).
