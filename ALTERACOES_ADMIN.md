# Alterações — Painel de Administração

> Sessão: junho/2026 | Base: commit `823714f` (Mobile)

---

## Visão geral

Foi implementado um sistema de administração completo para o site da Comercial São Pedro, permitindo publicar notícias e adicionar produtos sem precisar editar os arquivos HTML manualmente. Os dados são armazenados no `localStorage` do navegador e injetados dinamicamente nas páginas do site.

---

## Arquivos novos

### `admin.html`
Painel de administração completo. Contém:
- **Tela de login / primeiro acesso** — no primeiro acesso exibe um wizard para criar a senha; nos acessos seguintes exibe o formulário de login
- **Sidebar** — navegação fixa com ícones para: Dashboard, Notícias, Produtos, Configurações
- **Seção Dashboard** — cards com totais (notícias, produtos, itens gerenciados) e ações rápidas
- **Seção Notícias** — tabela com todas as notícias + botão "Nova Notícia" + busca em tempo real
- **Seção Produtos** — tabela com todos os produtos adicionados + botão "Novo Produto" + busca
- **Seção Configurações** — alterar senha, exportar/importar dados JSON, apagar todos os dados
- **Modal Notícia** — formulário com campos: Título, Categoria, Data, Resumo, Conteúdo completo, toggle Publicada/Rascunho
- **Modal Produto** — formulário com campos: Nome, Categoria, Marca, Aplicação, Descrição, Tags
- **Toast** — notificações de sucesso/erro/aviso no canto inferior direito

---

### `css/admin.css`
Folha de estilos exclusiva do painel. Seções principais:
- Reset e base (`body.admin-body`)
- Tela de login (gradiente maroon, card centralizado, input com toggle de visibilidade)
- Layout do dashboard (sidebar 260px fixa + main com `margin-left`)
- Sidebar (cores maroon, nav-items com estado active em gold, badge "Admin")
- Topbar (60px, sticky, título dinâmico + link "Ver site")
- Stats cards, quick-actions, admin-cards
- Tabelas de dados com badges (Publicada, Rascunho, Categoria, Marca)
- Modais com backdrop blur e animação de entrada
- Formulários internos aos modais
- Toggle switches (verde quando ativo)
- Toast notifications (variantes: success, error, warning)
- Seção de Configurações e zona de perigo
- Responsivo: sidebar colapsável em mobile (≤768px), hamburger fixo, modal em sheet inferior

---

### `js/admin.js`
Toda a lógica do painel em ~300 linhas. Módulos:

| Módulo | Descrição |
|--------|-----------|
| `KEYS` | Constantes das chaves do localStorage |
| `hashStr()` | Hash SHA-256 via `crypto.subtle` (Web Crypto API) |
| `Auth` | Setup de senha, login, logout, troca de senha — compara hashes, sessão em `sessionStorage` |
| `Toast` | Exibe notificações temporárias (3.2s) |
| `Modal` | Abre/fecha modais com bloqueio de scroll |
| `navigate()` | Roteamento entre seções sem reload |
| `renderNoticias()` | Gera linhas da tabela com busca em tempo real |
| `openNoticiaModal()` | Popula o modal para criar ou editar |
| `saveNoticia()` | Cria ou atualiza item em `csp_noticias` |
| `deleteNoticia()` | Remove item (com `confirm()`) |
| `renderProdutos()` | Gera linhas da tabela de produtos |
| `openProdutoModal()` | Popula o modal para criar ou editar |
| `saveProduto()` | Cria ou atualiza item em `csp_produtos` |
| `deleteProduto()` | Remove produto |
| `exportData()` | Baixa JSON com backup de todos os dados |
| `importData()` | Lê JSON e restaura dados no localStorage |
| `clearAllData()` | Apaga `csp_noticias` e `csp_produtos` |
| `renderLogin()` | Renderiza tela de login ou wizard de primeiro acesso |
| `handleLogin()` | Processa autenticação (setup ou login) |
| `init()` | Ponto de entrada — verifica sessão e inicializa o painel |

---

## Arquivos modificados

### `noticias.html`

**Mudança 1 — Container dinâmico (linha ~88):**
```html
<!-- Notícias publicadas pelo painel admin -->
<div id="noticiasDinamicasContainer"></div>
```
Inserido dentro de `.noticias-lista`, antes das notícias estáticas.

**Mudança 2 — Script inline (antes de `<script src="js/main.js">`):**
Script IIFE que ao carregar a página:
1. Lê `localStorage.getItem('csp_noticias')`
2. Filtra somente `status === 'publicada'`
3. Ordena por data (mais recente primeiro)
4. Gera HTML de cards `<article class="noticia-card-full">` com gradiente por categoria, data formatada em português e link para WhatsApp
5. Injeta no `#noticiasDinamicasContainer`

**Mudança 3 — Footer:**
```html
<!-- Antes -->
<div class="footer-bottom">

<!-- Depois -->
<div class="footer-bottom" style="position:relative;">
  ...
  <a href="admin.html" aria-label="Área administrativa"
     style="position:absolute;bottom:10px;right:14px;font-size:9px;
            color:rgba(255,255,255,0.12);text-decoration:none;">&#9679;</a>
```

---

### `produtos.html`

**Mudança 1 — Script inline (antes de `<script src="js/main.js">`):**
Script IIFE que ao carregar a página:
1. Lê `localStorage.getItem('csp_produtos')`
2. Gera cards `<article class="produto-card">` com placeholder gradiente (sem imagem), categoria, marca e botão de orçamento via WhatsApp
3. Insere com `insertBefore` no início de `#produtosGrid`, para que os novos produtos apareçam primeiro

**Mudança 2 — Footer:** mesmo padrão descrito em `noticias.html`.

---

### `index.html` / `contato.html` / `quem-somos.html`

Apenas o footer-bottom foi alterado em cada um:
- Adicionado `style="position:relative;"` ao `<div class="footer-bottom">`
- Adicionado link invisível `●` no canto inferior direito apontando para `admin.html`

---

## Chaves do localStorage

| Chave | Tipo | Conteúdo |
|-------|------|----------|
| `csp_admin_hash` | `string` | Hash SHA-256 da senha do administrador |
| `csp_admin_session` | `string` (sessionStorage) | `"1"` quando há sessão ativa (some ao fechar o browser) |
| `csp_noticias` | `JSON array` | Lista de objetos `{id, titulo, categoria, data, resumo, conteudo, status, createdAt}` |
| `csp_produtos` | `JSON array` | Lista de objetos `{id, nome, categoria, categoriaLabel, marca, aplicacao, descricao, tags, createdAt}` |

---

## Fluxo de uso

```
1. Abrir admin.html (via ponto ● no footer ou URL direta)
       ↓
2. Primeiro acesso: criar senha (mínimo 6 caracteres)
   Acessos seguintes: digitar senha
       ↓
3. Dashboard → Notícias → "Nova Notícia"
   Preencher: título, categoria, data, resumo → Salvar
       ↓
4. Acessar noticias.html → notícia aparece no topo da lista
       ↓
5. Dashboard → Produtos → "Novo Produto"
   Preencher: nome, categoria, marca, descrição → Salvar
       ↓
6. Acessar produtos.html → produto aparece no início do catálogo
       ↓
7. (Opcional) Configurações → Exportar dados → salvar .json como backup
```

---

## Observações

- **Portabilidade:** os dados vivem no `localStorage` do navegador. Para usar em outro computador, exporte o JSON em Configurações e importe no novo ambiente.
- **Segurança:** autenticação client-side (SHA-256 no browser). Adequada para uso interno/local; não substitui autenticação server-side para sites públicos.
- **Produtos estáticos:** os 98 produtos já existentes nos arquivos HTML não são afetados — o painel só adiciona novos.
- **Notícias estáticas:** as 2 notícias fixas em `noticias.html` continuam; as do painel aparecem antes delas, ordenadas por data.
