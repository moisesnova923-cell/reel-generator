// ── Visual Slide Editor (Canva-style) ───────────────────────────
const ED_W = 1080, ED_H = 1350;

let edSlides = [];
let edCurrent = 0;
let edSelId = null;
let edScale = 1;
let edDrag = null;
let edResize = null;
let edHistory = [];
let edInitialized = false;

// ── Init ─────────────────────────────────────────────────────────
function edInit() {
  if (!edInitialized) {
    edInitialized = true;
    window.addEventListener('mousemove', edOnMouseMove);
    window.addEventListener('mouseup', edOnMouseUp);
    window.addEventListener('resize', () => { edComputeScale(); edRender(); });
    document.addEventListener('keydown', edOnKeyDown);
    document.getElementById('ed-canvas').addEventListener('mousedown', (e) => {
      if (e.target === document.getElementById('ed-canvas')) {
        edSelId = null;
        edRender();
        edUpdateProps();
      }
    });
  }
  if (!edSlides.length) edAddSlide();
  edComputeScale();
  edRender();
  edRenderList();
  edUpdateProps();
}

function edComputeScale() {
  const wrapper = document.getElementById('ed-canvas-wrapper');
  if (!wrapper) return;
  const ww = wrapper.clientWidth - 48;
  const wh = window.innerHeight - 120; // leave room for toolbar
  edScale = Math.min(ww / ED_W, wh / ED_H, 1);
  const canvas = document.getElementById('ed-canvas');
  if (canvas) {
    canvas.style.transform = `scale(${edScale})`;
    // Center the scaled canvas in the wrapper
    const scaledW = Math.round(ED_W * edScale);
    const scaledH = Math.round(ED_H * edScale);
    canvas.style.marginLeft = Math.max(0, Math.round((ww - scaledW) / 2)) + 'px';
    wrapper.style.height = scaledH + 48 + 'px';
  }
}

function edNextId() {
  return 'el_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

function edCurSlide() {
  return edSlides[edCurrent];
}

// ── Slides ────────────────────────────────────────────────────────
function edAddSlide() {
  edSaveHistory();
  edSlides.push({ id: edNextId(), bg: '#ffffff', bgImg: null, elements: [] });
  edCurrent = edSlides.length - 1;
  edSelId = null;
  edRender();
  edRenderList();
}

function edDuplicateSlide() {
  edSaveHistory();
  const clone = JSON.parse(JSON.stringify(edSlides[edCurrent]));
  clone.id = edNextId();
  clone.elements = clone.elements.map(e => ({ ...e, id: edNextId() }));
  edSlides.splice(edCurrent + 1, 0, clone);
  edCurrent++;
  edSelId = null;
  edRender();
  edRenderList();
}

function edDeleteSlideAt(i) {
  if (edSlides.length <= 1) return;
  edSaveHistory();
  edSlides.splice(i, 1);
  if (edCurrent >= edSlides.length) edCurrent = edSlides.length - 1;
  edSelId = null;
  edRender();
  edRenderList();
}

function edSwitchSlide(i) {
  edCurrent = i;
  edSelId = null;
  edRender();
  edRenderList();
  edUpdateProps();
}

// ── Render ────────────────────────────────────────────────────────
function edRender() {
  const canvas = document.getElementById('ed-canvas');
  if (!canvas) return;
  const slide = edCurSlide();
  if (!slide) return;

  if (slide.bgImg) {
    canvas.style.background = `url(${slide.bgImg}) center/cover no-repeat`;
  } else {
    canvas.style.backgroundImage = '';
    canvas.style.background = slide.bg;
  }

  canvas.querySelectorAll('.ed-el').forEach(e => e.remove());
  slide.elements.forEach(el => canvas.appendChild(edCreateDiv(el)));
  edRenderList();
}

function edCreateDiv(el) {
  const isSelected = el.id === edSelId;
  const div = document.createElement('div');
  div.className = 'ed-el' + (isSelected ? ' ed-selected' : '');
  div.dataset.id = el.id;
  Object.assign(div.style, {
    position: 'absolute',
    left: el.x + 'px', top: el.y + 'px',
    width: el.w + 'px', height: el.h + 'px',
    cursor: 'move',
    userSelect: 'none',
    boxSizing: 'border-box',
  });

  if (el.type === 'text') {
    Object.assign(div.style, {
      fontSize: el.fontSize + 'px',
      fontFamily: el.fontFamily || 'Arial',
      color: el.color || '#000000',
      fontWeight: el.bold ? 'bold' : 'normal',
      fontStyle: el.italic ? 'italic' : 'normal',
      textAlign: el.align || 'left',
      lineHeight: '1.3',
      overflow: 'hidden',
      wordBreak: 'break-word',
      whiteSpace: 'pre-wrap',
      padding: '4px',
    });
    div.textContent = el.text || 'Escribe aquí';
    div.addEventListener('dblclick', (e) => { e.stopPropagation(); edStartTextEdit(div, el); });
  } else if (el.type === 'rect' || el.type === 'circle') {
    Object.assign(div.style, {
      background: el.fill || '#cccccc',
      borderRadius: el.type === 'circle' ? '50%' : (el.radius || 0) + 'px',
      opacity: el.opacity !== undefined ? el.opacity : 1,
    });
    if (el.stroke) div.style.border = `${el.strokeW || 2}px solid ${el.stroke}`;
  } else if (el.type === 'image') {
    const img = document.createElement('img');
    img.src = el.src;
    img.draggable = false;
    Object.assign(img.style, { width: '100%', height: '100%', objectFit: el.fit || 'cover', display: 'block', pointerEvents: 'none' });
    div.appendChild(img);
  }

  div.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('ed-handle') || e.target.classList.contains('ed-del-el')) return;
    e.stopPropagation();
    edSelId = el.id;
    edRender();
    edUpdateProps();
    const sc = edToSlide(e.clientX, e.clientY);
    edDrag = { elId: el.id, startMX: sc.x, startMY: sc.y, startElX: el.x, startElY: el.y };
  });

  if (isSelected) {
    ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].forEach(pos => {
      const h = document.createElement('div');
      h.className = `ed-handle ed-handle-${pos}`;
      h.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        const sc = edToSlide(e.clientX, e.clientY);
        edResize = { elId: el.id, handle: pos, startMX: sc.x, startMY: sc.y, startElX: el.x, startElY: el.y, startElW: el.w, startElH: el.h };
        edDrag = null;
      });
      div.appendChild(h);
    });

    const del = document.createElement('div');
    del.className = 'ed-del-el';
    del.textContent = '×';
    del.title = 'Eliminar';
    del.addEventListener('mousedown', (e) => { e.stopPropagation(); edDeleteElement(el.id); });
    div.appendChild(del);
  }

  return div;
}

function edToSlide(screenX, screenY) {
  const canvas = document.getElementById('ed-canvas');
  const rect = canvas.getBoundingClientRect();
  return { x: (screenX - rect.left) / edScale, y: (screenY - rect.top) / edScale };
}

// ── Mouse events ──────────────────────────────────────────────────
function edOnMouseMove(e) {
  if (edDrag) {
    const { elId, startMX, startMY, startElX, startElY } = edDrag;
    const sc = edToSlide(e.clientX, e.clientY);
    const slide = edCurSlide();
    const el = slide.elements.find(e => e.id === elId);
    if (el) {
      el.x = Math.max(0, Math.min(ED_W - el.w, startElX + sc.x - startMX));
      el.y = Math.max(0, Math.min(ED_H - el.h, startElY + sc.y - startMY));
      edRender();
    }
  } else if (edResize) {
    const { elId, handle, startMX, startMY, startElX, startElY, startElW, startElH } = edResize;
    const sc = edToSlide(e.clientX, e.clientY);
    const dx = sc.x - startMX, dy = sc.y - startMY;
    const slide = edCurSlide();
    const el = slide.elements.find(e => e.id === elId);
    if (!el) return;
    const MIN = 20;
    if (handle === 'se') { el.w = Math.max(MIN, startElW + dx); el.h = Math.max(MIN, startElH + dy); }
    else if (handle === 'sw') { const nw = Math.max(MIN, startElW - dx); el.x = startElX + startElW - nw; el.w = nw; el.h = Math.max(MIN, startElH + dy); }
    else if (handle === 'ne') { el.w = Math.max(MIN, startElW + dx); const nh = Math.max(MIN, startElH - dy); el.y = startElY + startElH - nh; el.h = nh; }
    else if (handle === 'nw') { const nw2 = Math.max(MIN, startElW - dx); const nh2 = Math.max(MIN, startElH - dy); el.x = startElX + startElW - nw2; el.y = startElY + startElH - nh2; el.w = nw2; el.h = nh2; }
    else if (handle === 'e') { el.w = Math.max(MIN, startElW + dx); }
    else if (handle === 'w') { const nw3 = Math.max(MIN, startElW - dx); el.x = startElX + startElW - nw3; el.w = nw3; }
    else if (handle === 's') { el.h = Math.max(MIN, startElH + dy); }
    else if (handle === 'n') { const nh3 = Math.max(MIN, startElH - dy); el.y = startElY + startElH - nh3; el.h = nh3; }
    edRender();
  }
}

function edOnMouseUp() {
  if (edDrag || edResize) {
    edDrag = null;
    edResize = null;
    edUpdateProps();
  }
}

function edOnKeyDown(e) {
  if (!document.getElementById('page-editor')?.classList.contains('active')) return;
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if ((e.key === 'Delete' || e.key === 'Backspace') && edSelId) edDeleteElement(edSelId);
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); edUndo(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); edDuplicateSelected(); }
}

// ── Text editing ──────────────────────────────────────────────────
function edStartTextEdit(div, el) {
  div.style.cursor = 'text';
  const old = div.innerHTML;
  div.textContent = '';
  const ta = document.createElement('textarea');
  ta.value = el.text || '';
  Object.assign(ta.style, {
    width: '100%', height: '100%',
    background: 'transparent', border: 'none', outline: 'none',
    color: el.color || '#000', fontSize: el.fontSize + 'px',
    fontFamily: el.fontFamily || 'Arial',
    fontWeight: el.bold ? 'bold' : 'normal',
    fontStyle: el.italic ? 'italic' : 'normal',
    textAlign: el.align || 'left',
    resize: 'none', padding: '4px', lineHeight: '1.3',
    boxSizing: 'border-box',
  });
  div.appendChild(ta);
  ta.focus();
  ta.addEventListener('mousedown', e => e.stopPropagation());
  ta.addEventListener('blur', () => {
    el.text = ta.value;
    edRender();
    edUpdateProps();
  });
}

// ── Add elements ──────────────────────────────────────────────────
function edAddText() {
  edSaveHistory();
  const el = {
    id: edNextId(), type: 'text',
    x: 80, y: 200, w: 920, h: 160,
    text: 'Escribe aquí', fontSize: 80,
    fontFamily: 'Arial Black', color: '#000000',
    bold: false, italic: false, align: 'left',
  };
  edCurSlide().elements.push(el);
  edSelId = el.id;
  edRender();
  edUpdateProps();
}

function edAddRect() {
  edSaveHistory();
  const el = { id: edNextId(), type: 'rect', x: 190, y: 400, w: 700, h: 200, fill: '#5483B3', radius: 20, opacity: 1 };
  edCurSlide().elements.push(el);
  edSelId = el.id;
  edRender();
  edUpdateProps();
}

function edAddCircle() {
  edSaveHistory();
  const el = { id: edNextId(), type: 'circle', x: 340, y: 475, w: 400, h: 400, fill: '#f0c040', opacity: 1 };
  edCurSlide().elements.push(el);
  edSelId = el.id;
  edRender();
  edUpdateProps();
}

function edAddImage() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      edSaveHistory();
      const el = { id: edNextId(), type: 'image', x: 0, y: 0, w: ED_W, h: ED_H, src: ev.target.result, fit: 'cover' };
      edCurSlide().elements.push(el);
      edSelId = el.id;
      edRender();
      edUpdateProps();
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function edSetBackground(color) {
  edSaveHistory();
  edCurSlide().bg = color;
  edCurSlide().bgImg = null;
  document.getElementById('ed-canvas').style.backgroundImage = '';
  edRender();
}

function edSetBgImage(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    edSaveHistory();
    edCurSlide().bgImg = ev.target.result;
    edRender();
  };
  reader.readAsDataURL(file);
  input.value = '';
}

function edDeleteElement(id) {
  edSaveHistory();
  const slide = edCurSlide();
  slide.elements = slide.elements.filter(e => e.id !== id);
  if (edSelId === id) edSelId = null;
  edRender();
  edUpdateProps();
}

function edDuplicateSelected() {
  if (!edSelId) return;
  edSaveHistory();
  const slide = edCurSlide();
  const el = slide.elements.find(e => e.id === edSelId);
  if (!el) return;
  const clone = { ...JSON.parse(JSON.stringify(el)), id: edNextId(), x: el.x + 30, y: el.y + 30 };
  slide.elements.push(clone);
  edSelId = clone.id;
  edRender();
  edUpdateProps();
}

function edMoveLayer(dir) {
  const slide = edCurSlide();
  const i = slide.elements.findIndex(e => e.id === edSelId);
  if (i === -1) return;
  if (dir === 'up' && i < slide.elements.length - 1) {
    [slide.elements[i], slide.elements[i + 1]] = [slide.elements[i + 1], slide.elements[i]];
  } else if (dir === 'down' && i > 0) {
    [slide.elements[i], slide.elements[i - 1]] = [slide.elements[i - 1], slide.elements[i]];
  }
  edRender();
}

// ── Properties panel ──────────────────────────────────────────────
function edUpdateProps() {
  const panel = document.getElementById('ed-props-panel');
  if (!panel) return;
  const slide = edCurSlide();
  const el = slide?.elements.find(e => e.id === edSelId);

  if (!el) {
    panel.innerHTML = `<p style="color:var(--text-dim);font-size:13px;text-align:center;padding:24px 16px">Selecciona un elemento para editarlo</p>`;
    return;
  }

  let html = '';

  if (el.type === 'text') {
    html += `
      <div class="prop-section">
        <div class="prop-label">Texto</div>
        <textarea class="prop-textarea" rows="3" onchange="edSetProp('text',this.value)">${el.text || ''}</textarea>
      </div>
      <div class="prop-section">
        <div class="prop-label">Tamaño de fuente</div>
        <input class="prop-input" type="number" value="${el.fontSize}" min="10" max="400" onchange="edSetProp('fontSize',+this.value)" />
      </div>
      <div class="prop-section">
        <div class="prop-label">Color</div>
        <input class="prop-color" type="color" value="${el.color || '#000000'}" oninput="edSetProp('color',this.value)" />
      </div>
      <div class="prop-section">
        <div class="prop-label">Fuente</div>
        <select class="prop-select" onchange="edSetProp('fontFamily',this.value)">
          ${['Arial','Arial Black','Impact','Georgia','Verdana','Times New Roman','Trebuchet MS'].map(f =>
            `<option value="${f}"${el.fontFamily===f?' selected':''}>${f}</option>`).join('')}
        </select>
      </div>
      <div class="prop-section">
        <div class="prop-label">Alineación</div>
        <select class="prop-select" onchange="edSetProp('align',this.value)">
          <option value="left"${el.align==='left'?' selected':''}>Izquierda</option>
          <option value="center"${el.align==='center'?' selected':''}>Centro</option>
          <option value="right"${el.align==='right'?' selected':''}>Derecha</option>
        </select>
      </div>
      <div class="prop-section prop-row">
        <label class="prop-check"><input type="checkbox"${el.bold?' checked':''} onchange="edSetProp('bold',this.checked)"> Negrita</label>
        <label class="prop-check"><input type="checkbox"${el.italic?' checked':''} onchange="edSetProp('italic',this.checked)"> Cursiva</label>
      </div>`;
  } else if (el.type === 'rect' || el.type === 'circle') {
    html += `
      <div class="prop-section">
        <div class="prop-label">Color de relleno</div>
        <input class="prop-color" type="color" value="${el.fill || '#cccccc'}" oninput="edSetProp('fill',this.value)" />
      </div>
      <div class="prop-section">
        <div class="prop-label">Opacidad</div>
        <input type="range" min="0" max="1" step="0.05" value="${el.opacity !== undefined ? el.opacity : 1}"
          oninput="edSetProp('opacity',+this.value)" style="width:100%" />
      </div>
      ${el.type === 'rect' ? `
      <div class="prop-section">
        <div class="prop-label">Bordes redondeados</div>
        <input class="prop-input" type="number" min="0" max="675" value="${el.radius || 0}" onchange="edSetProp('radius',+this.value)" />
      </div>` : ''}`;
  } else if (el.type === 'image') {
    html += `
      <div class="prop-section">
        <div class="prop-label">Ajuste de imagen</div>
        <select class="prop-select" onchange="edSetProp('fit',this.value)">
          <option value="cover"${el.fit==='cover'?' selected':''}>Cubrir</option>
          <option value="contain"${el.fit==='contain'?' selected':''}>Contener</option>
          <option value="fill"${el.fit==='fill'?' selected':''}>Estirar</option>
        </select>
      </div>`;
  }

  html += `
    <div class="prop-section">
      <div class="prop-label">Posición y tamaño</div>
      <div class="prop-grid2">
        <div><div class="prop-sublabel">X</div><input class="prop-input" type="number" value="${Math.round(el.x)}" onchange="edSetProp('x',+this.value)" /></div>
        <div><div class="prop-sublabel">Y</div><input class="prop-input" type="number" value="${Math.round(el.y)}" onchange="edSetProp('y',+this.value)" /></div>
        <div><div class="prop-sublabel">Ancho</div><input class="prop-input" type="number" value="${Math.round(el.w)}" onchange="edSetProp('w',+this.value)" /></div>
        <div><div class="prop-sublabel">Alto</div><input class="prop-input" type="number" value="${Math.round(el.h)}" onchange="edSetProp('h',+this.value)" /></div>
      </div>
    </div>
    <div class="prop-section">
      <div class="prop-label">Orden de capa</div>
      <div class="prop-row">
        <button class="btn btn-secondary btn-sm" onclick="edMoveLayer('up')">▲ Arriba</button>
        <button class="btn btn-secondary btn-sm" onclick="edMoveLayer('down')">▼ Abajo</button>
      </div>
    </div>
    <div class="prop-section">
      <button class="btn btn-secondary btn-sm" style="width:100%" onclick="edDuplicateSelected()">⧉ Duplicar</button>
      <button class="btn btn-danger btn-sm" style="width:100%;margin-top:6px" onclick="edDeleteElement('${el.id}')">🗑 Eliminar</button>
    </div>`;

  panel.innerHTML = html;
}

function edSetProp(key, value) {
  const el = edCurSlide()?.elements.find(e => e.id === edSelId);
  if (!el) return;
  el[key] = value;
  edRender();
}

// ── Slide list thumbnails ─────────────────────────────────────────
function edRenderList() {
  const list = document.getElementById('ed-slides-list');
  if (!list) return;
  const MINI_W = 180, MINI_H = 225;
  const s = MINI_W / ED_W;

  list.innerHTML = edSlides.map((slide, i) => {
    const els = slide.elements.map(el => {
      const st = `position:absolute;left:${el.x * s}px;top:${el.y * s}px;width:${el.w * s}px;height:${el.h * s}px;`;
      if (el.type === 'text') return `<div style="${st}font-size:${el.fontSize * s}px;color:${el.color || '#000'};font-weight:${el.bold ? 'bold' : 'normal'};overflow:hidden;white-space:nowrap;">${el.text || ''}</div>`;
      if (el.type === 'rect' || el.type === 'circle') return `<div style="${st}background:${el.fill || '#ccc'};border-radius:${el.type === 'circle' ? '50%' : (el.radius || 0) * s + 'px'};opacity:${el.opacity || 1}"></div>`;
      if (el.type === 'image') return `<img src="${el.src}" style="${st}object-fit:${el.fit || 'cover'}" />`;
      return '';
    }).join('');

    const bg = slide.bgImg ? `url(${slide.bgImg}) center/cover no-repeat` : slide.bg;

    return `<div class="ed-thumb ${i === edCurrent ? 'active' : ''}" onclick="edSwitchSlide(${i})">
      <div class="ed-thumb-inner" style="background:${bg}">${els}</div>
      <div class="ed-thumb-label">Slide ${i + 1}</div>
      ${edSlides.length > 1 ? `<button class="ed-thumb-del" onclick="event.stopPropagation();edDeleteSlideAt(${i})">×</button>` : ''}
    </div>`;
  }).join('');
}

// ── History ───────────────────────────────────────────────────────
function edSaveHistory() {
  edHistory.push(JSON.stringify({ slides: edSlides, current: edCurrent }));
  if (edHistory.length > 30) edHistory.shift();
}

function edUndo() {
  if (!edHistory.length) return;
  const state = JSON.parse(edHistory.pop());
  edSlides = state.slides;
  edCurrent = state.current;
  edSelId = null;
  edRender();
  edRenderList();
  edUpdateProps();
}

// ── Export ────────────────────────────────────────────────────────
async function edExportCurrent() {
  const btn = document.getElementById('ed-btn-export');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Exportando...'; }
  try {
    const blob = await edSlideToBlob(edCurSlide());
    edDownload(blob, `slide_${edCurrent + 1}.png`);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '⬇ Exportar PNG'; }
  }
}

async function edExportAll() {
  const btn = document.getElementById('ed-btn-export-all');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Exportando...'; }
  try {
    for (let i = 0; i < edSlides.length; i++) {
      const blob = await edSlideToBlob(edSlides[i]);
      edDownload(blob, `slide_${i + 1}.png`);
      await new Promise(r => setTimeout(r, 120));
    }
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '⬇ Exportar todos (ZIP)'; }
  }
}

function edDownload(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function edSlideToBlob(slide) {
  const c = document.createElement('canvas');
  c.width = ED_W; c.height = ED_H;
  const ctx = c.getContext('2d');

  if (slide.bgImg) {
    await edDrawImg(ctx, slide.bgImg, 0, 0, ED_W, ED_H, 'cover');
  } else {
    ctx.fillStyle = slide.bg;
    ctx.fillRect(0, 0, ED_W, ED_H);
  }

  for (const el of slide.elements) {
    ctx.save();
    ctx.globalAlpha = el.opacity !== undefined ? el.opacity : 1;

    if (el.type === 'rect') {
      ctx.fillStyle = el.fill || '#ccc';
      if (el.radius) { edRoundRect(ctx, el.x, el.y, el.w, el.h, el.radius); ctx.fill(); }
      else ctx.fillRect(el.x, el.y, el.w, el.h);
    } else if (el.type === 'circle') {
      ctx.fillStyle = el.fill || '#ccc';
      ctx.beginPath();
      ctx.ellipse(el.x + el.w / 2, el.y + el.h / 2, el.w / 2, el.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (el.type === 'text') {
      ctx.globalAlpha = 1;
      ctx.fillStyle = el.color || '#000';
      const fw = el.bold ? 'bold' : 'normal';
      const fs = el.italic ? 'italic' : 'normal';
      ctx.font = `${fs} ${fw} ${el.fontSize}px "${el.fontFamily || 'Arial'}"`;
      ctx.textAlign = el.align || 'left';
      const tx = el.align === 'center' ? el.x + el.w / 2 : el.align === 'right' ? el.x + el.w - 4 : el.x + 4;
      const lines = (el.text || '').split('\n');
      let ly = el.y + el.fontSize;
      for (const line of lines) {
        for (const wl of edWrapText(ctx, line, el.w - 8)) {
          if (ly > el.y + el.h + el.fontSize) break;
          ctx.fillText(wl, tx, ly);
          ly += el.fontSize * 1.3;
        }
      }
    } else if (el.type === 'image') {
      try { await edDrawImg(ctx, el.src, el.x, el.y, el.w, el.h, el.fit || 'cover'); } catch (_) {}
    }
    ctx.restore();
  }

  return new Promise(resolve => c.toBlob(resolve, 'image/png'));
}

function edWrapText(ctx, text, maxW) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width <= maxW) { line = test; }
    else { if (line) lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

function edRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function edDrawImg(ctx, src, x, y, w, h, fit) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (fit === 'cover') {
        const sc = Math.max(w / img.width, h / img.height);
        const sw = img.width * sc, sh = img.height * sc;
        ctx.drawImage(img, x + (w - sw) / 2, y + (h - sh) / 2, sw, sh);
      } else if (fit === 'contain') {
        const sc = Math.min(w / img.width, h / img.height);
        const sw = img.width * sc, sh = img.height * sc;
        ctx.drawImage(img, x + (w - sw) / 2, y + (h - sh) / 2, sw, sh);
      } else {
        ctx.drawImage(img, x, y, w, h);
      }
      resolve();
    };
    img.onerror = reject;
    img.src = src;
  });
}
