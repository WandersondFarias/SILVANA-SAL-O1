/* =========================================================
   Salão Unissex — Sistema de gestão
   HTML + CSS + JavaScript puro
   ========================================================= */
'use strict';

/* ---------------- Utilitários ---------------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const brl = v => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const pad = n => String(n).padStart(2, '0');
const dstr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hoje = () => dstr(new Date());
const toDate = s => new Date(s + 'T12:00:00');
const addDias = (s, n) => { const d = toDate(s); d.setDate(d.getDate() + n); return dstr(d); };
const fmtData = s => s ? s.split('-').reverse().join('/') : '';
const diaLongo = s => toDate(s).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
const porNome = (a, b) => String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR');
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : 0; };
const iniciais = n => String(n || '?').trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const PAG = { pix: 'Pix', debito: 'Débito', credito: 'Crédito', dinheiro: 'Dinheiro' };
const STATUS = { agendado: 'Agendado', concluido: 'Concluído', cancelado: 'Cancelado', faltou: 'Não compareceu' };
const CATEGORIAS = ['Corte', 'Barba', 'Coloração', 'Química', 'Tratamento', 'Escova/Penteado', 'Estética', 'Outros'];
const PUBLICOS = ['Unissex', 'Feminino', 'Masculino'];
const GENEROS = ['Feminino', 'Masculino', 'Outro', 'Não informar'];
const MOTIVOS = ['Imprevisto pessoal', 'Problema de saúde', 'Conflito de horário', 'Desistiu do serviço', 'Atraso / trânsito', 'Clima', 'Profissional indisponível', 'Outro'];

/* ---------------- Dados do salão (padrão) ---------------- */
const SALAO_PADRAO = {
  endereco: 'Rua Nair Borges Bento, 515',
  bairro: 'Manoel Mendes',
  cidade: 'Uberaba - MG',
  cep: '38082-167'
};
// devolve os dados do salão, completando com o endereço padrão quando estiver vazio
function cfg() {
  const c = S.config || {};
  return {
    nome: c.nome || 'Studio Unissex',
    whatsapp: c.whatsapp || c.telefone || '',
    fixo: c.fixo || '',
    email: c.email || '',
    instagram: c.instagram || '',
    horario: c.horario || '',
    cnpj: c.cnpj || '',
    endereco: c.endereco || SALAO_PADRAO.endereco,
    bairro: c.bairro || (c.endereco ? '' : SALAO_PADRAO.bairro),
    cidade: c.cidade || SALAO_PADRAO.cidade,
    cep: c.cep || SALAO_PADRAO.cep
  };
}
const enderecoCompleto = c => [c.endereco, c.bairro, c.cidade, c.cep ? 'CEP ' + c.cep : ''].filter(Boolean).join(', ');
const soDigitos = s => String(s || '').replace(/\D/g, '');
const linkWhats = n => { let d = soDigitos(n); if (!d) return ''; if (d.length <= 11) d = '55' + d; return 'https://wa.me/' + d; };
const linkMapa = c => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(enderecoCompleto(c));

/* ---------------- Estado ---------------- */
const COLS = ['clientes', 'servicos', 'produtos', 'profissionais', 'atendimentos'];
const S = {
  clientes: [], servicos: [], produtos: [], profissionais: [], atendimentos: [],
  config: { nome: 'Studio Unissex', telefone: '', endereco: '', cnpj: '' }
};
let DB = null;          // banco na nuvem (quando disponível)
let DL = null;          // capacidade de download (PDF)
let modo = 'carregando';
let carregado = false;

const UI = {
  tab: 'painel',
  periodo: '30',
  agData: hoje(), agRange: 'dia', agStatus: '', agProf: '', agBusca: '',
  cliBusca: '', cliGenero: '',
  servBusca: '', servCat: '',
  prodBusca: '',
  relIni: addDias(hoje(), -29), relFim: hoje(), relProf: ''
};

function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

/* ---------------- Catálogo padrão ---------------- */
function catalogoPadrao() {
  const sv = (nome, categoria, publico, preco, duracao) => ({ id: uid(), nome, categoria, publico, preco, duracao, ativo: true });
  const pr = (nome, marca, preco, estoque, minimo) => ({ id: uid(), nome, marca, preco, estoque, minimo });
  const pf = (nome, especialidade, comissao) => ({ id: uid(), nome, especialidade, comissao, telefone: '', ativo: true });
  return {
    servicos: [
      sv('Corte feminino', 'Corte', 'Feminino', 80, 60),
      sv('Corte masculino', 'Corte', 'Masculino', 45, 30),
      sv('Corte infantil', 'Corte', 'Unissex', 35, 30),
      sv('Barba completa', 'Barba', 'Masculino', 35, 30),
      sv('Corte + barba', 'Barba', 'Masculino', 70, 50),
      sv('Escova', 'Escova/Penteado', 'Unissex', 50, 45),
      sv('Penteado', 'Escova/Penteado', 'Feminino', 120, 60),
      sv('Hidratação', 'Tratamento', 'Unissex', 70, 45),
      sv('Coloração (raiz)', 'Coloração', 'Unissex', 120, 90),
      sv('Luzes / mechas', 'Coloração', 'Feminino', 280, 180),
      sv('Platinado masculino', 'Coloração', 'Masculino', 150, 120),
      sv('Progressiva', 'Química', 'Unissex', 250, 150),
      sv('Design de sobrancelha', 'Estética', 'Unissex', 30, 20)
    ],
    produtos: [
      pr('Shampoo profissional 300 ml', 'Linha Salão', 59.9, 12, 3),
      pr('Condicionador 300 ml', 'Linha Salão', 59.9, 10, 3),
      pr('Máscara de hidratação 250 g', 'Linha Salão', 79.9, 8, 2),
      pr('Leave-in 150 ml', 'Linha Salão', 49.9, 9, 2),
      pr('Pomada modeladora', 'Barber Pro', 39.9, 15, 4),
      pr('Óleo para barba 30 ml', 'Barber Pro', 45, 6, 2),
      pr('Spray fixador', 'Linha Salão', 42, 5, 2)
    ],
    profissionais: [
      pf('Ana', 'Coloração e química', 40),
      pf('Bruno', 'Barbeiro', 40),
      pf('Carla', 'Cabeleireira', 35)
    ]
  };
}

/* ---------------- Persistência ---------------- */
function persistLocal() {
  if (modo !== 'local') return;
  lsSet('salao_dados_v1', JSON.stringify(S));
}

function setSync(txt, cls) {
  const el = $('#sync');
  el.textContent = txt;
  el.className = 'sync ' + (cls || '');
}

function erroMsg(e) {
  const c = e && e.code;
  if (c === 'quota_exceeded') return 'Limite de armazenamento atingido. Exclua registros antigos.';
  if (c === 'invalid_argument') return 'Sem permissão para salvar (acesso somente leitura?).';
  if (c === 'resource_exhausted') return 'Muitas operações seguidas. Aguarde um instante.';
  return 'Não foi possível salvar: ' + ((e && (e.message || e.code)) || 'erro');
}

async function salvar(col, obj) {
  const lista = S[col];
  const i = lista.findIndex(x => x.id === obj.id);
  if (i >= 0) lista[i] = obj; else lista.push(obj);
  if (DB) {
    try { await DB.collection(col).doc(obj.id).set(JSON.parse(JSON.stringify(obj))); }
    catch (e) { toast(erroMsg(e), 'danger'); throw e; }
  } else persistLocal();
  agendarRender();
}

async function remover(col, id) {
  S[col] = S[col].filter(x => x.id !== id);
  if (DB) {
    try { await DB.collection(col).doc(id).delete(); }
    catch (e) { toast(erroMsg(e), 'danger'); }
  } else persistLocal();
  agendarRender();
}

async function salvarConfig(cfg) {
  S.config = { ...S.config, ...cfg };
  if (DB) {
    try { await DB.doc('config/salao').set(S.config); } catch (e) { toast(erroMsg(e), 'danger'); return; }
  } else persistLocal();
  agendarRender();
}

async function emLotes(itens, fn, tam = 6) {
  for (let i = 0; i < itens.length; i += tam) await Promise.all(itens.slice(i, i + tam).map(fn));
}

function iniciarLocal() {
  modo = 'local';
  DB = null;
  const raw = lsGet('salao_dados_v1');
  let ok = false;
  if (raw) {
    try { const d = JSON.parse(raw); COLS.forEach(c => { if (Array.isArray(d[c])) S[c] = d[c]; }); if (d.config) S.config = { ...S.config, ...d.config }; ok = true; } catch (e) { }
  }
  if (!ok) { const cat = catalogoPadrao(); S.servicos = cat.servicos; S.produtos = cat.produtos; S.profissionais = cat.profissionais; persistLocal(); }
  carregado = true;
  setSync('Modo local · dados neste navegador', 'warn');
  agendarRender();
}

async function iniciar() {
  if (!window.claude || typeof window.claude.use !== 'function') { iniciarLocal(); return; }
  window.claude.use('downloads').then(d => { DL = d; }).catch(() => { });
  let db = null;
  try { db = await window.claude.use('db'); } catch (e) { db = null; }
  if (!db) { iniciarLocal(); return; }
  DB = db; modo = 'nuvem';
  setSync('Sincronizando…', '');
  const pend = new Set(COLS.concat('config'));
  const timer = setTimeout(() => { if (pend.size) setSync('Dados ainda não alcançados…', 'warn'); }, 10000);
  const pronto = (k, fromCache) => {
    if (!fromCache) pend.delete(k);
    if (!pend.size) { clearTimeout(timer); carregado = true; setSync('Sincronizado na nuvem', 'ok'); }
  };
  const falha = k => e => {
    pend.delete(k); clearTimeout(timer); carregado = true;
    setSync('Erro de sincronização', 'danger');
    toast('Falha ao carregar ' + k + ': ' + (e && e.code), 'danger');
    agendarRender();
  };
  COLS.forEach(c => {
    DB.collection(c).onSnapshot(snap => {
      S[c] = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      pronto(c, snap.metadata.fromCache);
      agendarRender();
    }, falha(c));
  });
  DB.doc('config/salao').onSnapshot(s => {
    if (s.exists) S.config = { ...S.config, ...s.data() };
    pronto('config', s.metadata.fromCache);
    agendarRender();
  }, falha('config'));
}

/* ---------------- Estoque ---------------- */
function usoProdutos(a) {
  const m = {};
  if (a && a.status === 'concluido' && !a.demo) (a.produtos || []).forEach(p => { m[p.id] = (m[p.id] || 0) + (num(p.qtd)); });
  return m;
}
async function ajustarEstoque(antigo, novo) {
  const u0 = usoProdutos(antigo), u1 = usoProdutos(novo);
  const ids = new Set([...Object.keys(u0), ...Object.keys(u1)]);
  for (const id of ids) {
    const d = (u0[id] || 0) - (u1[id] || 0);
    if (!d) continue;
    const p = S.produtos.find(x => x.id === id);
    if (!p) continue;
    await salvar('produtos', { ...p, estoque: num(p.estoque) + d });
  }
}

/* ---------------- Cálculos ---------------- */
function noPeriodo(lista, ini, fim) { return lista.filter(a => a.data >= ini && a.data <= fim); }
function somaServ(a) { return (a.servicos || []).reduce((s, x) => s + num(x.preco), 0); }
function somaProd(a) { return (a.produtos || []).reduce((s, x) => s + num(x.preco) * num(x.qtd), 0); }
function calcTotal(a) { return Math.max(0, somaServ(a) + somaProd(a) - num(a.desconto)); }

function resumo(lista) {
  const concl = lista.filter(a => a.status === 'concluido');
  const canc = lista.filter(a => a.status === 'cancelado');
  const falt = lista.filter(a => a.status === 'faltou');
  const fat = concl.reduce((s, a) => s + num(a.total), 0);
  const fatServ = concl.reduce((s, a) => s + somaServ(a), 0);
  const fatProd = concl.reduce((s, a) => s + somaProd(a), 0);
  const desc = concl.reduce((s, a) => s + num(a.desconto), 0);
  const base = concl.length + canc.length + falt.length;
  const pag = { pix: 0, debito: 0, credito: 0, dinheiro: 0 }, pagQ = { pix: 0, debito: 0, credito: 0, dinheiro: 0 };
  concl.forEach(a => { if (a.pagamento in pag) { pag[a.pagamento] += num(a.total); pagQ[a.pagamento]++; } });
  return {
    concl, canc, falt, fat, fatServ, fatProd, desc, pag, pagQ,
    agend: lista.filter(a => a.status === 'agendado'),
    ticket: concl.length ? fat / concl.length : 0,
    taxaCanc: base ? (canc.length + falt.length) / base : 0
  };
}

function rankingServicos(concl) {
  const m = {};
  concl.forEach(a => (a.servicos || []).forEach(s => {
    const k = s.nome || '—';
    m[k] = m[k] || { nome: k, qtd: 0, valor: 0 };
    m[k].qtd++; m[k].valor += num(s.preco);
  }));
  return Object.values(m).sort((a, b) => b.qtd - a.qtd || b.valor - a.valor);
}

function porProfissional(concl) {
  const m = {};
  concl.forEach(a => {
    const p = S.profissionais.find(x => x.id === a.profissionalId);
    const k = a.profissionalId || '_';
    const nome = p ? p.nome : (a.profNome || 'Sem profissional');
    m[k] = m[k] || { id: k, nome, qtd: 0, fat: 0, serv: 0, comissaoPct: p ? num(p.comissao) : 0 };
    m[k].qtd++; m[k].fat += num(a.total); m[k].serv += somaServ(a);
  });
  return Object.values(m).map(x => ({ ...x, comissao: x.serv * x.comissaoPct / 100 })).sort((a, b) => b.fat - a.fat);
}

function rangePeriodo(p) {
  const h = hoje(), d = new Date();
  if (p === 'hoje') return [h, h];
  if (p === '7') return [addDias(h, -6), h];
  if (p === '30') return [addDias(h, -29), h];
  if (p === 'mes') return [dstr(new Date(d.getFullYear(), d.getMonth(), 1)), dstr(new Date(d.getFullYear(), d.getMonth() + 1, 0))];
  if (p === 'ano') return [`${d.getFullYear()}-01-01`, `${d.getFullYear()}-12-31`];
  return [h, h];
}
function diasEntre(a, b) { return Math.round((toDate(b) - toDate(a)) / 864e5) + 1; }

/* ---------------- Toast / modal / confirmação ---------------- */
function toast(msg, tipo = '') {
  const t = document.createElement('div');
  t.className = 'toast ' + tipo;
  t.textContent = msg;
  $('#toasts').appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 3200);
  setTimeout(() => t.remove(), 3600);
}

function abrirModal(titulo, html) {
  $('#mTitle').textContent = titulo;
  $('#mBody').innerHTML = html;
  $('#overlay').hidden = false;
  rotularTabelas($('#mBody'));
  const f = $('#mBody input:not([type=hidden]), #mBody select');
  if (f) setTimeout(() => f.focus(), 30);
  return $('#mBody');
}
// No celular as tabelas viram cartões: cada célula recebe o nome da sua coluna
function rotularTabelas(root) {
  $$('table', root).forEach(t => {
    const nomes = $$('thead th', t).map(th => th.textContent.trim());
    $$('tbody tr', t).forEach(tr => {
      Array.from(tr.children).forEach((td, i) => {
        if (td.hasAttribute('colspan')) { td.classList.add('td-vazio'); return; }
        td.setAttribute('data-label', nomes[i] || '');
        if (i === 0) td.classList.add('td-titulo');
        if (td.querySelector('.acts')) td.classList.add('td-acoes');
      });
    });
  });
}
function fecharModal() { $('#overlay').hidden = true; $('#mBody').innerHTML = ''; }

function confirmar(msg, ok = 'Confirmar', perigo = false) {
  return new Promise(res => {
    $('#cMsg').textContent = msg;
    const yes = $('#cYes'), no = $('#cNo');
    yes.textContent = ok;
    yes.className = 'btn ' + (perigo ? 'danger' : 'primary');
    $('#confirmOv').hidden = false;
    const fim = v => { $('#confirmOv').hidden = true; yes.onclick = no.onclick = null; res(v); };
    yes.onclick = () => fim(true);
    no.onclick = () => fim(false);
    yes.focus();
  });
}

/* ---------------- Tema ---------------- */
function marcarTema() {
  const atual = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  $$('.theme-opt').forEach(b => { const on = b.dataset.tema === atual; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
}
function aplicarTema(t) {
  if (document.documentElement.getAttribute('data-theme') === t) return;
  document.documentElement.setAttribute('data-theme', t);
  lsSet('salao_tema', t);
  marcarTema();
  if (UI.tab === 'painel' || UI.tab === 'relatorios') renderBody();
}

/* ---------------- Gráficos ---------------- */
const charts = {};
function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
function barChart(id, labels, data, opt = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
  const box = el.parentElement;
  if (!window.Chart) { box.innerHTML = '<div class="chart-empty">Gráfico indisponível (biblioteca não carregou)</div>'; return; }
  if (!data.some(v => v > 0)) { box.innerHTML = `<div class="chart-empty">${esc(opt.vazio || 'Sem dados no período')}</div>`; return; }
  const h = !!opt.horizontal, money = opt.money !== false;
  const txt = cssVar('--text-2'), grid = cssVar('--grid');
  const fmtTick = v => money ? (v >= 1000 ? 'R$ ' + (v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil' : 'R$ ' + v) : v;
  const valAxis = { beginAtZero: true, grid: { color: grid, drawTicks: false }, border: { display: false }, ticks: { color: txt, padding: 6, precision: money ? undefined : 0, callback: fmtTick, maxTicksLimit: 6 } };
  const catAxis = { grid: { display: false }, border: { color: grid }, ticks: { color: txt, autoSkip: true, maxRotation: 0 } };
  charts[id] = new Chart(el, {
    type: 'bar',
    data: { labels, datasets: [{ data, backgroundColor: cssVar('--chart'), hoverBackgroundColor: cssVar('--chart-hover'), borderRadius: 4, borderSkipped: 'start', maxBarThickness: h ? 22 : 30, categoryPercentage: .8, barPercentage: .9 }] },
    options: {
      indexAxis: h ? 'y' : 'x',
      responsive: true, maintainAspectRatio: false,
      animation: { duration: 350 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: cssVar('--surface'), titleColor: cssVar('--text'), bodyColor: cssVar('--text-2'),
          borderColor: cssVar('--border'), borderWidth: 1, padding: 10, displayColors: false,
          callbacks: { label: c => { const v = h ? c.parsed.x : c.parsed.y; return opt.tip ? opt.tip(v, c.dataIndex) : (money ? brl(v) : v + ' atendimento(s)'); } }
        }
      },
      scales: h ? { x: valAxis, y: catAxis } : { x: catAxis, y: valAxis }
    }
  });
}

/* ---------------- Renderização ---------------- */
const TITULOS = { painel: 'Painel', agenda: 'Agenda', clientes: 'Clientes', servicos: 'Serviços', produtos: 'Produtos', equipe: 'Equipe', relatorios: 'Relatórios', ajustes: 'Ajustes' };
let rafPend = false;
function agendarRender() {
  if (rafPend) return;
  rafPend = true;
  requestAnimationFrame(() => { rafPend = false; renderBody(); });
}

function irPara(tab) {
  if (!TITULOS[tab]) tab = 'painel';
  UI.tab = tab;
  $$('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  $('#pageTitle').textContent = TITULOS[tab];
  if (location.hash.slice(1) !== tab) { try { history.replaceState(null, '', '#' + tab); } catch (e) { } }
  $('#toolbar').innerHTML = (VIEWS[tab].toolbar || (() => ''))();
  renderBody();
  window.scrollTo(0, 0);
}

function renderBody() {
  $('#brandName').textContent = S.config.nome || 'Studio Unissex';
  renderRodape();
  if (!carregado) { $('#vbody').innerHTML = '<div class="empty"><div class="big">⏳</div>Carregando dados do salão…</div>'; return; }
  const v = VIEWS[UI.tab];
  $('#vbody').innerHTML = v.body();
  rotularTabelas($('#vbody'));
  if (v.after) v.after();
}

const opts = (lista, sel, vazio) => (vazio !== undefined ? `<option value="">${esc(vazio)}</option>` : '') + lista.map(o => {
  const [v, l] = Array.isArray(o) ? o : [o, o];
  return `<option value="${esc(v)}" ${String(v) === String(sel) ? 'selected' : ''}>${esc(l)}</option>`;
}).join('');
const badgeStatus = s => `<span class="badge b-${s}">${STATUS[s] || s}</span>`;
const badgePag = a => a.pagamento ? `<span class="badge ${a.pagamento === 'pix' ? 'b-pix' : ''}">${PAG[a.pagamento]}${a.pagamento === 'credito' && num(a.parcelas) > 1 ? ' ' + a.parcelas + 'x' : ''}</span>` : '';
const vazio = (ico, txt, botao = '') => `<div class="empty"><div class="big">${ico}</div><div>${txt}</div>${botao ? `<div style="margin-top:14px">${botao}</div>` : ''}</div>`;
const nomeCliente = a => { const c = S.clientes.find(x => x.id === a.clienteId); return c ? c.nome : (a.clienteNome || 'Cliente removido'); };
const nomeProf = a => { const p = S.profissionais.find(x => x.id === a.profissionalId); return p ? p.nome : (a.profNome || ''); };

/* ---------------- Rodapé ---------------- */
let rodapeCache = '';
function renderRodape() {
  const c = cfg();
  const ano = new Date().getFullYear();
  const wa = linkWhats(c.whatsapp);
  const tel = soDigitos(c.fixo);
  const ig = c.instagram ? c.instagram.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '') : '';
  const config = `<button type="button" class="foot-config" data-tab="ajustes">cadastrar em Ajustes</button>`;
  const html = `
    <div class="foot-grid">
      <div class="foot-col foot-brand">
        <div class="foot-name">${esc(c.nome)}</div>
        <p>Salão de beleza unissex · cortes, coloração, tratamentos e barbearia.</p>
        ${c.horario ? `<p class="foot-hours"><span aria-hidden="true">🕘</span> ${esc(c.horario)}</p>` : ''}
        ${c.cnpj ? `<p class="foot-small">CNPJ/CPF ${esc(c.cnpj)}</p>` : ''}
      </div>
      <div class="foot-col">
        <h4>Contato</h4>
        <ul class="foot-list">
          <li><span class="foot-ico wa" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s1 2.5 1.1 2.7c.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg></span>
            <div><small>WhatsApp</small>${wa ? `<a href="${wa}" target="_blank" rel="noopener">${esc(c.whatsapp)}</a>` : config}</div></li>
          <li><span class="foot-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg></span>
            <div><small>Telefone fixo</small>${tel ? `<a href="tel:${tel}">${esc(c.fixo)}</a>` : config}</div></li>
          ${c.email ? `<li><span class="foot-ico" aria-hidden="true">✉</span><div><small>E-mail</small><span>${esc(c.email)}</span></div></li>` : ''}
          ${ig ? `<li><span class="foot-ico" aria-hidden="true">◎</span><div><small>Instagram</small><a href="https://instagram.com/${encodeURIComponent(ig)}" target="_blank" rel="noopener">@${esc(ig)}</a></div></li>` : ''}
        </ul>
      </div>
      <div class="foot-col">
        <h4>Localização</h4>
        <ul class="foot-list">
          <li><span class="foot-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
            <div><span>${esc(c.endereco)}</span>${c.bairro ? `<span>${esc(c.bairro)}</span>` : ''}<span>${esc(c.cidade)}${c.cep ? ' · CEP ' + esc(c.cep) : ''}</span></div></li>
        </ul>
        <a class="btn sm foot-map" href="${linkMapa(c)}" target="_blank" rel="noopener">Ver no mapa / Como chegar</a>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© ${ano} ${esc(c.nome)} · Todos os direitos reservados</span>
      <button type="button" class="foot-top" data-topo>Voltar ao topo ↑</button>
    </div>`;
  if (html !== rodapeCache) { rodapeCache = html; $('#rodape').innerHTML = html; }
}
function irTopo() { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); } }

/* ================= VIEWS ================= */
const VIEWS = {};

/* ---------- PAINEL ---------- */
VIEWS.painel = {
  toolbar: () => `
    <div class="seg" id="segPeriodo">
      ${[['hoje', 'Hoje'], ['7', '7 dias'], ['30', '30 dias'], ['mes', 'Este mês'], ['ano', 'Este ano']].map(([k, l]) => `<button data-per="${k}" class="${UI.periodo === k ? 'active' : ''}">${l}</button>`).join('')}
    </div>
    <button class="btn primary" data-act="novoAt">+ Novo atendimento</button>`,
  body() {
    const [ini, fim] = rangePeriodo(UI.periodo);
    const n = diasEntre(ini, fim);
    const r = resumo(noPeriodo(S.atendimentos, ini, fim));
    const rp = resumo(noPeriodo(S.atendimentos, addDias(ini, -n), addDias(ini, -1)));
    const cmp = (a, b, inv) => {
      if (!b) return '<span class="cmp">sem base anterior</span>';
      const p = (a - b) / b * 100, bom = inv ? p <= 0 : p >= 0;
      return `<span class="${bom ? 'up' : 'down'}">${p >= 0 ? '▲' : '▼'} ${Math.abs(p).toFixed(0)}%</span> vs. período anterior`;
    };
    const semCatalogo = !S.servicos.length;
    const h = hoje();
    const hojeLista = S.atendimentos.filter(a => a.data === h && a.status === 'agendado').sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));
    const baixo = S.produtos.filter(p => num(p.estoque) <= num(p.minimo)).sort((a, b) => num(a.estoque) - num(b.estoque));
    return `
      ${semCatalogo ? `<div class="banner"><div><b>Bem-vindo!</b> Seu catálogo está vazio. Carregue serviços, produtos e equipe de exemplo para começar (dá para editar tudo depois).</div><button class="btn primary" data-act="catalogo">Carregar catálogo padrão</button></div>` : ''}
      <div class="kpis">
        <div class="card kpi"><div class="lbl">💰 Faturamento</div><div class="val">${brl(r.fat)}</div><div class="cmp">${cmp(r.fat, rp.fat)}</div></div>
        <div class="card kpi k2"><div class="lbl">✂️ Atendimentos concluídos</div><div class="val">${r.concl.length}</div><div class="cmp">${cmp(r.concl.length, rp.concl.length)}</div></div>
        <div class="card kpi k3"><div class="lbl">🧾 Ticket médio</div><div class="val">${brl(r.ticket)}</div><div class="cmp">${cmp(r.ticket, rp.ticket)}</div></div>
        <div class="card kpi k4"><div class="lbl">🚫 Cancelamentos e faltas</div><div class="val">${r.canc.length + r.falt.length} <small style="font-size:14px">(${(r.taxaCanc * 100).toFixed(0)}%)</small></div><div class="cmp">${r.canc.length} cancelado(s) · ${r.falt.length} falta(s)</div></div>
      </div>
      <div class="grid2c">
        <div class="card"><h3>Faturamento por ${UI.periodo === 'ano' ? 'mês' : 'dia'}</h3><div class="sub">${UI.periodo === 'hoje' ? 'Últimos 7 dias' : fmtData(ini) + ' a ' + fmtData(fim)} · atendimentos concluídos</div><div class="chart-box"><canvas id="chDia"></canvas></div></div>
        <div class="card"><h3>Formas de pagamento</h3><div class="sub">Quanto entrou em cada forma no período</div><div class="chart-box"><canvas id="chPag"></canvas></div></div>
        <div class="card"><h3>Serviços mais realizados</h3><div class="sub">Quantidade no período</div><div class="chart-box"><canvas id="chServ"></canvas></div></div>
        <div class="card"><h3>Faturamento por profissional</h3><div class="sub">Serviços + produtos no período</div><div class="chart-box"><canvas id="chProf"></canvas></div></div>
      </div>
      <div class="grid2c">
        <div class="card"><h3>Serviços × produtos</h3><div class="sub">Composição da receita no período</div>
          <ul class="mini-list">
            <li><span>Serviços</span><b class="num">${brl(r.fatServ)}</b></li>
            <li><span>Venda de produtos</span><b class="num">${brl(r.fatProd)}</b></li>
            <li><span>Descontos concedidos</span><b class="num">− ${brl(r.desc)}</b></li>
            <li><span><b>Total recebido</b></span><b class="num">${brl(r.fat)}</b></li>
            <li><span>Agendamentos em aberto no período</span><b class="num">${r.agend.length}</b></li>
          </ul>
        </div>
        <div class="card"><h3>Próximos de hoje</h3><div class="sub">${diaLongo(h)}</div>
          ${hojeLista.length ? `<ul class="mini-list">${hojeLista.slice(0, 7).map(a => `<li><span><b class="num">${esc(a.hora)}</b> · ${esc(nomeCliente(a))}<br><small>${esc((a.servicos || []).map(s => s.nome).join(', ') || 'Venda de produtos')}${nomeProf(a) ? ' · ' + esc(nomeProf(a)) : ''}</small></span><button class="btn sm ok" data-act="finalizar" data-id="${a.id}">Finalizar</button></li>`).join('')}</ul>` : '<p class="muted">Nenhum horário pendente para hoje.</p>'}
          ${baixo.length ? `<h3 style="margin-top:14px">Estoque baixo</h3><ul class="mini-list">${baixo.slice(0, 5).map(p => `<li><span>${esc(p.nome)}</span><span class="badge ${num(p.estoque) <= 0 ? 'b-zero' : 'b-low'}">${num(p.estoque)} un.</span></li>`).join('')}</ul>` : ''}
        </div>
      </div>`;
  },
  after() {
    let [ini, fim] = rangePeriodo(UI.periodo);
    if (UI.periodo === 'hoje') ini = addDias(fim, -6);
    const concl = noPeriodo(S.atendimentos, ini, fim).filter(a => a.status === 'concluido');
    if (UI.periodo === 'ano') {
      const v = Array(12).fill(0);
      concl.forEach(a => { v[toDate(a.data).getMonth()] += num(a.total); });
      barChart('chDia', MESES, v);
    } else {
      const labels = [], v = [], idx = {};
      for (let d = ini; d <= fim; d = addDias(d, 1)) { idx[d] = v.length; labels.push(d.slice(8) + '/' + d.slice(5, 7)); v.push(0); }
      concl.forEach(a => { if (idx[a.data] != null) v[idx[a.data]] += num(a.total); });
      barChart('chDia', labels, v);
    }
    const [i2, f2] = rangePeriodo(UI.periodo);
    const r = resumo(noPeriodo(S.atendimentos, i2, f2));
    const ks = Object.keys(PAG);
    const tot = r.fat || 1;
    barChart('chPag', ks.map(k => `${PAG[k]} · ${Math.round(r.pag[k] / tot * 100)}%`), ks.map(k => r.pag[k]), { horizontal: true, tip: (v, i) => `${brl(v)} em ${r.pagQ[ks[i]]} pagamento(s)` });
    const rk = rankingServicos(r.concl).slice(0, 6);
    barChart('chServ', rk.map(x => x.nome), rk.map(x => x.qtd), { horizontal: true, money: false, tip: (v, i) => `${v} vez(es) · ${brl(rk[i].valor)}` });
    const pp = porProfissional(r.concl);
    barChart('chProf', pp.map(x => x.nome), pp.map(x => x.fat), { horizontal: true, tip: (v, i) => `${brl(v)} · ${pp[i].qtd} atendimento(s)` });
  }
};

/* ---------- AGENDA ---------- */
function rangeAgenda() {
  const d = UI.agData;
  if (UI.agRange === 'dia') return [d, d];
  if (UI.agRange === 'semana') { const wd = (toDate(d).getDay() + 6) % 7; const ini = addDias(d, -wd); return [ini, addDias(ini, 6)]; }
  if (UI.agRange === 'mes') { const x = toDate(d); return [dstr(new Date(x.getFullYear(), x.getMonth(), 1)), dstr(new Date(x.getFullYear(), x.getMonth() + 1, 0))]; }
  return ['0000-00-00', '9999-12-31'];
}
VIEWS.agenda = {
  toolbar: () => `
    <button class="btn sm" data-act="agPrev" title="Anterior">‹</button>
    <input type="date" id="agData" value="${UI.agData}">
    <button class="btn sm" data-act="agNext" title="Próximo">›</button>
    <button class="btn sm" data-act="agHoje">Hoje</button>
    <select id="agRange">${opts([['dia', 'Dia'], ['semana', 'Semana'], ['mes', 'Mês'], ['todos', 'Todos']], UI.agRange)}</select>
    <select id="agStatus">${opts(Object.entries(STATUS), UI.agStatus, 'Todos os status')}</select>
    <select id="agProf">${opts(S.profissionais.slice().sort(porNome).map(p => [p.id, p.nome]), UI.agProf, 'Toda a equipe')}</select>
    <input type="search" id="agBusca" placeholder="Buscar cliente…" value="${esc(UI.agBusca)}">
    <button class="btn primary" data-act="novoAt">+ Agendar</button>`,
  body() {
    const [ini, fim] = rangeAgenda();
    const b = UI.agBusca.trim().toLowerCase();
    let lista = noPeriodo(S.atendimentos, ini, fim)
      .filter(a => !UI.agStatus || a.status === UI.agStatus)
      .filter(a => !UI.agProf || a.profissionalId === UI.agProf)
      .filter(a => !b || nomeCliente(a).toLowerCase().includes(b));
    const desc = UI.agRange === 'todos';
    lista.sort((a, c) => ((a.data + a.hora) < (c.data + c.hora) ? -1 : 1) * (desc ? -1 : 1));
    const r = resumo(lista);
    const chips = `<div class="summary-chips">
      <span class="chip">📅 ${UI.agRange === 'todos' ? 'Todos os registros' : (ini === fim ? diaLongo(ini) : fmtData(ini) + ' a ' + fmtData(fim))}</span>
      <span class="chip">Agendados <b>${r.agend.length}</b></span>
      <span class="chip">Concluídos <b>${r.concl.length}</b></span>
      <span class="chip">Cancelados <b>${r.canc.length}</b></span>
      <span class="chip">Faltas <b>${r.falt.length}</b></span>
      <span class="chip">Recebido <b>${brl(r.fat)}</b></span></div>`;
    if (!lista.length) return chips + vazio('🗓️', 'Nenhum atendimento encontrado para este filtro.', '<button class="btn primary" data-act="novoAt">+ Agendar atendimento</button>');
    let html = chips, dia = '';
    lista.forEach(a => {
      if (a.data !== dia) { dia = a.data; html += `<div class="day-head">${diaLongo(dia)}</div>`; }
      html += cardAtendimento(a);
    });
    return html;
  }
};

function cardAtendimento(a) {
  const serv = (a.servicos || []).map(s => s.nome).join(', ');
  const prod = (a.produtos || []).map(p => `${p.nome}${num(p.qtd) > 1 ? ' ×' + p.qtd : ''}`).join(', ');
  const prof = nomeProf(a);
  let acts = '';
  if (a.status === 'agendado') {
    acts = `<button class="btn sm primary" data-act="finalizar" data-id="${a.id}">Finalizar</button>
      <button class="btn sm" data-act="editarAt" data-id="${a.id}">Editar</button>
      <button class="btn sm" data-act="zap" data-id="${a.id}" title="Lembrete por WhatsApp">WhatsApp</button>
      <button class="btn sm" data-act="faltou" data-id="${a.id}">Faltou</button>
      <button class="btn sm danger" data-act="cancelar" data-id="${a.id}">Cancelar</button>`;
  } else if (a.status === 'concluido') {
    acts = `<button class="btn sm" data-act="recibo" data-id="${a.id}">Comprovante PDF</button>
      <button class="btn sm" data-act="editarAt" data-id="${a.id}">Editar</button>
      <button class="btn sm danger" data-act="excluirAt" data-id="${a.id}">Excluir</button>`;
  } else {
    acts = `<button class="btn sm" data-act="reativar" data-id="${a.id}">Reativar</button>
      <button class="btn sm danger" data-act="excluirAt" data-id="${a.id}">Excluir</button>`;
  }
  const c = a.cancel;
  return `<div class="appt st-${a.status}">
    <div class="appt-time">${esc(a.hora || '--:--')}</div>
    <div class="appt-main">
      <span class="name">${esc(nomeCliente(a))}</span>${badgeStatus(a.status)} ${a.demo ? '<span class="badge">demo</span>' : ''}
      <div class="det">${esc(serv || 'Venda de produtos')}${prod ? ' · 🛍️ ' + esc(prod) : ''}${prof ? ' · com ' + esc(prof) : ''}</div>
      ${a.status === 'cancelado' && c ? `<div class="cancel-note">Cancelado pelo ${c.por === 'salao' ? 'salão' : 'cliente'} — ${esc(c.motivo)}${c.obs ? ': ' + esc(c.obs) : ''}</div>` : ''}
      ${a.obs ? `<div class="det">📝 ${esc(a.obs)}</div>` : ''}
    </div>
    <div class="appt-right">
      <div class="appt-total">${brl(a.total)} ${badgePag(a)}</div>
      <div class="appt-actions">${acts}</div>
    </div>
  </div>`;
}

/* ---------- CLIENTES ---------- */
function statsCliente(id) {
  const l = S.atendimentos.filter(a => a.clienteId === id);
  const c = l.filter(a => a.status === 'concluido');
  const ult = c.map(a => a.data).sort().pop();
  return { visitas: c.length, gasto: c.reduce((s, a) => s + num(a.total), 0), ultima: ult, cancel: l.filter(a => a.status === 'cancelado' || a.status === 'faltou').length, total: l.length };
}
VIEWS.clientes = {
  toolbar: () => `
    <input type="search" id="cliBusca" placeholder="Buscar por nome ou telefone…" value="${esc(UI.cliBusca)}">
    <select id="cliGenero">${opts(GENEROS, UI.cliGenero, 'Todos os gêneros')}</select>
    <button class="btn" data-act="pdfClientes">PDF</button>
    <button class="btn primary" data-act="novoCli">+ Novo cliente</button>`,
  body() {
    const b = UI.cliBusca.trim().toLowerCase();
    const lista = S.clientes.filter(c => (!b || (c.nome || '').toLowerCase().includes(b) || (c.telefone || '').includes(b)) && (!UI.cliGenero || c.genero === UI.cliGenero)).sort(porNome);
    if (!S.clientes.length) return vazio('👥', 'Nenhum cliente cadastrado ainda.', '<button class="btn primary" data-act="novoCli">+ Cadastrar cliente</button>');
    if (!lista.length) return vazio('🔎', 'Nenhum cliente corresponde à busca.');
    return `<div class="table-wrap"><table>
      <thead><tr><th>Cliente</th><th>Telefone</th><th>Gênero</th><th class="r">Visitas</th><th class="r">Total gasto</th><th>Última visita</th><th class="r">Cancel./faltas</th><th class="r">Ações</th></tr></thead>
      <tbody>${lista.map(c => {
      const st = statsCliente(c.id);
      return `<tr>
          <td><b>${esc(c.nome)}</b>${c.demo ? ' <span class="badge">demo</span>' : ''}${c.obs ? `<br><small>${esc(c.obs).slice(0, 60)}</small>` : ''}</td>
          <td>${esc(c.telefone || '—')}</td>
          <td>${esc(c.genero || '—')}</td>
          <td class="r num">${st.visitas}</td>
          <td class="r num">${brl(st.gasto)}</td>
          <td>${st.ultima ? fmtData(st.ultima) : '—'}</td>
          <td class="r">${st.cancel >= 3 ? `<span class="badge b-cancelado">${st.cancel}</span>` : st.cancel}</td>
          <td><div class="acts">
            <button class="btn sm" data-act="histCli" data-id="${c.id}">Histórico</button>
            <button class="btn sm" data-act="agendarCli" data-id="${c.id}">Agendar</button>
            <button class="btn sm" data-act="editarCli" data-id="${c.id}">Editar</button>
            <button class="btn sm danger" data-act="excluirCli" data-id="${c.id}">Excluir</button>
          </div></td></tr>`;
    }).join('')}</tbody></table></div>`;
  }
};

/* ---------- SERVIÇOS ---------- */
VIEWS.servicos = {
  toolbar: () => `
    <input type="search" id="servBusca" placeholder="Buscar serviço…" value="${esc(UI.servBusca)}">
    <select id="servCat">${opts(CATEGORIAS, UI.servCat, 'Todas as categorias')}</select>
    <button class="btn primary" data-act="novoServ">+ Novo serviço</button>`,
  body() {
    if (!S.servicos.length) return vazio('✂️', 'Nenhum serviço cadastrado.', '<button class="btn" data-act="catalogo">Carregar catálogo padrão</button> <button class="btn primary" data-act="novoServ">+ Novo serviço</button>');
    const b = UI.servBusca.trim().toLowerCase();
    const cont = {};
    S.atendimentos.filter(a => a.status === 'concluido').forEach(a => (a.servicos || []).forEach(s => { cont[s.id] = (cont[s.id] || 0) + 1; }));
    const lista = S.servicos.filter(s => (!b || (s.nome || '').toLowerCase().includes(b)) && (!UI.servCat || s.categoria === UI.servCat)).sort(porNome);
    return `<div class="table-wrap"><table>
      <thead><tr><th>Serviço</th><th>Categoria</th><th>Público</th><th class="r">Duração</th><th class="r">Preço</th><th class="r">Realizados</th><th>Situação</th><th class="r">Ações</th></tr></thead>
      <tbody>${lista.map(s => `<tr>
        <td><b>${esc(s.nome)}</b></td><td>${esc(s.categoria)}</td><td>${esc(s.publico)}</td>
        <td class="r num">${num(s.duracao)} min</td><td class="r num">${brl(s.preco)}</td><td class="r num">${cont[s.id] || 0}</td>
        <td>${s.ativo !== false ? '<span class="badge b-concluido">Ativo</span>' : '<span class="badge">Inativo</span>'}</td>
        <td><div class="acts"><button class="btn sm" data-act="editarServ" data-id="${s.id}">Editar</button><button class="btn sm danger" data-act="excluirServ" data-id="${s.id}">Excluir</button></div></td>
      </tr>`).join('')}</tbody></table></div>`;
  }
};

/* ---------- PRODUTOS ---------- */
VIEWS.produtos = {
  toolbar: () => `
    <input type="search" id="prodBusca" placeholder="Buscar produto…" value="${esc(UI.prodBusca)}">
    <button class="btn" data-act="pdfEstoque">PDF do estoque</button>
    <button class="btn primary" data-act="novoProd">+ Novo produto</button>`,
  body() {
    if (!S.produtos.length) return vazio('🧴', 'Nenhum produto cadastrado.', '<button class="btn primary" data-act="novoProd">+ Novo produto</button>');
    const b = UI.prodBusca.trim().toLowerCase();
    const vend = {};
    S.atendimentos.filter(a => a.status === 'concluido').forEach(a => (a.produtos || []).forEach(p => { vend[p.id] = (vend[p.id] || 0) + num(p.qtd); }));
    const lista = S.produtos.filter(p => !b || (p.nome || '').toLowerCase().includes(b) || (p.marca || '').toLowerCase().includes(b)).sort(porNome);
    const valorEst = S.produtos.reduce((s, p) => s + num(p.preco) * Math.max(0, num(p.estoque)), 0);
    return `<div class="summary-chips"><span class="chip">Itens cadastrados <b>${S.produtos.length}</b></span><span class="chip">Valor em estoque (preço de venda) <b>${brl(valorEst)}</b></span><span class="chip">Abaixo do mínimo <b>${S.produtos.filter(p => num(p.estoque) <= num(p.minimo)).length}</b></span></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Produto</th><th>Marca</th><th class="r">Preço</th><th class="r">Estoque</th><th class="r">Mínimo</th><th class="r">Vendidos</th><th class="r">Ações</th></tr></thead>
      <tbody>${lista.map(p => {
      const e = num(p.estoque), low = e <= num(p.minimo);
      return `<tr><td><b>${esc(p.nome)}</b></td><td>${esc(p.marca || '—')}</td><td class="r num">${brl(p.preco)}</td>
        <td class="r">${low ? `<span class="badge ${e <= 0 ? 'b-zero' : 'b-low'}">${e}</span>` : `<span class="num">${e}</span>`}</td>
        <td class="r num">${num(p.minimo)}</td><td class="r num">${vend[p.id] || 0}</td>
        <td><div class="acts"><button class="btn sm ok" data-act="entradaProd" data-id="${p.id}">+ Entrada</button><button class="btn sm" data-act="editarProd" data-id="${p.id}">Editar</button><button class="btn sm danger" data-act="excluirProd" data-id="${p.id}">Excluir</button></div></td></tr>`;
    }).join('')}</tbody></table></div>`;
  }
};

/* ---------- EQUIPE ---------- */
VIEWS.equipe = {
  toolbar: () => `<button class="btn primary" data-act="novoProf">+ Novo profissional</button>`,
  body() {
    if (!S.profissionais.length) return vazio('💇', 'Nenhum profissional cadastrado.', '<button class="btn primary" data-act="novoProf">+ Novo profissional</button>');
    const [ini, fim] = rangePeriodo('mes');
    const pp = porProfissional(noPeriodo(S.atendimentos, ini, fim).filter(a => a.status === 'concluido'));
    return `<p class="muted" style="margin-top:0">Números do mês atual (${fmtData(ini)} a ${fmtData(fim)}). A comissão é calculada sobre o valor dos serviços.</p>
    <div class="team-grid">${S.profissionais.slice().sort(porNome).map(p => {
      const st = pp.find(x => x.id === p.id) || { qtd: 0, fat: 0, serv: 0, comissao: 0 };
      const ag = S.atendimentos.filter(a => a.profissionalId === p.id && a.status === 'agendado' && a.data >= hoje()).length;
      return `<div class="card">
        <div class="team-head"><div class="avatar">${esc(iniciais(p.nome))}</div><div><h3>${esc(p.nome)}</h3><small>${esc(p.especialidade || '')}</small> ${p.ativo === false ? '<span class="badge">Inativo</span>' : ''}</div></div>
        <div class="stat-row"><span>Atendimentos no mês</span><b class="num">${st.qtd}</b></div>
        <div class="stat-row"><span>Faturamento no mês</span><b class="num">${brl(st.fat)}</b></div>
        <div class="stat-row"><span>Comissão (${num(p.comissao)}%)</span><b class="num">${brl(st.serv * num(p.comissao) / 100)}</b></div>
        <div class="stat-row"><span>Próximos agendados</span><b class="num">${ag}</b></div>
        <div class="form-actions" style="margin-top:12px"><button class="btn sm" data-act="editarProf" data-id="${p.id}">Editar</button><button class="btn sm danger" data-act="excluirProf" data-id="${p.id}">Excluir</button></div>
      </div>`;
    }).join('')}</div>`;
  }
};

/* ---------- RELATÓRIOS ---------- */
function filtroRel() {
  return noPeriodo(S.atendimentos, UI.relIni, UI.relFim).filter(a => !UI.relProf || a.profissionalId === UI.relProf);
}
VIEWS.relatorios = {
  toolbar: () => `
    <label class="muted">De <input type="date" id="relIni" value="${UI.relIni}"></label>
    <label class="muted">até <input type="date" id="relFim" value="${UI.relFim}"></label>
    <select id="relProf">${opts(S.profissionais.slice().sort(porNome).map(p => [p.id, p.nome]), UI.relProf, 'Toda a equipe')}</select>
    <button class="btn primary" data-act="pdfFinanceiro">PDF financeiro</button>
    <button class="btn" data-act="pdfCancel">PDF de cancelamentos</button>`,
  body() {
    const l = filtroRel();
    const r = resumo(l);
    const pp = porProfissional(r.concl);
    const rk = rankingServicos(r.concl);
    const canc = r.canc.concat(r.falt).sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
    const motivos = {};
    r.canc.forEach(a => { const m = (a.cancel && a.cancel.motivo) || 'Não informado'; motivos[m] = (motivos[m] || 0) + 1; });
    return `
      <div class="kpis">
        <div class="card kpi"><div class="lbl">Faturamento</div><div class="val">${brl(r.fat)}</div><div class="cmp">Serviços ${brl(r.fatServ)} · Produtos ${brl(r.fatProd)}</div></div>
        <div class="card kpi k2"><div class="lbl">Concluídos</div><div class="val">${r.concl.length}</div><div class="cmp">Ticket médio ${brl(r.ticket)}</div></div>
        <div class="card kpi k3"><div class="lbl">Comissões a pagar</div><div class="val">${brl(pp.reduce((s, x) => s + x.comissao, 0))}</div><div class="cmp">sobre serviços</div></div>
        <div class="card kpi k4"><div class="lbl">Cancelados / faltas</div><div class="val">${r.canc.length} / ${r.falt.length}</div><div class="cmp">${(r.taxaCanc * 100).toFixed(1)}% dos atendimentos</div></div>
      </div>
      <div class="grid2c">
        <div class="card"><h3>Por forma de pagamento</h3><div class="sub">&nbsp;</div>
          <div class="table-wrap"><table><thead><tr><th>Forma</th><th class="r">Qtd.</th><th class="r">Valor</th><th class="r">%</th></tr></thead><tbody>
          ${Object.keys(PAG).map(k => `<tr><td>${PAG[k]}</td><td class="r num">${r.pagQ[k]}</td><td class="r num">${brl(r.pag[k])}</td><td class="r num">${r.fat ? (r.pag[k] / r.fat * 100).toFixed(1) : '0.0'}%</td></tr>`).join('')}
          </tbody></table></div></div>
        <div class="card"><h3>Motivos de cancelamento</h3><div class="sub">Cancelamentos feitos pelo cliente e pelo salão</div><div class="chart-box"><canvas id="chMot"></canvas></div></div>
      </div>
      <h3 class="section-title">Por profissional</h3>
      <div class="table-wrap"><table><thead><tr><th>Profissional</th><th class="r">Atendimentos</th><th class="r">Serviços</th><th class="r">Faturamento</th><th class="r">Comissão</th></tr></thead><tbody>
        ${pp.length ? pp.map(x => `<tr><td>${esc(x.nome)}</td><td class="r num">${x.qtd}</td><td class="r num">${brl(x.serv)}</td><td class="r num">${brl(x.fat)}</td><td class="r num">${brl(x.comissao)} <small>(${x.comissaoPct}%)</small></td></tr>`).join('') : '<tr><td colspan="5" class="muted">Sem atendimentos concluídos no período.</td></tr>'}
      </tbody></table></div>
      <h3 class="section-title">Serviços realizados</h3>
      <div class="table-wrap"><table><thead><tr><th>Serviço</th><th class="r">Quantidade</th><th class="r">Valor</th></tr></thead><tbody>
        ${rk.length ? rk.map(x => `<tr><td>${esc(x.nome)}</td><td class="r num">${x.qtd}</td><td class="r num">${brl(x.valor)}</td></tr>`).join('') : '<tr><td colspan="3" class="muted">Nenhum serviço no período.</td></tr>'}
      </tbody></table></div>
      <h3 class="section-title">Cancelamentos e faltas</h3>
      <div class="table-wrap"><table><thead><tr><th>Data</th><th>Cliente</th><th>Situação</th><th>Por</th><th>Motivo</th><th class="r">Valor previsto</th></tr></thead><tbody>
        ${canc.length ? canc.map(a => `<tr><td>${fmtData(a.data)} ${esc(a.hora || '')}</td><td>${esc(nomeCliente(a))}</td><td>${badgeStatus(a.status)}</td><td>${a.status === 'faltou' ? '—' : (a.cancel && a.cancel.por === 'salao' ? 'Salão' : 'Cliente')}</td><td>${esc(a.status === 'faltou' ? 'Não compareceu' : ((a.cancel && a.cancel.motivo) || '—'))}</td><td class="r num">${brl(calcTotal(a))}</td></tr>`).join('') : '<tr><td colspan="6" class="muted">Nenhum cancelamento no período. 🎉</td></tr>'}
      </tbody></table></div>`;
  },
  after() {
    const r = resumo(filtroRel());
    const m = {};
    r.canc.forEach(a => { const k = (a.cancel && a.cancel.motivo) || 'Não informado'; m[k] = (m[k] || 0) + 1; });
    if (r.falt.length) m['Não compareceu'] = r.falt.length;
    const e = Object.entries(m).sort((a, b) => b[1] - a[1]);
    barChart('chMot', e.map(x => x[0]), e.map(x => x[1]), { horizontal: true, money: false, vazio: 'Nenhum cancelamento no período', tip: v => v + ' ocorrência(s)' });
  }
};

/* ---------- AJUSTES ---------- */
VIEWS.ajustes = {
  body() {
    const c = S.config, k = cfg();
    const nDemo = S.atendimentos.filter(a => a.demo).length + S.clientes.filter(a => a.demo).length;
    return `<div class="settings-grid">
      <div class="card"><h3>Dados do salão</h3><p>Aparecem no topo, no rodapé e no cabeçalho dos PDFs.</p>
        <form id="fCfg" class="form">
          <label>Nome do salão<input name="nome" value="${esc(c.nome)}" required maxlength="60"></label>
          <div class="grid2">
            <label>WhatsApp<input name="whatsapp" value="${esc(k.whatsapp)}" maxlength="20" placeholder="(34) 99999-0000"></label>
            <label>Telefone fixo<input name="fixo" value="${esc(k.fixo)}" maxlength="20" placeholder="(34) 3333-0000"></label>
          </div>
          <div class="grid2">
            <label>Endereço (rua e número)<input name="endereco" value="${esc(k.endereco)}" maxlength="100"></label>
            <label>Bairro<input name="bairro" value="${esc(k.bairro)}" maxlength="60"></label>
            <label>Cidade - UF<input name="cidade" value="${esc(k.cidade)}" maxlength="60"></label>
            <label>CEP<input name="cep" value="${esc(k.cep)}" maxlength="9" placeholder="00000-000"></label>
          </div>
          <div class="grid2">
            <label>Horário de funcionamento<input name="horario" value="${esc(k.horario)}" maxlength="80" placeholder="Ter a Sáb · 9h às 19h"></label>
            <label>Instagram<input name="instagram" value="${esc(k.instagram)}" maxlength="60" placeholder="@seusalao"></label>
            <label>E-mail<input type="email" name="email" value="${esc(k.email)}" maxlength="80"></label>
            <label>CNPJ / CPF<input name="cnpj" value="${esc(k.cnpj)}" maxlength="20"></label>
          </div>
          <div class="form-actions"><button class="btn primary">Salvar dados</button></div>
        </form>
      </div>
      <div class="card"><h3>Onde ficam os dados</h3>
        <p>${modo === 'nuvem' ? '☁️ Os dados ficam salvos na nuvem, junto com este sistema, e aparecem em qualquer aparelho em que você abrir o link. Quem você compartilhar como colaborador também consegue usar.' : '💾 Modo local: os dados ficam salvos somente neste navegador. Faça backups com frequência.'}</p>
        <h3 style="margin-top:16px">Catálogo padrão</h3>
        <p>Adiciona serviços, produtos e equipe de exemplo que ainda não existam (pelo nome).</p>
        <button class="btn" data-act="catalogo">Carregar catálogo padrão</button>
      </div>
      <div class="card"><h3>Dados de demonstração</h3>
        <p>Gera clientes e atendimentos fictícios dos últimos 30 dias para você ver os gráficos funcionando. Eles ficam marcados como “demo” e não mexem no estoque.</p>
        <div class="row" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" data-act="gerarDemo">Gerar demonstração</button><button class="btn danger" data-act="apagarDemo" ${nDemo ? '' : 'disabled'}>Apagar demonstração (${nDemo})</button></div>
      </div>
      <div class="card"><h3>Backup</h3>
        <p>Baixe uma cópia de todos os dados (arquivo .json) ou restaure de um backup anterior.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-act="backup">Baixar backup</button><label class="btn">Restaurar backup<input type="file" id="fileRestore" accept=".json,application/json" hidden></label></div>
      </div>
    </div>`;
  }
};

/* ================= FORMULÁRIOS ================= */

/* ---------- Atendimento ---------- */
function proxHora() {
  const d = new Date(); let h = d.getHours(), m = d.getMinutes() < 30 ? 30 : 0;
  if (m === 0) h++;
  if (h < 8) { h = 9; m = 0; } if (h > 20) { h = 9; m = 0; }
  return pad(h) + ':' + pad(m);
}

function formAtendimento(orig, preset = {}) {
  const at = orig ? JSON.parse(JSON.stringify(orig)) : {
    id: uid(), clienteId: preset.clienteId || '', profissionalId: '', data: preset.data || (UI.tab === 'agenda' ? UI.agData : hoje()),
    hora: proxHora(), servicos: [], produtos: [], desconto: 0, status: 'agendado', pagamento: null, parcelas: 1, obs: '', criadoEm: new Date().toISOString()
  };
  const selServ = new Set(at.servicos.map(s => s.id));
  const qtdProd = Object.fromEntries(at.produtos.map(p => [p.id, num(p.qtd)]));
  const servs = S.servicos.filter(s => s.ativo !== false || selServ.has(s.id)).sort((a, b) => (a.categoria || '').localeCompare(b.categoria || '') || porNome(a, b));
  const profs = S.profissionais.filter(p => p.ativo !== false || p.id === at.profissionalId).sort(porNome);
  const precoServ = s => { const o = at.servicos.find(x => x.id === s.id); return o ? num(o.preco) : num(s.preco); };
  const precoProd = p => { const o = at.produtos.find(x => x.id === p.id); return o ? num(o.preco) : num(p.preco); };
  const statusOpts = Object.entries(STATUS).filter(([k]) => k !== 'cancelado' || at.status === 'cancelado');

  const body = abrirModal(orig ? 'Editar atendimento' : 'Novo atendimento', `
  <form id="fAt" class="form" novalidate>
    <div class="grid2">
      <label>Cliente
        <div class="row"><select name="clienteId" id="selCli">${opts(S.clientes.slice().sort(porNome).map(c => [c.id, c.nome + (c.telefone ? ' · ' + c.telefone : '')]), at.clienteId, '— Selecione —')}</select>
        <button type="button" class="btn sm" id="btnCliRap" title="Cadastrar cliente rápido">+ Novo</button></div>
      </label>
      <label>Profissional<select name="profissionalId">${opts(profs.map(p => [p.id, p.nome + (p.especialidade ? ' — ' + p.especialidade : '')]), at.profissionalId, 'Sem preferência')}</select></label>
    </div>
    <div id="cliRap" class="grid3" hidden>
      <label>Nome do novo cliente<input id="crNome" maxlength="80"></label>
      <label>Telefone<input id="crTel" maxlength="20" placeholder="(11) 9…"></label>
      <label>Gênero<div class="row"><select id="crGen">${opts(GENEROS, 'Não informar')}</select><button type="button" class="btn sm primary" id="crOk">Adicionar</button></div></label>
    </div>
    <div class="grid3">
      <label>Data<input type="date" name="data" value="${at.data}" required></label>
      <label>Horário<input type="time" name="hora" value="${at.hora}" required></label>
      <label>Situação<select name="status" id="selStatus">${opts(statusOpts, at.status)}</select></label>
    </div>
    <fieldset><legend>Serviços</legend>
      ${servs.length ? `<div class="pick-list">${servs.map(s => `<label class="pick ${selServ.has(s.id) ? 'on' : ''}"><input type="checkbox" name="serv" value="${s.id}" ${selServ.has(s.id) ? 'checked' : ''}><span>${esc(s.nome)}<small>${esc(s.publico || '')} · ${num(s.duracao)} min</small></span><b class="num">${brl(precoServ(s))}</b></label>`).join('')}</div>` : '<p class="muted">Cadastre serviços na aba Serviços.</p>'}
    </fieldset>
    <fieldset><legend>Produtos vendidos</legend>
      ${S.produtos.length ? `<div class="pick-list">${S.produtos.slice().sort(porNome).map(p => `<div class="pick ${qtdProd[p.id] ? 'on' : ''}"><span>${esc(p.nome)}<small>${brl(precoProd(p))} · estoque ${num(p.estoque)}</small></span><div class="qty"><button type="button" data-q="-1" data-p="${p.id}" aria-label="Menos">−</button><input type="number" min="0" step="1" name="prod_${p.id}" value="${qtdProd[p.id] || 0}" aria-label="Quantidade"><button type="button" data-q="1" data-p="${p.id}" aria-label="Mais">+</button></div></div>`).join('')}</div>` : '<p class="muted">Nenhum produto cadastrado.</p>'}
    </fieldset>
    <div class="grid2">
      <label>Desconto (R$)<input type="number" name="desconto" min="0" step="0.01" value="${num(at.desconto) || ''}" placeholder="0,00"></label>
      <label>Observações<input name="obs" value="${esc(at.obs)}" maxlength="200" placeholder="Ex.: tom 7.1, alergia…"></label>
    </div>
    <div id="pagBox">
      <div class="lbl">Forma de pagamento</div>
      <div class="chips" style="margin-bottom:10px">${Object.entries(PAG).map(([k, l]) => `<label class="chip-radio"><input type="radio" name="pagamento" value="${k}" ${at.pagamento === k ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>
      <label id="parcBox" style="max-width:200px;margin-bottom:12px">Parcelas<select name="parcelas">${opts(Array.from({ length: 12 }, (_, i) => [i + 1, (i + 1) + 'x']), at.parcelas || 1)}</select></label>
    </div>
    <div class="total-bar"><div>Serviços <b id="tS"></b> · Produtos <b id="tP"></b> · Desconto <b id="tD"></b></div><div class="big">Total <b id="tT"></b></div></div>
    <div class="form-actions"><button type="button" class="btn ghost" data-close>Voltar</button><button class="btn primary" type="submit">Salvar atendimento</button></div>
  </form>`);

  const f = $('#fAt', body);
  const coletar = () => {
    const fd = new FormData(f);
    const servicos = fd.getAll('serv').map(id => { const s = S.servicos.find(x => x.id === id) || at.servicos.find(x => x.id === id); return { id, nome: s.nome, preco: precoServ(s) }; });
    const produtos = S.produtos.map(p => ({ p, q: Math.max(0, Math.floor(num(fd.get('prod_' + p.id)))) })).filter(x => x.q > 0).map(({ p, q }) => ({ id: p.id, nome: p.nome, preco: precoProd(p), qtd: q }));
    at.produtos.filter(o => !S.produtos.some(p => p.id === o.id)).forEach(o => produtos.push(o)); // produto removido do cadastro
    return { servicos, produtos, desconto: num(fd.get('desconto')), status: fd.get('status'), pagamento: fd.get('pagamento') || null, parcelas: num(fd.get('parcelas')) || 1 };
  };
  const atualizar = () => {
    const c = coletar();
    const tmp = { ...at, ...c };
    $('#tS').textContent = brl(somaServ(tmp)); $('#tP').textContent = brl(somaProd(tmp)); $('#tD').textContent = brl(c.desconto); $('#tT').textContent = brl(calcTotal(tmp));
    $('#pagBox').hidden = c.status !== 'concluido';
    $('#parcBox').hidden = c.pagamento !== 'credito';
    $$('.pick', f).forEach(el => { const cb = $('input[type=checkbox]', el), n = $('input[type=number]', el); el.classList.toggle('on', cb ? cb.checked : num(n.value) > 0); });
  };
  f.addEventListener('input', atualizar);
  f.addEventListener('change', atualizar);
  f.addEventListener('click', e => {
    const b = e.target.closest('[data-q]');
    if (b) { const inp = $(`[name="prod_${b.dataset.p}"]`, f); inp.value = Math.max(0, num(inp.value) + num(b.dataset.q)); atualizar(); }
  });
  $('#btnCliRap', f).onclick = () => { const box = $('#cliRap', f); box.hidden = !box.hidden; if (!box.hidden) $('#crNome', f).focus(); };
  $('#crOk', f).onclick = async () => {
    const nome = $('#crNome', f).value.trim();
    if (!nome) { toast('Informe o nome do cliente', 'warn'); return; }
    const c = { id: uid(), nome, telefone: $('#crTel', f).value.trim(), genero: $('#crGen', f).value, nascimento: '', email: '', obs: '', criadoEm: new Date().toISOString() };
    try { await salvar('clientes', c); } catch (e) { return; }
    const sel = $('#selCli', f); sel.insertAdjacentHTML('beforeend', `<option value="${c.id}">${esc(c.nome)}</option>`); sel.value = c.id;
    $('#cliRap', f).hidden = true; toast('Cliente cadastrado', 'ok');
  };
  atualizar();

  f.onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(f), c = coletar();
    const clienteId = fd.get('clienteId');
    if (!clienteId) { toast('Selecione o cliente', 'warn'); return; }
    if (!c.servicos.length && !c.produtos.length) { toast('Escolha ao menos um serviço ou produto', 'warn'); return; }
    if (!fd.get('data') || !fd.get('hora')) { toast('Informe data e horário', 'warn'); return; }
    if (c.status === 'concluido' && !c.pagamento) { toast('Escolha a forma de pagamento', 'warn'); return; }
    const cli = S.clientes.find(x => x.id === clienteId), prof = S.profissionais.find(x => x.id === fd.get('profissionalId'));
    const novo = {
      ...at, ...c, clienteId, clienteNome: cli ? cli.nome : at.clienteNome,
      profissionalId: fd.get('profissionalId') || '', profNome: prof ? prof.nome : '',
      data: fd.get('data'), hora: fd.get('hora'), obs: String(fd.get('obs') || '').trim(),
      atualizadoEm: new Date().toISOString()
    };
    if (novo.status !== 'concluido') { novo.pagamento = null; novo.parcelas = 1; }
    if (novo.pagamento !== 'credito') novo.parcelas = 1;
    if (novo.status === 'concluido' && (!orig || orig.status !== 'concluido')) novo.concluidoEm = new Date().toISOString();
    if (novo.status !== 'cancelado') delete novo.cancel;
    novo.total = calcTotal(novo);
    // aviso de conflito de horário do profissional
    if (novo.profissionalId && novo.status === 'agendado') {
      const conflito = S.atendimentos.find(a => a.id !== novo.id && a.status === 'agendado' && a.profissionalId === novo.profissionalId && a.data === novo.data && a.hora === novo.hora);
      if (conflito && !(await confirmar(`${novo.profNome} já tem ${nomeCliente(conflito)} às ${novo.hora} neste dia. Salvar mesmo assim?`, 'Salvar assim mesmo'))) return;
    }
    const falta = novo.status === 'concluido' ? novo.produtos.filter(p => { const pr = S.produtos.find(x => x.id === p.id); const ja = orig && orig.status === 'concluido' ? num((orig.produtos.find(x => x.id === p.id) || {}).qtd) : 0; return pr && num(p.qtd) - ja > num(pr.estoque); }) : [];
    if (falta.length) toast('Atenção: estoque insuficiente de ' + falta.map(p => p.nome).join(', '), 'warn');
    try {
      await salvar('atendimentos', novo);
      await ajustarEstoque(orig, novo);
    } catch (err) { return; }
    fecharModal();
    toast(orig ? 'Atendimento atualizado' : 'Atendimento salvo', 'ok');
  };
}

/* ---------- Finalizar (pagamento) ---------- */
function formFinalizar(a) {
  const body = abrirModal('Finalizar atendimento', `
  <form id="fFin" class="form">
    <p style="margin-top:0"><b>${esc(nomeCliente(a))}</b> · ${fmtData(a.data)} às ${esc(a.hora)}<br><small>${esc((a.servicos || []).map(s => s.nome).concat((a.produtos || []).map(p => p.nome + ' ×' + p.qtd)).join(', '))}</small></p>
    <div class="grid2"><label>Desconto (R$)<input type="number" name="desconto" min="0" step="0.01" value="${num(a.desconto) || ''}" placeholder="0,00"></label><div></div></div>
    <div class="lbl">Forma de pagamento</div>
    <div class="chips" style="margin-bottom:12px">${Object.entries(PAG).map(([k, l], i) => `<label class="chip-radio"><input type="radio" name="pagamento" value="${k}" ${i === 0 ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>
    <label id="fParc" style="max-width:200px;margin-bottom:12px" hidden>Parcelas<select name="parcelas">${opts(Array.from({ length: 12 }, (_, i) => [i + 1, (i + 1) + 'x']), 1)}</select></label>
    <div class="total-bar"><div>Subtotal ${brl(somaServ(a) + somaProd(a))}</div><div class="big">Total <b id="fTot"></b></div></div>
    <div class="form-actions"><button type="button" class="btn ghost" data-close>Voltar</button><button class="btn primary">Confirmar pagamento</button></div>
  </form>`);
  const f = $('#fFin', body);
  const upd = () => { const fd = new FormData(f); $('#fTot').textContent = brl(calcTotal({ ...a, desconto: num(fd.get('desconto')) })); $('#fParc').hidden = fd.get('pagamento') !== 'credito'; };
  f.addEventListener('input', upd); f.addEventListener('change', upd); upd();
  f.onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(f);
    const novo = { ...a, status: 'concluido', pagamento: fd.get('pagamento'), parcelas: fd.get('pagamento') === 'credito' ? num(fd.get('parcelas')) : 1, desconto: num(fd.get('desconto')), concluidoEm: new Date().toISOString() };
    novo.total = calcTotal(novo);
    try { await salvar('atendimentos', novo); await ajustarEstoque(a, novo); } catch (err) { return; }
    fecharModal();
    toast(`Pagamento de ${brl(novo.total)} via ${PAG[novo.pagamento]} registrado`, 'ok');
  };
}

/* ---------- Cancelamento ---------- */
function formCancelar(a) {
  const body = abrirModal('Cancelar atendimento', `
  <form id="fCan" class="form">
    <p style="margin-top:0"><b>${esc(nomeCliente(a))}</b> · ${diaLongo(a.data)} às ${esc(a.hora)}</p>
    <div class="lbl">Quem cancelou?</div>
    <div class="chips" style="margin-bottom:12px">
      <label class="chip-radio"><input type="radio" name="por" value="cliente" checked><span>👤 Cliente</span></label>
      <label class="chip-radio"><input type="radio" name="por" value="salao"><span>🏠 Salão</span></label>
    </div>
    <label>Motivo<select name="motivo">${opts(MOTIVOS, MOTIVOS[0])}</select></label>
    <label>Detalhes (opcional)<input name="obs" maxlength="160" placeholder="Ex.: avisou com 2h de antecedência"></label>
    <label class="pick" style="margin-bottom:10px"><input type="checkbox" name="reagendar" id="cbReag"><span>Reagendar para outra data<small>Cria um novo horário com os mesmos serviços</small></span></label>
    <div class="grid2" id="reagBox" hidden><label>Nova data<input type="date" name="nData" value="${addDias(a.data, 7)}"></label><label>Novo horário<input type="time" name="nHora" value="${a.hora}"></label></div>
    <div class="form-actions"><button type="button" class="btn ghost" data-close>Voltar</button><button class="btn danger">Confirmar cancelamento</button></div>
  </form>`);
  const f = $('#fCan', body);
  $('#cbReag', f).onchange = e => { $('#reagBox', f).hidden = !e.target.checked; };
  f.onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(f);
    const novo = { ...a, status: 'cancelado', pagamento: null, cancel: { por: fd.get('por'), motivo: fd.get('motivo'), obs: String(fd.get('obs') || '').trim(), em: new Date().toISOString() } };
    try {
      await salvar('atendimentos', novo);
      await ajustarEstoque(a, novo);
      if (fd.get('reagendar')) {
        if (!fd.get('nData') || !fd.get('nHora')) { toast('Informe a nova data e horário', 'warn'); return; }
        const re = { ...a, id: uid(), status: 'agendado', pagamento: null, parcelas: 1, data: fd.get('nData'), hora: fd.get('nHora'), obs: ((a.obs ? a.obs + ' · ' : '') + 'Reagendado de ' + fmtData(a.data)).slice(0, 200), criadoEm: new Date().toISOString() };
        delete re.cancel; delete re.concluidoEm;
        await salvar('atendimentos', re);
        toast('Cancelado e reagendado para ' + fmtData(re.data) + ' às ' + re.hora, 'ok');
      } else toast('Atendimento cancelado', 'ok');
    } catch (err) { return; }
    fecharModal();
  };
}

/* ---------- Cliente ---------- */
function formCliente(orig) {
  const c = orig || { id: uid(), nome: '', telefone: '', email: '', genero: 'Não informar', nascimento: '', obs: '', criadoEm: new Date().toISOString() };
  const body = abrirModal(orig ? 'Editar cliente' : 'Novo cliente', `
  <form id="fCli" class="form">
    <label>Nome completo<input name="nome" value="${esc(c.nome)}" required maxlength="80"></label>
    <div class="grid2">
      <label>Telefone / WhatsApp<input name="telefone" value="${esc(c.telefone)}" maxlength="20" placeholder="(11) 99999-0000"></label>
      <label>E-mail<input type="email" name="email" value="${esc(c.email)}" maxlength="80"></label>
      <label>Gênero<select name="genero">${opts(GENEROS, c.genero)}</select></label>
      <label>Data de nascimento<input type="date" name="nascimento" value="${esc(c.nascimento)}"></label>
    </div>
    <label>Observações (preferências, alergias, fórmula de cor…)<textarea name="obs" rows="3" maxlength="400">${esc(c.obs)}</textarea></label>
    <div class="form-actions"><button type="button" class="btn ghost" data-close>Voltar</button><button class="btn primary">Salvar cliente</button></div>
  </form>`);
  $('#fCli', body).onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const nome = String(fd.get('nome')).trim();
    if (!nome) { toast('Informe o nome', 'warn'); return; }
    const novo = { ...c, nome, telefone: String(fd.get('telefone')).trim(), email: String(fd.get('email')).trim(), genero: fd.get('genero'), nascimento: fd.get('nascimento'), obs: String(fd.get('obs')).trim() };
    try { await salvar('clientes', novo); } catch (err) { return; }
    // mantém o nome atualizado nos atendimentos
    if (orig && orig.nome !== nome) for (const a of S.atendimentos.filter(x => x.clienteId === c.id)) await salvar('atendimentos', { ...a, clienteNome: nome });
    fecharModal(); toast('Cliente salvo', 'ok');
  };
}

function historicoCliente(c) {
  const l = S.atendimentos.filter(a => a.clienteId === c.id).sort((a, b) => (b.data + b.hora).localeCompare(a.data + a.hora));
  const st = statsCliente(c.id);
  abrirModal('Histórico — ' + c.nome, `
    <div class="summary-chips"><span class="chip">Visitas <b>${st.visitas}</b></span><span class="chip">Total gasto <b>${brl(st.gasto)}</b></span><span class="chip">Ticket médio <b>${brl(st.visitas ? st.gasto / st.visitas : 0)}</b></span><span class="chip">Cancelamentos/faltas <b>${st.cancel}</b></span></div>
    ${c.obs ? `<p class="muted">📝 ${esc(c.obs)}</p>` : ''}
    ${l.length ? `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Serviços / produtos</th><th>Situação</th><th class="r">Valor</th></tr></thead><tbody>${l.map(a => `<tr><td>${fmtData(a.data)} ${esc(a.hora)}</td><td style="white-space:normal">${esc((a.servicos || []).map(s => s.nome).concat((a.produtos || []).map(p => p.nome)).join(', '))}</td><td>${badgeStatus(a.status)} ${badgePag(a)}</td><td class="r num">${brl(a.total)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Ainda sem atendimentos.</p>'}
    <div class="form-actions" style="margin-top:14px"><button class="btn" data-act="pdfHistCli" data-id="${c.id}">PDF do histórico</button><button class="btn primary" data-act="agendarCli" data-id="${c.id}">Agendar</button></div>`);
}

/* ---------- Serviço ---------- */
function formServico(orig) {
  const s = orig || { id: uid(), nome: '', categoria: 'Corte', publico: 'Unissex', preco: '', duracao: 30, ativo: true };
  const body = abrirModal(orig ? 'Editar serviço' : 'Novo serviço', `
  <form id="fServ" class="form">
    <label>Nome do serviço<input name="nome" value="${esc(s.nome)}" required maxlength="60"></label>
    <div class="grid2">
      <label>Categoria<select name="categoria">${opts(CATEGORIAS, s.categoria)}</select></label>
      <label>Público<select name="publico">${opts(PUBLICOS, s.publico)}</select></label>
      <label>Preço (R$)<input type="number" name="preco" min="0" step="0.01" value="${s.preco}" required></label>
      <label>Duração (minutos)<input type="number" name="duracao" min="5" step="5" value="${s.duracao}"></label>
    </div>
    <label class="pick" style="margin-bottom:12px"><input type="checkbox" name="ativo" ${s.ativo !== false ? 'checked' : ''}><span>Serviço ativo<small>Serviços inativos não aparecem para novos agendamentos</small></span></label>
    <p class="hint">Alterar o preço não muda atendimentos já registrados.</p>
    <div class="form-actions"><button type="button" class="btn ghost" data-close>Voltar</button><button class="btn primary">Salvar serviço</button></div>
  </form>`);
  $('#fServ', body).onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const nome = String(fd.get('nome')).trim();
    if (!nome) { toast('Informe o nome', 'warn'); return; }
    try { await salvar('servicos', { ...s, nome, categoria: fd.get('categoria'), publico: fd.get('publico'), preco: num(fd.get('preco')), duracao: num(fd.get('duracao')), ativo: !!fd.get('ativo') }); } catch (err) { return; }
    fecharModal(); toast('Serviço salvo', 'ok');
  };
}

/* ---------- Produto ---------- */
function formProduto(orig) {
  const p = orig || { id: uid(), nome: '', marca: '', preco: '', estoque: 0, minimo: 2 };
  const body = abrirModal(orig ? 'Editar produto' : 'Novo produto', `
  <form id="fProd" class="form">
    <label>Nome do produto<input name="nome" value="${esc(p.nome)}" required maxlength="60"></label>
    <div class="grid2">
      <label>Marca<input name="marca" value="${esc(p.marca)}" maxlength="40"></label>
      <label>Preço de venda (R$)<input type="number" name="preco" min="0" step="0.01" value="${p.preco}" required></label>
      <label>Estoque atual<input type="number" name="estoque" step="1" value="${num(p.estoque)}"></label>
      <label>Estoque mínimo (alerta)<input type="number" name="minimo" min="0" step="1" value="${num(p.minimo)}"></label>
    </div>
    <div class="form-actions"><button type="button" class="btn ghost" data-close>Voltar</button><button class="btn primary">Salvar produto</button></div>
  </form>`);
  $('#fProd', body).onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const nome = String(fd.get('nome')).trim();
    if (!nome) { toast('Informe o nome', 'warn'); return; }
    try { await salvar('produtos', { ...p, nome, marca: String(fd.get('marca')).trim(), preco: num(fd.get('preco')), estoque: Math.floor(num(fd.get('estoque'))), minimo: Math.floor(num(fd.get('minimo'))) }); } catch (err) { return; }
    fecharModal(); toast('Produto salvo', 'ok');
  };
}
function formEntrada(p) {
  const body = abrirModal('Entrada de estoque', `
  <form id="fEnt" class="form">
    <p style="margin-top:0"><b>${esc(p.nome)}</b> · estoque atual: <b>${num(p.estoque)}</b></p>
    <label>Quantidade recebida<input type="number" name="q" min="1" step="1" value="1" required></label>
    <div class="form-actions"><button type="button" class="btn ghost" data-close>Voltar</button><button class="btn primary">Adicionar ao estoque</button></div>
  </form>`);
  $('#fEnt', body).onsubmit = async e => {
    e.preventDefault();
    const q = Math.floor(num(new FormData(e.target).get('q')));
    if (q <= 0) { toast('Informe uma quantidade', 'warn'); return; }
    try { await salvar('produtos', { ...p, estoque: num(p.estoque) + q }); } catch (err) { return; }
    fecharModal(); toast(`+${q} un. de ${p.nome}`, 'ok');
  };
}

/* ---------- Profissional ---------- */
function formProf(orig) {
  const p = orig || { id: uid(), nome: '', especialidade: '', comissao: 40, telefone: '', ativo: true };
  const body = abrirModal(orig ? 'Editar profissional' : 'Novo profissional', `
  <form id="fProf" class="form">
    <label>Nome<input name="nome" value="${esc(p.nome)}" required maxlength="60"></label>
    <div class="grid2">
      <label>Especialidade<input name="especialidade" value="${esc(p.especialidade)}" maxlength="60" placeholder="Ex.: Barbeiro, Colorista"></label>
      <label>Comissão sobre serviços (%)<input type="number" name="comissao" min="0" max="100" step="0.5" value="${num(p.comissao)}"></label>
      <label>Telefone<input name="telefone" value="${esc(p.telefone)}" maxlength="20"></label>
    </div>
    <label class="pick" style="margin-bottom:12px"><input type="checkbox" name="ativo" ${p.ativo !== false ? 'checked' : ''}><span>Profissional ativo</span></label>
    <div class="form-actions"><button type="button" class="btn ghost" data-close>Voltar</button><button class="btn primary">Salvar</button></div>
  </form>`);
  $('#fProf', body).onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const nome = String(fd.get('nome')).trim();
    if (!nome) { toast('Informe o nome', 'warn'); return; }
    try { await salvar('profissionais', { ...p, nome, especialidade: String(fd.get('especialidade')).trim(), comissao: num(fd.get('comissao')), telefone: String(fd.get('telefone')).trim(), ativo: !!fd.get('ativo') }); } catch (err) { return; }
    fecharModal(); toast('Profissional salvo', 'ok');
  };
}

/* ================= PDF ================= */
const COR_PDF = [164, 83, 47];
function pdfNovo(titulo, subtitulo) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(...COR_PDF); doc.rect(0, 0, W, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.text(S.config.nome || 'Salão', 14, 12);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  const k = cfg();
  const info = [enderecoCompleto(k), k.whatsapp ? 'WhatsApp ' + k.whatsapp : '', k.fixo ? 'Tel. ' + k.fixo : '', k.cnpj ? 'CNPJ/CPF ' + k.cnpj : ''].filter(Boolean).join('  ·  ');
  if (info) doc.text(doc.splitTextToSize(info, W - 28)[0], 14, 19);
  doc.setTextColor(30, 26, 23);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.text(titulo, 14, 37);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(110, 100, 95);
  if (subtitulo) doc.text(subtitulo, 14, 43);
  doc.setTextColor(30, 26, 23);
  return { doc, y: subtitulo ? 49 : 43 };
}
function pdfTabela(doc, y, head, body, extra = {}) {
  doc.autoTable({
    startY: y, head: [head], body, theme: 'striped', margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 2.2, textColor: [40, 34, 30] },
    headStyles: { fillColor: COR_PDF, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 242, 237] }, ...extra
  });
  return doc.lastAutoTable.finalY + 7;
}
function pdfSecao(doc, y, txt) {
  if (y > 265) { doc.addPage(); y = 18; }
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5); doc.text(txt, 14, y);
  doc.setFont('helvetica', 'normal');
  return y + 3;
}
async function pdfSalvar(doc, nome) {
  const n = doc.internal.getNumberOfPages(), W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
  const gerado = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  for (let i = 1; i <= n; i++) {
    doc.setPage(i); doc.setFontSize(8); doc.setTextColor(140, 130, 125);
    doc.text(`Gerado em ${gerado}`, 14, H - 8);
    doc.text(`Página ${i} de ${n}`, W - 14, H - 8, { align: 'right' });
  }
  await baixar(nome, doc.output('arraybuffer'));
}
async function baixar(nome, data) {
  if (!DL) {
    // fora do claude.ai (arquivo aberto no computador): download normal do navegador
    try {
      const tipo = nome.endsWith('.pdf') ? 'application/pdf' : 'application/json';
      const url = URL.createObjectURL(new Blob([data], { type: tipo }));
      const a = document.createElement('a');
      a.href = url; a.download = nome;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast('Arquivo pronto: ' + nome, 'ok');
      return true;
    } catch (e) { toast('Não foi possível baixar o arquivo neste navegador.', 'danger'); return false; }
  }
  try { await DL.save({ filename: nome, data }); toast('Arquivo pronto: ' + nome, 'ok'); return true; }
  catch (e) { if (e && e.code === 'declined') return false; toast('Não foi possível baixar: ' + ((e && (e.message || e.code)) || 'erro'), 'danger'); return false; }
}
function pdfOk() { if (window.jspdf && window.jspdf.jsPDF && window.jspdf.jsPDF.API.autoTable) return true; toast('Gerador de PDF não carregou. Verifique a conexão e recarregue.', 'danger'); return false; }
const slug = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();

async function pdfRecibo(a) {
  if (!pdfOk()) return;
  let { doc, y } = pdfNovo('Comprovante de atendimento', `Nº ${a.id.toUpperCase().slice(-8)}  ·  ${fmtData(a.data)} às ${a.hora}`);
  const cli = S.clientes.find(x => x.id === a.clienteId);
  doc.setFontSize(10);
  doc.text(`Cliente: ${nomeCliente(a)}${cli && cli.telefone ? '   ·   ' + cli.telefone : ''}`, 14, y + 2);
  doc.text(`Profissional: ${nomeProf(a) || '—'}`, 14, y + 8);
  y += 14;
  const linhas = (a.servicos || []).map(s => ['Serviço', s.nome, '1', brl(s.preco), brl(s.preco)])
    .concat((a.produtos || []).map(p => ['Produto', p.nome, String(p.qtd), brl(p.preco), brl(num(p.preco) * num(p.qtd))]));
  y = pdfTabela(doc, y, ['Tipo', 'Descrição', 'Qtd.', 'Unitário', 'Subtotal'], linhas, { columnStyles: { 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right' } } });
  doc.setFontSize(10.5);
  const W = doc.internal.pageSize.getWidth();
  const linha = (l, v, b) => { doc.setFont('helvetica', b ? 'bold' : 'normal'); doc.text(l, W - 70, y); doc.text(v, W - 14, y, { align: 'right' }); y += 6.5; };
  linha('Subtotal', brl(somaServ(a) + somaProd(a)));
  if (num(a.desconto)) linha('Desconto', '- ' + brl(a.desconto));
  doc.setFontSize(13); linha('TOTAL', brl(a.total), true);
  doc.setFontSize(10.5); linha('Pagamento', a.pagamento ? PAG[a.pagamento] + (a.pagamento === 'credito' && num(a.parcelas) > 1 ? ` (${a.parcelas}x de ${brl(num(a.total) / num(a.parcelas))})` : '') : '—');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(110, 100, 95);
  doc.text('Obrigado pela preferência! Volte sempre.', 14, y + 8);
  await pdfSalvar(doc, `comprovante-${slug(nomeCliente(a))}-${a.data}.pdf`);
}

async function pdfFinanceiro() {
  if (!pdfOk()) return;
  const l = filtroRel(), r = resumo(l);
  const prof = UI.relProf ? S.profissionais.find(p => p.id === UI.relProf) : null;
  let { doc, y } = pdfNovo('Relatório financeiro', `Período: ${fmtData(UI.relIni)} a ${fmtData(UI.relFim)}${prof ? '  ·  Profissional: ' + prof.nome : ''}`);
  y = pdfSecao(doc, y + 2, 'Resumo');
  y = pdfTabela(doc, y, ['Indicador', 'Valor'], [
    ['Faturamento total', brl(r.fat)], ['Receita de serviços', brl(r.fatServ)], ['Venda de produtos', brl(r.fatProd)], ['Descontos', brl(r.desc)],
    ['Atendimentos concluídos', String(r.concl.length)], ['Ticket médio', brl(r.ticket)],
    ['Cancelamentos', String(r.canc.length)], ['Faltas', String(r.falt.length)], ['Taxa de cancelamento + faltas', (r.taxaCanc * 100).toFixed(1) + '%']
  ], { columnStyles: { 1: { halign: 'right' } } });
  y = pdfSecao(doc, y, 'Formas de pagamento');
  y = pdfTabela(doc, y, ['Forma', 'Qtd.', 'Valor', '%'], Object.keys(PAG).map(k => [PAG[k], String(r.pagQ[k]), brl(r.pag[k]), (r.fat ? r.pag[k] / r.fat * 100 : 0).toFixed(1) + '%']), { columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } } });
  const pp = porProfissional(r.concl);
  y = pdfSecao(doc, y, 'Por profissional');
  y = pdfTabela(doc, y, ['Profissional', 'Atend.', 'Serviços', 'Faturamento', 'Comissão'], pp.length ? pp.map(x => [x.nome, String(x.qtd), brl(x.serv), brl(x.fat), `${brl(x.comissao)} (${x.comissaoPct}%)`]) : [['—', '', '', '', '']], { columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } } });
  const rk = rankingServicos(r.concl);
  y = pdfSecao(doc, y, 'Serviços realizados');
  y = pdfTabela(doc, y, ['Serviço', 'Qtd.', 'Valor'], rk.length ? rk.map(x => [x.nome, String(x.qtd), brl(x.valor)]) : [['—', '', '']], { columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' } } });
  y = pdfSecao(doc, y, 'Atendimentos concluídos');
  const lc = r.concl.slice().sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
  pdfTabela(doc, y, ['Data', 'Cliente', 'Serviços / produtos', 'Profissional', 'Pagto.', 'Total'], lc.length ? lc.map(a => [fmtData(a.data) + ' ' + a.hora, nomeCliente(a), (a.servicos || []).map(s => s.nome).concat((a.produtos || []).map(p => p.nome + ' x' + p.qtd)).join(', '), nomeProf(a) || '—', PAG[a.pagamento] || '—', brl(a.total)]) : [['—', '', '', '', '', '']], { styles: { fontSize: 8, cellPadding: 1.8 }, columnStyles: { 2: { cellWidth: 60 }, 5: { halign: 'right' } } });
  await pdfSalvar(doc, `relatorio-financeiro-${UI.relIni}-a-${UI.relFim}.pdf`);
}

async function pdfCancelamentos() {
  if (!pdfOk()) return;
  const r = resumo(filtroRel());
  const l = r.canc.concat(r.falt).sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
  let { doc, y } = pdfNovo('Relatório de cancelamentos e faltas', `Período: ${fmtData(UI.relIni)} a ${fmtData(UI.relFim)}  ·  ${r.canc.length} cancelamento(s), ${r.falt.length} falta(s)`);
  const porCli = l.filter(a => a.status === 'cancelado' && a.cancel && a.cancel.por !== 'salao').length;
  doc.setFontSize(10); doc.text(`Cancelados pelo cliente: ${porCli}   ·   pelo salão: ${r.canc.length - porCli}   ·   Valor previsto perdido: ${brl(l.reduce((s, a) => s + calcTotal(a), 0))}`, 14, y + 2);
  pdfTabela(doc, y + 7, ['Data', 'Cliente', 'Serviços', 'Situação', 'Por', 'Motivo', 'Valor'], l.length ? l.map(a => [fmtData(a.data) + ' ' + a.hora, nomeCliente(a), (a.servicos || []).map(s => s.nome).join(', '), STATUS[a.status], a.status === 'faltou' ? '—' : (a.cancel && a.cancel.por === 'salao' ? 'Salão' : 'Cliente'), a.status === 'faltou' ? 'Não compareceu' : ((a.cancel && (a.cancel.motivo + (a.cancel.obs ? ': ' + a.cancel.obs : ''))) || '—'), brl(calcTotal(a))]) : [['Nenhum registro no período', '', '', '', '', '', '']], { styles: { fontSize: 8, cellPadding: 1.8 }, columnStyles: { 6: { halign: 'right' } } });
  await pdfSalvar(doc, `cancelamentos-${UI.relIni}-a-${UI.relFim}.pdf`);
}

async function pdfClientes() {
  if (!pdfOk()) return;
  const l = S.clientes.slice().sort(porNome);
  let { doc, y } = pdfNovo('Lista de clientes', `${l.length} cliente(s) cadastrado(s)`);
  pdfTabela(doc, y, ['Nome', 'Telefone', 'Gênero', 'Visitas', 'Total gasto', 'Última visita', 'Cancel.'], l.map(c => { const s = statsCliente(c.id); return [c.nome, c.telefone || '—', c.genero || '—', String(s.visitas), brl(s.gasto), s.ultima ? fmtData(s.ultima) : '—', String(s.cancel)]; }), { columnStyles: { 3: { halign: 'center' }, 4: { halign: 'right' }, 6: { halign: 'center' } } });
  await pdfSalvar(doc, 'clientes.pdf');
}

async function pdfHistCliente(c) {
  if (!pdfOk()) return;
  const l = S.atendimentos.filter(a => a.clienteId === c.id).sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
  const s = statsCliente(c.id);
  let { doc, y } = pdfNovo('Histórico do cliente — ' + c.nome, `${c.telefone || ''}  ·  ${s.visitas} visita(s)  ·  total gasto ${brl(s.gasto)}`);
  if (c.obs) { doc.setFontSize(9.5); doc.text(doc.splitTextToSize('Observações: ' + c.obs, 180), 14, y + 1); y += 8; }
  pdfTabela(doc, y, ['Data', 'Serviços / produtos', 'Profissional', 'Situação', 'Pagto.', 'Valor'], l.length ? l.map(a => [fmtData(a.data) + ' ' + a.hora, (a.servicos || []).map(x => x.nome).concat((a.produtos || []).map(p => p.nome)).join(', '), nomeProf(a) || '—', STATUS[a.status], PAG[a.pagamento] || '—', brl(a.total)]) : [['—', '', '', '', '', '']], { styles: { fontSize: 8.5 }, columnStyles: { 1: { cellWidth: 62 }, 5: { halign: 'right' } } });
  await pdfSalvar(doc, `historico-${slug(c.nome)}.pdf`);
}

async function pdfEstoque() {
  if (!pdfOk()) return;
  const l = S.produtos.slice().sort(porNome);
  let { doc, y } = pdfNovo('Estoque de produtos', `${l.length} item(ns)  ·  valor em estoque ${brl(l.reduce((s, p) => s + num(p.preco) * Math.max(0, num(p.estoque)), 0))}`);
  pdfTabela(doc, y, ['Produto', 'Marca', 'Preço', 'Estoque', 'Mínimo', 'Situação'], l.map(p => [p.nome, p.marca || '—', brl(p.preco), String(num(p.estoque)), String(num(p.minimo)), num(p.estoque) <= 0 ? 'ZERADO' : num(p.estoque) <= num(p.minimo) ? 'Repor' : 'OK']), { columnStyles: { 2: { halign: 'right' }, 3: { halign: 'center' }, 4: { halign: 'center' } } });
  await pdfSalvar(doc, 'estoque.pdf');
}

/* ================= AÇÕES ================= */
async function carregarCatalogo() {
  const cat = catalogoPadrao();
  const novos = [];
  ['servicos', 'produtos', 'profissionais'].forEach(c => {
    const nomes = new Set(S[c].map(x => String(x.nome).toLowerCase()));
    cat[c].forEach(x => { if (!nomes.has(x.nome.toLowerCase())) novos.push([c, x]); });
  });
  if (!novos.length) { toast('O catálogo padrão já está carregado', ''); return; }
  toast('Carregando catálogo…');
  try { await emLotes(novos, ([c, x]) => salvar(c, x)); } catch (e) { return; }
  toast(`${novos.length} item(ns) adicionado(s) ao catálogo`, 'ok');
}

async function gerarDemo() {
  if (!S.servicos.length || !S.profissionais.length) await carregarCatalogo();
  if (!(await confirmar('Gerar 8 clientes e cerca de 60 atendimentos fictícios (últimos 30 dias + próximos dias)? Você pode apagá-los depois.', 'Gerar'))) return;
  const nomes = [['Juliana Alves', 'Feminino'], ['Marcos Pereira', 'Masculino'], ['Fernanda Lima', 'Feminino'], ['Rafael Souza', 'Masculino'], ['Patrícia Gomes', 'Feminino'], ['Lucas Martins', 'Masculino'], ['Beatriz Rocha', 'Feminino'], ['Thiago Costa', 'Masculino']];
  const clientes = nomes.map(([nome, genero], i) => ({ id: uid(), nome, genero, telefone: `(11) 9${8000 + i * 137}-${String(1000 + i * 731).slice(0, 4)}`, email: '', nascimento: '', obs: '', demo: true, criadoEm: new Date().toISOString() }));
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const pagW = () => { const r = Math.random(); return r < .45 ? 'pix' : r < .7 ? 'credito' : r < .92 ? 'debito' : 'dinheiro'; };
  const ats = [];
  const h = hoje();
  for (let d = -29; d <= 4; d++) {
    const data = addDias(h, d);
    if (toDate(data).getDay() === 0) continue; // domingo fechado
    const n = d > 0 ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 3) + 1;
    for (let k = 0; k < n; k++) {
      const c = rnd(clientes);
      const pool = S.servicos.filter(s => s.ativo !== false && (s.publico === 'Unissex' || s.publico === c.genero));
      if (!pool.length) continue;
      const s1 = rnd(pool), servicos = [s1];
      if (Math.random() < .3) { const s2 = rnd(pool); if (s2.id !== s1.id) servicos.push(s2); }
      const produtos = (S.produtos.length && Math.random() < .25) ? [rnd(S.produtos)].map(p => ({ id: p.id, nome: p.nome, preco: num(p.preco), qtd: 1 })) : [];
      const prof = rnd(S.profissionais);
      let status = 'agendado';
      if (data < h || (data === h && k === 0)) { const r = Math.random(); status = r < .82 ? 'concluido' : r < .94 ? 'cancelado' : 'faltou'; }
      const a = {
        id: uid(), clienteId: c.id, clienteNome: c.nome, profissionalId: prof.id, profNome: prof.nome, data, hora: pad(9 + Math.floor(Math.random() * 10)) + ':' + rnd(['00', '30']),
        servicos: servicos.map(s => ({ id: s.id, nome: s.nome, preco: num(s.preco) })), produtos, desconto: Math.random() < .1 ? 10 : 0, status,
        pagamento: status === 'concluido' ? pagW() : null, parcelas: 1, obs: '', demo: true, criadoEm: new Date().toISOString()
      };
      if (a.pagamento === 'credito' && a.servicos.some(s => s.preco >= 200)) a.parcelas = 3;
      if (status === 'cancelado') a.cancel = { por: Math.random() < .8 ? 'cliente' : 'salao', motivo: rnd(MOTIVOS), obs: '', em: new Date().toISOString() };
      a.total = calcTotal(a);
      ats.push(a);
    }
  }
  toast('Gerando demonstração…');
  try { await emLotes(clientes, c => salvar('clientes', c)); await emLotes(ats, a => salvar('atendimentos', a), 8); } catch (e) { return; }
  toast(`Demonstração criada: ${clientes.length} clientes e ${ats.length} atendimentos`, 'ok');
}

async function apagarDemo() {
  const a = S.atendimentos.filter(x => x.demo), c = S.clientes.filter(x => x.demo);
  if (!(await confirmar(`Apagar ${a.length} atendimento(s) e ${c.length} cliente(s) de demonstração?`, 'Apagar', true))) return;
  await emLotes(a, x => remover('atendimentos', x.id), 8);
  await emLotes(c, x => remover('clientes', x.id), 8);
  toast('Dados de demonstração apagados', 'ok');
}

async function fazerBackup() {
  const dados = { versao: 1, exportadoEm: new Date().toISOString(), config: S.config };
  COLS.forEach(c => { dados[c] = S[c]; });
  await baixar(`backup-${slug(S.config.nome)}-${hoje()}.json`, JSON.stringify(dados, null, 2));
}
async function restaurar(file) {
  let d;
  try { d = JSON.parse(await file.text()); } catch (e) { toast('Arquivo inválido', 'danger'); return; }
  if (!d || !COLS.some(c => Array.isArray(d[c]))) { toast('Este arquivo não parece um backup do sistema', 'danger'); return; }
  const tot = COLS.reduce((s, c) => s + (Array.isArray(d[c]) ? d[c].length : 0), 0);
  if (!(await confirmar(`Restaurar ${tot} registro(s)? Registros com o mesmo código serão substituídos; os demais são mantidos.`, 'Restaurar'))) return;
  toast('Restaurando…');
  try {
    for (const c of COLS) if (Array.isArray(d[c])) await emLotes(d[c].filter(x => x && x.id), x => salvar(c, x), 8);
    if (d.config) await salvarConfig(d.config);
  } catch (e) { return; }
  toast('Backup restaurado', 'ok');
}

function abrirWhatsApp(a) {
  const c = S.clientes.find(x => x.id === a.clienteId);
  let n = String((c && c.telefone) || '').replace(/\D/g, '');
  if (!n) { toast('Cliente sem telefone cadastrado', 'warn'); return; }
  if (n.length <= 11) n = '55' + n;
  const msg = `Olá, ${nomeCliente(a).split(' ')[0]}! Passando para lembrar do seu horário no ${S.config.nome || 'salão'}: ${diaLongo(a.data)} às ${a.hora}${(a.servicos || []).length ? ' (' + a.servicos.map(s => s.nome).join(', ') + ')' : ''}. Podemos confirmar? 💇`;
  const link = document.createElement('a');
  link.href = `https://wa.me/${n}?text=${encodeURIComponent(msg)}`;
  link.target = '_blank'; link.rel = 'noopener';
  document.body.appendChild(link); link.click(); link.remove();
}

const ACOES = {
  novoAt: () => formAtendimento(null),
  editarAt: a => formAtendimento(a),
  finalizar: a => formFinalizar(a),
  cancelar: a => formCancelar(a),
  recibo: a => pdfRecibo(a),
  zap: a => abrirWhatsApp(a),
  faltou: async a => { if (await confirmar(`Marcar que ${nomeCliente(a)} não compareceu?`, 'Marcar falta')) { await salvar('atendimentos', { ...a, status: 'faltou', pagamento: null }); toast('Falta registrada'); } },
  reativar: async a => { const n = { ...a, status: 'agendado', pagamento: null }; delete n.cancel; await salvar('atendimentos', n); toast('Atendimento reativado', 'ok'); },
  excluirAt: async a => { if (await confirmar(`Excluir definitivamente o atendimento de ${nomeCliente(a)} (${fmtData(a.data)})?${a.status === 'concluido' ? ' Os produtos voltarão ao estoque.' : ''}`, 'Excluir', true)) { await remover('atendimentos', a.id); await ajustarEstoque(a, null); toast('Atendimento excluído'); } },
  agPrev: () => moverAgenda(-1), agNext: () => moverAgenda(1),
  agHoje: () => { UI.agData = hoje(); $('#agData').value = UI.agData; renderBody(); },
  novoCli: () => formCliente(null), editarCli: c => formCliente(c), histCli: c => historicoCliente(c),
  agendarCli: c => formAtendimento(null, { clienteId: c.id }),
  excluirCli: async c => { const n = S.atendimentos.filter(a => a.clienteId === c.id).length; if (await confirmar(`Excluir ${c.nome}?${n ? ` Os ${n} atendimento(s) dela(e) continuam no histórico financeiro.` : ''}`, 'Excluir', true)) { await remover('clientes', c.id); toast('Cliente excluído'); } },
  pdfClientes: () => pdfClientes(), pdfHistCli: c => pdfHistCliente(c),
  novoServ: () => formServico(null), editarServ: s => formServico(s),
  excluirServ: async s => { if (await confirmar(`Excluir o serviço “${s.nome}”? Atendimentos antigos não são afetados. Dica: você pode apenas desativá-lo.`, 'Excluir', true)) { await remover('servicos', s.id); toast('Serviço excluído'); } },
  novoProd: () => formProduto(null), editarProd: p => formProduto(p), entradaProd: p => formEntrada(p),
  excluirProd: async p => { if (await confirmar(`Excluir o produto “${p.nome}”?`, 'Excluir', true)) { await remover('produtos', p.id); toast('Produto excluído'); } },
  pdfEstoque: () => pdfEstoque(),
  novoProf: () => formProf(null), editarProf: p => formProf(p),
  excluirProf: async p => { if (await confirmar(`Excluir ${p.nome} da equipe? Atendimentos antigos mantêm o nome. Dica: você pode apenas marcá-lo como inativo.`, 'Excluir', true)) { await remover('profissionais', p.id); toast('Profissional excluído'); } },
  pdfFinanceiro: () => pdfFinanceiro(), pdfCancel: () => pdfCancelamentos(),
  catalogo: () => carregarCatalogo(), gerarDemo: () => gerarDemo(), apagarDemo: () => apagarDemo(), backup: () => fazerBackup()
};
const COL_DA_ACAO = { editarAt: 'atendimentos', finalizar: 'atendimentos', cancelar: 'atendimentos', recibo: 'atendimentos', zap: 'atendimentos', faltou: 'atendimentos', reativar: 'atendimentos', excluirAt: 'atendimentos', editarCli: 'clientes', histCli: 'clientes', agendarCli: 'clientes', excluirCli: 'clientes', pdfHistCli: 'clientes', editarServ: 'servicos', excluirServ: 'servicos', editarProd: 'produtos', entradaProd: 'produtos', excluirProd: 'produtos', editarProf: 'profissionais', excluirProf: 'profissionais' };

function moverAgenda(dir) {
  const d = toDate(UI.agData);
  if (UI.agRange === 'semana') d.setDate(d.getDate() + 7 * dir);
  else if (UI.agRange === 'mes') d.setMonth(d.getMonth() + dir, 1);
  else d.setDate(d.getDate() + dir);
  UI.agData = dstr(d); $('#agData').value = UI.agData; renderBody();
}

/* ================= EVENTOS ================= */
document.addEventListener('click', async e => {
  if (e.target.closest('[data-topo]')) { irTopo(); return; }
  const t = e.target.closest('[data-tab]');
  if (t) { irPara(t.dataset.tab); return; }
  if (e.target.closest('[data-close]') || e.target.id === 'overlay') { fecharModal(); return; }
  const per = e.target.closest('[data-per]');
  if (per) { UI.periodo = per.dataset.per; $$('#segPeriodo button').forEach(b => b.classList.toggle('active', b === per)); renderBody(); return; }
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled) return;
  const fn = ACOES[b.dataset.act];
  if (!fn) return;
  const col = COL_DA_ACAO[b.dataset.act];
  let alvo = null;
  if (col) { alvo = S[col].find(x => x.id === b.dataset.id); if (!alvo) { toast('Registro não encontrado', 'warn'); return; } }
  try { await fn(alvo); } catch (err) { console.error(err); }
});

const FILTROS = { agData: 'agData', agRange: 'agRange', agStatus: 'agStatus', agProf: 'agProf', agBusca: 'agBusca', cliBusca: 'cliBusca', cliGenero: 'cliGenero', servBusca: 'servBusca', servCat: 'servCat', prodBusca: 'prodBusca', relIni: 'relIni', relFim: 'relFim', relProf: 'relProf' };
$('#toolbar').addEventListener('input', e => {
  const k = FILTROS[e.target.id];
  if (!k) return;
  if ((k === 'agData' || k === 'relIni' || k === 'relFim') && !e.target.value) return;
  UI[k] = e.target.value;
  if (k === 'relIni' && UI.relIni > UI.relFim) { UI.relFim = UI.relIni; $('#relFim').value = UI.relFim; }
  if (k === 'relFim' && UI.relFim < UI.relIni) { UI.relIni = UI.relFim; $('#relIni').value = UI.relIni; }
  renderBody();
});

document.addEventListener('submit', async e => {
  if (e.target.id === 'fCfg') {
    e.preventDefault();
    const fd = new FormData(e.target);
    const nome = String(fd.get('nome')).trim();
    if (!nome) { toast('Informe o nome do salão', 'warn'); return; }
    const v = k => String(fd.get(k) || '').trim();
    await salvarConfig({ nome, whatsapp: v('whatsapp'), telefone: v('whatsapp'), fixo: v('fixo'), endereco: v('endereco'), bairro: v('bairro'), cidade: v('cidade'), cep: v('cep'), horario: v('horario'), instagram: v('instagram'), email: v('email'), cnpj: v('cnpj') });
    toast('Dados do salão salvos', 'ok');
  }
});
document.addEventListener('change', e => {
  if (e.target.id === 'fileRestore' && e.target.files[0]) { restaurar(e.target.files[0]); e.target.value = ''; }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!$('#confirmOv').hidden) $('#cNo').click();
    else if (!$('#overlay').hidden) fecharModal();
  }
});

$$('.theme-opt').forEach(b => b.addEventListener('click', () => aplicarTema(b.dataset.tema)));
window.addEventListener('scroll', () => { $('#btnTopo').classList.toggle('show', window.scrollY > 400); }, { passive: true });
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h && h !== UI.tab && TITULOS[h]) irPara(h); });

/* ================= INÍCIO ================= */
marcarTema();
irPara(location.hash.slice(1) || 'painel');
iniciar();
