/* ============================================================
   COMERCIAL SÃO PEDRO — Admin Dashboard v2.0
   Gerenciamento de notícias e produtos via API PHP + MySQL.
   Os dados são compartilhados: o que o admin salva aqui fica
   visível para TODOS os visitantes do site.
   ============================================================ */

/* ===== ESTADO EM MEMÓRIA (espelho do banco) ===== */
const state = {
    produtos: [],
    noticias: [],
};

const GRAD_NOTICIAS = {
    'Palestra Técnica': 'linear-gradient(135deg, #44110D 0%, #572925 100%)',
    'Feiras e Eventos': 'linear-gradient(135deg, #1a3a5c 0%, #0d2137 100%)',
    'Lançamentos de Produtos': 'linear-gradient(135deg, #1a4a2e 0%, #0d2515 100%)',
    'Dicas para Obra': 'linear-gradient(135deg, #4a3010 0%, #2a1a05 100%)',
};

/* ===== UTILITÁRIOS ===== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function fmtDate(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    const meses = ['janeiro','fevereiro','março','abril','maio','junho',
                   'julho','agosto','setembro','outubro','novembro','dezembro'];
    return `${parseInt(d)} de ${meses[parseInt(m)-1]} de ${y}`;
}

function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ===== AUTENTICAÇÃO (server-side, via API) ===== */
const Auth = {
    async status() {
        try { return await CSP_API.authStatus(); }
        catch (e) { return { ok: false, authenticated: false, setup: false, offline: true }; }
    },
    async logout() {
        try { await CSP_API.logout(); } catch (e) {}
        location.reload();
    },
};

/* ===== TOAST ===== */
let toastTimer;
function showToast(msg, type = 'success') {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.className = `toast show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

/* ===== MODAL ===== */
function openModal(id) {
    const overlay = $(`#${id}`);
    overlay.classList.add('open');
    overlay.querySelector('.modal').setAttribute('role', 'dialog');
    document.body.style.overflow = 'hidden';
}
function closeModal(id) {
    $(`#${id}`).classList.remove('open');
    document.body.style.overflow = '';
}

/* ===== ROUTER ===== */
let currentSection = 'dashboard';
function navigate(sec) {
    $$('.admin-section').forEach(s => s.classList.add('hidden'));
    $(`#sec-${sec}`).classList.remove('hidden');
    $$('.nav-item').forEach(n => n.classList.remove('active'));
    $(`[data-nav="${sec}"]`).classList.add('active');
    const titles = { dashboard: 'Dashboard', noticias: 'Notícias', produtos: 'Produtos', configuracoes: 'Configurações' };
    $('#topbarTitle').textContent = titles[sec] || sec;
    currentSection = sec;
    updateCounts();
}

/* ===== COUNTS ===== */
function updateCounts() {
    const noticias = state.noticias;
    const produtos = state.produtos;
    const pubNot = noticias.filter(n => n.status === 'publicada').length;

    const setEl = (id, val) => { const el = $(id); if (el) el.textContent = val; };
    setEl('#countNoticias', noticias.length);
    setEl('#countProdutos', produtos.length);
    setEl('#statNoticias', noticias.length);
    setEl('#statNoticiasPubl', `${pubNot} publicada${pubNot !== 1 ? 's' : ''}`);
    setEl('#statProdutos', produtos.length);
    setEl('#statTotal', noticias.length + produtos.length);
    $$('[data-count-not]').forEach(el => el.textContent = noticias.length);
    $$('[data-count-prod]').forEach(el => el.textContent = produtos.length);
}

/* ===== CARREGAMENTO ===== */
async function reloadProdutos() {
    try { state.produtos = await CSP_API.getProdutos(); }
    catch (e) { state.produtos = []; showToast('Falha ao carregar produtos.', 'error'); }
}
async function reloadNoticias() {
    try { state.noticias = await CSP_API.getNoticias(); }
    catch (e) { state.noticias = []; showToast('Falha ao carregar notícias.', 'error'); }
}

/* ===== NOTÍCIAS ===== */
let editingNoticia = null;

function renderNoticias(filter = '') {
    const list = state.noticias;
    const tbody = $('#noticiasTableBody');
    const fl = filter.toLowerCase();
    const filtered = fl
        ? list.filter(n => (n.titulo || '').toLowerCase().includes(fl) || (n.categoria || '').toLowerCase().includes(fl))
        : list;

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="5">
                <div class="empty-state">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    <p>${fl ? 'Nenhuma notícia encontrada.' : 'Nenhuma notícia cadastrada ainda.'}</p>
                    ${!fl ? `<div class="empty-action"><button class="btn btn-md btn-primary-admin" onclick="openNoticiaModal()">Nova Notícia</button></div>` : ''}
                </div>
            </td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(n => `
        <tr>
            <td><div class="table-title">${escHtml(n.titulo)}</div></td>
            <td><span class="badge badge-cat">${escHtml(n.categoria)}</span></td>
            <td style="color:#888; font-size:.8125rem;">${escHtml(n.dataLabel) || fmtDate(n.data) || '—'}</td>
            <td><span class="badge ${n.status === 'publicada' ? 'badge-pub' : 'badge-draft'}">${n.status === 'publicada' ? 'Publicada' : 'Rascunho'}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-sm btn-edit-admin" onclick="openNoticiaModal('${n.id}')">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Editar
                    </button>
                    <button class="btn btn-sm btn-danger-admin" onclick="deleteNoticia('${n.id}')">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        Excluir
                    </button>
                </div>
            </td>
        </tr>`).join('');
}

function openNoticiaModal(id = null) {
    editingNoticia = id;
    const isEdit = !!id;
    $('#modalNoticiaTitle').textContent = isEdit ? 'Editar Notícia' : 'Nova Notícia';
    const form = $('#formNoticia');
    form.reset();
    $('#toggleStatus').className = 'toggle on';
    $('#toggleStatusHidden').value = 'publicada';
    $('#toggleStatusLabel').textContent = 'Publicada';

    if (isEdit) {
        const item = state.noticias.find(n => n.id === id);
        if (!item) return;
        $('#nTitulo').value = item.titulo;
        $('#nCategoria').value = item.categoria;
        $('#nData').value = item.data || '';
        $('#nResumo').value = item.resumo;
        $('#nConteudo').value = item.conteudo || '';
        if (item.status !== 'publicada') {
            $('#toggleStatus').className = 'toggle';
            $('#toggleStatusHidden').value = 'rascunho';
            $('#toggleStatusLabel').textContent = 'Rascunho';
        }
    }
    openModal('modalNoticia');
}

async function saveNoticia() {
    const titulo = $('#nTitulo').value.trim();
    const categoria = $('#nCategoria').value;
    const data = $('#nData').value;
    const resumo = $('#nResumo').value.trim();
    const conteudo = $('#nConteudo').value.trim();
    const status = $('#toggleStatusHidden').value;

    if (!titulo || !resumo) {
        showToast('Preencha título e resumo.', 'error');
        return;
    }

    const existing = editingNoticia ? state.noticias.find(n => n.id === editingNoticia) : null;
    const item = Object.assign({}, existing || {}, { titulo, categoria, data, resumo, conteudo, status });
    if (editingNoticia) item.id = editingNoticia;

    const res = await CSP_API.saveNoticia(item, editingNoticia ? 'update' : 'create');
    if (!res.ok) { showToast(res.error || 'Erro ao salvar. Você está logado?', 'error'); return; }

    await reloadNoticias();
    closeModal('modalNoticia');
    renderNoticias($('#searchNoticias').value);
    updateCounts();
    showToast(editingNoticia ? 'Notícia atualizada!' : 'Notícia publicada!');
}

async function deleteNoticia(id) {
    if (!confirm('Excluir esta notícia definitivamente? Ela sairá do site para todos.')) return;
    const res = await CSP_API.deleteNoticia(id);
    if (!res.ok) { showToast(res.error || 'Erro ao excluir.', 'error'); return; }
    await reloadNoticias();
    renderNoticias($('#searchNoticias').value);
    updateCounts();
    showToast('Notícia excluída.', 'warning');
}

function toggleStatus(btn) {
    const isOn = btn.classList.contains('on');
    btn.classList.toggle('on', !isOn);
    $('#toggleStatusHidden').value = isOn ? 'rascunho' : 'publicada';
    $('#toggleStatusLabel').textContent = isOn ? 'Rascunho' : 'Publicada';
}

/* ===== PRODUTOS ===== */
let editingProduto = null;

function renderProdutos(filter = '') {
    const list = state.produtos;
    const tbody = $('#produtosTableBody');
    const fl = filter.toLowerCase();
    const filtered = fl
        ? list.filter(p => (p.nome || '').toLowerCase().includes(fl) || (p.categoriaLabel || p.categoria || '').toLowerCase().includes(fl) || (p.marcaLabel || p.marca || '').toLowerCase().includes(fl))
        : list;

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="5">
                <div class="empty-state">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                    <p>${fl ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado.'}</p>
                    ${!fl ? `<div class="empty-action"><button class="btn btn-md btn-primary-admin" onclick="openProdutoModal()">Novo Produto</button></div>` : ''}
                </div>
            </td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(p => `
        <tr>
            <td><div class="table-title">${escHtml(p.nome)}</div></td>
            <td><span class="badge badge-cat">${escHtml(p.categoriaLabel || p.categoria)}</span></td>
            <td>${p.marca ? `<span class="badge badge-marca">${escHtml(p.marcaLabel || p.marca)}</span>` : '<span style="color:#ccc">—</span>'}</td>
            <td style="font-size:.8125rem; color:#888; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escHtml(p.descricao)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-sm btn-edit-admin" onclick="openProdutoModal('${p.id}')">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Editar
                    </button>
                    <button class="btn btn-sm btn-danger-admin" onclick="deleteProduto('${p.id}')">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        Excluir
                    </button>
                </div>
            </td>
        </tr>`).join('');
}

function openProdutoModal(id = null) {
    editingProduto = id;
    const isEdit = !!id;
    $('#modalProdutoTitle').textContent = isEdit ? 'Editar Produto' : 'Novo Produto';
    const form = $('#formProduto');
    form.reset();

    if (isEdit) {
        const item = state.produtos.find(p => p.id === id);
        if (!item) return;
        $('#pNome').value = item.nome;
        $('#pCategoria').value = item.categoria;
        $('#pMarca').value = item.marca || '';
        $('#pTipo').value = item.tipo || '';
        $('#pAplicacao').value = item.aplicacao || '';
        $('#pDescricao').value = item.descricao;
        $('#pEmbalagem').value = item.embalagem || '';
        $('#pDetalhes').value = item.detalhes || '';
        $('#pTags').value = (item.tags || []).join(', ');
    }
    openModal('modalProduto');
}

async function saveProduto() {
    const nome = $('#pNome').value.trim().toUpperCase();
    const categoriaEl = $('#pCategoria');
    const categoria = categoriaEl.value;
    const categoriaLabel = (categoria && categoriaEl.selectedIndex >= 0) ? categoriaEl.options[categoriaEl.selectedIndex].text : '';
    const marcaEl = $('#pMarca');
    const marca = marcaEl.value;
    const marcaLabel = (marca && marcaEl.selectedIndex >= 0) ? marcaEl.options[marcaEl.selectedIndex].text : '';
    const tipo = $('#pTipo').value.trim();
    const aplicacao = $('#pAplicacao').value.trim();
    const descricao = $('#pDescricao').value.trim();
    // Uma embalagem por linha; normaliza para \n e descarta linhas vazias.
    const embalagem = $('#pEmbalagem').value.split(/\r?\n/).map(l => l.trim()).filter(Boolean).join('\n');
    const detalhes = $('#pDetalhes').value.replace(/\r\n/g, '\n').trim();
    const tags = $('#pTags').value.split(',').map(t => t.trim()).filter(Boolean);

    if (!nome || !descricao) {
        showToast('Preencha nome e descrição.', 'error');
        return;
    }

    const existing = editingProduto ? state.produtos.find(p => p.id === editingProduto) : null;
    const item = Object.assign({}, existing || {}, {
        nome, categoria, categoriaLabel, marca, marcaLabel,
        tipo, aplicacao, descricao, embalagem, detalhes, tags,
        tag: (existing && existing.tag) ? existing.tag : categoriaLabel,
    });
    if (editingProduto) item.id = editingProduto;

    const res = await CSP_API.saveProduto(item, editingProduto ? 'update' : 'create');
    if (!res.ok) { showToast(res.error || 'Erro ao salvar. Você está logado?', 'error'); return; }

    await reloadProdutos();
    closeModal('modalProduto');
    renderProdutos($('#searchProdutos').value);
    updateCounts();
    showToast(editingProduto ? 'Produto atualizado!' : 'Produto adicionado!');
}

async function deleteProduto(id) {
    if (!confirm('Excluir este produto definitivamente? Ele sairá do catálogo para todos.')) return;
    const res = await CSP_API.deleteProduto(id);
    if (!res.ok) { showToast(res.error || 'Erro ao excluir.', 'error'); return; }
    await reloadProdutos();
    renderProdutos($('#searchProdutos').value);
    updateCounts();
    showToast('Produto excluído.', 'warning');
}

/* ===== CONFIGURAÇÕES ===== */
async function saveNewPwd() {
    const old = $('#cfgOldPwd').value;
    const novo = $('#cfgNewPwd').value;
    const novo2 = $('#cfgNewPwd2').value;
    if (novo !== novo2) { showToast('As senhas não coincidem.', 'error'); return; }
    const res = await CSP_API.changePwd(old, novo);
    if (res.ok) {
        showToast('Senha alterada com sucesso!');
        $('#formChangePwd').reset();
    } else {
        showToast(res.error || 'Erro ao alterar senha.', 'error');
    }
}

async function clearAllData() {
    if (!confirm('ATENÇÃO: isso apagará TODAS as notícias e produtos do site, para todos os visitantes. Continuar?')) return;
    if (!confirm('Tem certeza absoluta? Esta ação não pode ser desfeita.')) return;
    for (const p of state.produtos.slice()) { try { await CSP_API.deleteProduto(p.id); } catch (e) {} }
    for (const n of state.noticias.slice()) { try { await CSP_API.deleteNoticia(n.id); } catch (e) {} }
    await reloadProdutos();
    await reloadNoticias();
    renderNoticias();
    renderProdutos();
    updateCounts();
    showToast('Todos os dados foram apagados.', 'warning');
}

/* ===== EXPORT / IMPORT ===== */
function exportData() {
    const data = {
        exportedAt: new Date().toISOString(),
        noticias: state.noticias,
        produtos: state.produtos,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `csp-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup exportado!');
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
        try {
            const data = JSON.parse(ev.target.result);
            let count = 0;
            for (const p of (data.produtos || [])) { const r = await CSP_API.saveProduto(p, 'update'); if (r.ok) count++; }
            for (const n of (data.noticias || [])) { const r = await CSP_API.saveNoticia(n, 'update'); if (r.ok) count++; }
            await reloadProdutos();
            await reloadNoticias();
            renderNoticias();
            renderProdutos();
            updateCounts();
            showToast(`${count} itens importados!`);
        } catch (err) {
            showToast('Arquivo inválido.', 'error');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

/* ===== LOGIN UI ===== */
function renderLogin(setup, offline) {
    $('#loginScreen').innerHTML = `
        <div class="login-card">
            <div class="login-logo">
                <img src="img/logos/csp/logo.png" alt="Comercial São Pedro">
            </div>
            <h1 class="login-title">Painel Admin</h1>
            <p class="login-subtitle">Comercial São Pedro</p>

            ${offline ? `<div class="setup-badge" style="background:#fde8e8;color:#a12">
                <strong>Sem conexão com o servidor</strong> — verifique se os arquivos da pasta <code>/api</code> e o banco MySQL estão configurados.
            </div>` : ''}
            ${(setup && !offline) ? `<div class="setup-badge">
                <strong>Primeiro acesso</strong> — defina a senha de administrador
            </div>` : ''}

            <div class="form-group">
                <label for="loginPwd">${setup ? 'Nova senha (mínimo 6 caracteres)' : 'Senha'}</label>
                <div class="input-wrap">
                    <input type="password" id="loginPwd" class="form-input has-icon" placeholder="${setup ? 'Crie sua senha' : 'Digite sua senha'}" autocomplete="${setup ? 'new-password' : 'current-password'}">
                    <button type="button" class="input-toggle" onclick="togglePwdVisibility('loginPwd', this)" aria-label="Mostrar senha" tabindex="-1">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                </div>
                <div class="error-msg" id="loginError"></div>
            </div>

            ${setup ? `<div class="form-group">
                <label for="loginPwd2">Confirmar senha</label>
                <div class="input-wrap">
                    <input type="password" id="loginPwd2" class="form-input has-icon" placeholder="Repita a senha" autocomplete="new-password">
                    <button type="button" class="input-toggle" onclick="togglePwdVisibility('loginPwd2', this)" aria-label="Mostrar senha" tabindex="-1">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                </div>
            </div>` : ''}

            <button class="btn-login" id="loginBtn" onclick="handleLogin(${setup ? 'true' : 'false'})">
                ${setup ? 'Criar senha e entrar' : 'Entrar'}
            </button>
        </div>`;

    const input = $('#loginPwd');
    if (input) {
        input.focus();
        input.addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(setup); });
    }
    const input2 = $('#loginPwd2');
    if (input2) input2.addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(setup); });
}

function togglePwdVisibility(inputId, btn) {
    const input = $(`#${inputId}`);
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.innerHTML = show
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

async function handleLogin(isSetup) {
    const btn = $('#loginBtn');
    const pwd = $('#loginPwd').value;
    const pwd2 = isSetup ? ($('#loginPwd2')?.value || '') : '';
    const errEl = $('#loginError');

    if (isSetup && pwd !== pwd2) {
        errEl.textContent = 'As senhas não coincidem.';
        errEl.classList.add('show');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Aguarde…';
    errEl.classList.remove('show');

    let res;
    try {
        res = isSetup ? await CSP_API.setup(pwd) : await CSP_API.login(pwd);
    } catch (e) {
        res = { ok: false, error: 'Sem conexão com o servidor.' };
    }

    if (res.ok) {
        await showDashboard();
    } else {
        errEl.textContent = res.error || (isSetup ? 'Não foi possível criar a senha.' : 'Senha incorreta.');
        errEl.classList.add('show');
        $('#loginPwd').classList.add('error');
        btn.disabled = false;
        btn.textContent = isSetup ? 'Criar senha e entrar' : 'Entrar';
        setTimeout(() => $('#loginPwd').classList.remove('error'), 1500);
    }
}

/* ===== DASHBOARD ===== */
async function showDashboard() {
    $('#loginScreen').classList.add('hidden');
    $('#dashboardScreen').classList.remove('hidden');
    await reloadProdutos();
    await reloadNoticias();
    navigate('dashboard');
    renderNoticias();
    renderProdutos();
    updateCounts();
}

/* ===== INIT ===== */
async function init() {
    const st = await Auth.status();
    if (st.offline) {
        renderLogin(false, true);
    } else if (st.authenticated) {
        await showDashboard();
    } else {
        renderLogin(!!st.setup, false);
    }

    // Sidebar mobile
    $('#sidebarToggle')?.addEventListener('click', () => {
        $('#adminSidebar').classList.toggle('mobile-open');
        $('#sidebarOverlay').classList.toggle('show');
    });
    $('#sidebarOverlay')?.addEventListener('click', () => {
        $('#adminSidebar').classList.remove('mobile-open');
        $('#sidebarOverlay').classList.remove('show');
    });

    // Fechar modais com Esc
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            $$('.modal-overlay.open').forEach(m => {
                m.classList.remove('open');
                document.body.style.overflow = '';
            });
        }
    });

    // Fechar modal ao clicar no overlay
    $$('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => {
            if (e.target === overlay) {
                overlay.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', init);
