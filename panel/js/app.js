const API = "";  // mismo origen cuando corra en Railway

// ── Navegación ────────────────────────────────────────────────
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.getElementById(`page-${id}`)?.classList.add("active");
  document.querySelector(`[data-page="${id}"]`)?.classList.add("active");
  if (id === "dashboard") loadDashboard();
  if (id === "templates") loadTemplates();
  if (id === "branding") loadBranding();
  if (id === "voices") loadVoices();
  if (id === "generate") loadGeneratePage();
  if (id === "posts") loadPostsPage();
}

document.querySelectorAll(".nav-item").forEach(el => {
  el.addEventListener("click", () => showPage(el.dataset.page));
});

// ── Toast ─────────────────────────────────────────────────────
function toast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = (type === "success" ? "✅ " : "❌ ") + msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove("show"), 3000);
}

// ── Dashboard ─────────────────────────────────────────────────
let pollInterval = null;

async function loadDashboard() {
  const reels = await fetch(`${API}/api/reels`).then(r => r.json()).catch(() => []);
  const total = reels.length;
  const done = reels.filter(r => r.status === "listo").length;
  const proc = reels.filter(r => r.status === "procesando" || r.status === "pendiente").length;
  const errs = reels.filter(r => r.status === "error").length;

  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-done").textContent = done;
  document.getElementById("stat-processing").textContent = proc;
  document.getElementById("stat-errors").textContent = errs;

  const tbody = document.getElementById("reels-table");
  if (!reels.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="icon">🎬</div>No hay reels todavía. ¡Genera el primero!</div></td></tr>`;
    return;
  }

  tbody.innerHTML = reels.map(r => {
    const badgeClass = { pendiente: "badge-pending", procesando: "badge-processing", listo: "badge-done", error: "badge-error" }[r.status];
    const fecha = new Date(r.createdAt).toLocaleDateString("es", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    const preview = r.videoUrl
      ? `<div class="video-thumb"><video src="${r.videoUrl}" muted></video></div>`
      : `<div class="video-thumb">🎬</div>`;
    const progress = r.status === "procesando"
      ? `<div class="progress-bar" style="width:120px"><div class="progress-fill" style="width:${r.progreso}%"></div></div>`
      : `${r.progreso}%`;
    const actions = r.videoUrl
      ? `<div class="actions-row"><a href="${r.videoUrl}" download class="btn btn-sm btn-secondary">⬇ Descargar</a></div>`
      : (r.status === "error" ? `<span style="font-size:12px;color:var(--error)" title="${r.errorMsg}">⚠ Error</span>` : "—");

    return `<tr>
      <td>${preview}</td>
      <td style="font-weight:600">${r.titulo || "Sin título"}</td>
      <td><span class="badge ${badgeClass}">${r.status}</span></td>
      <td>${progress}</td>
      <td style="color:var(--text-dim)">${fecha}</td>
      <td>${actions}</td>
    </tr>`;
  }).join("");

  if (proc > 0 && !pollInterval) {
    pollInterval = setInterval(() => loadDashboard(), 4000);
  } else if (proc === 0 && pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

// ── Agente IA ─────────────────────────────────────────────────
async function generarConIA() {
  const descripcion = document.getElementById("ai-descripcion").value.trim();
  if (!descripcion) { toast("Escribe cómo quieres el reel", "error"); return; }

  const btn = document.getElementById("btn-ai");
  btn.disabled = true;
  btn.textContent = "⏳ Pensando...";

  try {
    // Pasar las voces disponibles al agente para que elija la más apropiada
    const voces = await fetch(`${API}/api/voices`).then(r => r.json()).catch(() => []);
    const resp = await fetch(`${API}/api/ai/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descripcion, voces }),
    }).then(r => r.json());

    if (!resp.ok) { toast(resp.error || "Error IA", "error"); return; }

    const c = resp.config;

    // Auto-rellenar formulario
    if (c.templateId) {
      document.getElementById("gen-template").value = c.templateId;
      document.getElementById("gen-template").dispatchEvent(new Event("change"));
    }
    if (c.voiceId) document.getElementById("gen-voice").value = c.voiceId;
    if (c.colorFondo) {
      document.getElementById("gen-bg").value = c.colorFondo;
      document.getElementById("gen-bg-text").value = c.colorFondo;
    }
    if (c.colorPrimario) {
      document.getElementById("gen-color").value = c.colorPrimario;
      document.getElementById("gen-color-text").value = c.colorPrimario;
    }
    if (c.duracionEscena) {
      document.getElementById("gen-speed").value = c.duracionEscena > 10 ? 0.8 : 0.95;
      document.getElementById("gen-speed-val").textContent = document.getElementById("gen-speed").value;
    }

    // Guardar estilo IA para enviarlo al generar
    window._aiConfig = {
      estiloSubtitulo: c.estiloSubtitulo || "fluido",
      estiloTransicion: c.estiloTransicion || "dinamico",
      estiloImagen: c.estiloImagen || "ciudad",
      incluirLogo: c.incluirLogo ?? true,
    };

    // Mostrar razonamiento + aviso si creó template nuevo
    const razDiv = document.getElementById("ai-razonamiento");
    razDiv.style.display = "block";
    const badgeNuevo = c.templateCreado
      ? `<span style="background:var(--accent);color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;margin-left:6px">✨ Template nuevo: "${c.nombreTemplateCreado}"</span>`
      : "";
    razDiv.innerHTML = `🤖 <strong>IA:</strong>${badgeNuevo} ${c.razonamiento}`;

    toast("¡Configuración aplicada! Revisa y lanza el reel");
  } catch (e) {
    toast("Error conectando con IA: " + e.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "✨ Configurar con IA";
  }
}

// ── Generate ──────────────────────────────────────────────────
let currentReelId = null;
let genPollInterval = null;

async function loadGeneratePage() {
  const templates = await fetch(`${API}/api/templates`).then(r => r.json()).catch(() => []);
  const sel = document.getElementById("gen-template");
  sel.innerHTML = `<option value="">— Selecciona un template —</option>` +
    templates.map(t => `<option value="${t._id}">${t.nombre}</option>`).join("");

  const branding = await fetch(`${API}/api/branding`).then(r => r.json()).catch(() => ({}));
  if (branding.colorFondo) { document.getElementById("gen-bg").value = branding.colorFondo; document.getElementById("gen-bg-text").value = branding.colorFondo; }
  if (branding.colorPrimario) { document.getElementById("gen-color").value = branding.colorPrimario; document.getElementById("gen-color-text").value = branding.colorPrimario; }
  if (branding.velocidadVoz) { document.getElementById("gen-speed").value = branding.velocidadVoz; document.getElementById("gen-speed-val").textContent = branding.velocidadVoz; }
  if (branding.estabilidadVoz) { document.getElementById("gen-stability").value = branding.estabilidadVoz; document.getElementById("gen-stability-val").textContent = branding.estabilidadVoz; }

  const voices = await fetch(`${API}/api/voices`).then(r => r.json()).catch(() => []);
  const vSel = document.getElementById("gen-voice");
  vSel.innerHTML = `<option value="">— Usar voz del branding —</option>` +
    voices.map(v => `<option value="${v.id}">${v.nombre}</option>`).join("");
  if (branding.voiceId) vSel.value = branding.voiceId;

  document.getElementById("gen-bg").oninput = function() { document.getElementById("gen-bg-text").value = this.value; };
  document.getElementById("gen-color").oninput = function() { document.getElementById("gen-color-text").value = this.value; };
}

document.getElementById("gen-template").addEventListener("change", async function() {
  const id = this.value;
  const preview = document.getElementById("template-preview");
  const scenesDiv = document.getElementById("template-scenes");
  if (!id) { preview.style.display = "none"; return; }
  const t = await fetch(`${API}/api/templates/${id}`).then(r => r.json()).catch(() => null);
  if (!t) return;
  preview.style.display = "block";
  scenesDiv.innerHTML = t.escenas.map((e, i) =>
    `<div style="margin-bottom:8px"><strong style="color:var(--primary)">Escena ${i+1}</strong> (${e.duracion}s): ${e.texto}</div>`
  ).join("");
});

async function generarReel() {
  const templateId = document.getElementById("gen-template").value;
  if (!templateId) { toast("Selecciona un template primero", "error"); return; }

  const config = {
    voiceId: document.getElementById("gen-voice").value || undefined,
    velocidadVoz: parseFloat(document.getElementById("gen-speed").value),
    estabilidadVoz: parseFloat(document.getElementById("gen-stability").value),
    colorFondo: document.getElementById("gen-bg-text").value,
    colorPrimario: document.getElementById("gen-color-text").value,
    fuente: document.getElementById("gen-font").value || undefined,
    // Incluir config de IA si fue configurado
    ...(window._aiConfig || {}),
  };

  const btn = document.getElementById("btn-generate");
  btn.disabled = true;
  btn.textContent = "Generando...";

  const result = await fetch(`${API}/api/reels/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ templateId, config }),
  }).then(r => r.json()).catch(e => ({ error: e.message }));

  if (result.error) {
    toast(result.error, "error");
    btn.disabled = false; btn.textContent = "⚡ Generar Reel";
    return;
  }

  currentReelId = result.reelId;
  document.getElementById("gen-progress").style.display = "block";
  toast("¡Generación iniciada!");

  genPollInterval = setInterval(async () => {
    const status = await fetch(`${API}/api/reels/${currentReelId}/status`).then(r => r.json()).catch(() => null);
    if (!status) return;

    document.getElementById("gen-pct").textContent = `${status.progreso}%`;
    document.getElementById("gen-prog-fill").style.width = `${status.progreso}%`;

    const msgs = { pendiente: "En cola...", procesando: "Generando voz e imágenes...", listo: "¡Listo!", error: "Error" };
    document.getElementById("gen-status-text").textContent = msgs[status.status] || status.status;

    if (status.status === "listo") {
      clearInterval(genPollInterval);
      btn.disabled = false; btn.textContent = "⚡ Generar Reel";
      toast("¡Reel completado! Revisa el Dashboard");
    } else if (status.status === "error") {
      clearInterval(genPollInterval);
      btn.disabled = false; btn.textContent = "⚡ Generar Reel";
      toast(status.errorMsg || "Error en la generación", "error");
    }
  }, 3000);
}

// ── Templates ─────────────────────────────────────────────────
let editingTemplateId = null;

async function loadTemplates() {
  const templates = await fetch(`${API}/api/templates`).then(r => r.json()).catch(() => []);
  const container = document.getElementById("templates-list");

  if (!templates.length) {
    container.innerHTML = `<div class="empty-state"><div class="icon">📋</div>No hay templates. Crea el primero.</div>`;
    return;
  }

  container.innerHTML = templates.map(t => `
    <div class="card" style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <strong>${t.nombre}</strong>
          ${t.creadoPorIA ? '<span style="background:var(--accent);color:#fff;padding:1px 7px;border-radius:20px;font-size:10px;margin-left:6px">🤖 IA</span>' : ''}
          <span style="margin-left:8px;font-size:12px;color:var(--text-dim)">${t.categoria} · ${t.escenas?.length || 0} escenas</span>
        </div>
        <div class="actions-row">
          <button class="btn btn-secondary btn-sm" onclick="editTemplate('${t._id}')">✏ Editar</button>
          <button class="btn btn-primary btn-sm" onclick="useTemplate('${t._id}')">⚡ Usar</button>
          <button class="btn btn-danger btn-sm" onclick="deleteTemplate('${t._id}')">🗑</button>
        </div>
      </div>
      <div style="margin-top:12px;display:flex;flex-direction:column;gap:4px">
        ${t.escenas?.map((e,i) => `<div style="font-size:13px;color:var(--text-dim)"><span style="color:var(--primary);font-weight:600">E${i+1}</span> (${e.duracion}s): ${e.texto?.substring(0,80)}${e.texto?.length > 80 ? '...' : ''}</div>`).join("") || ""}
      </div>
    </div>
  `).join("");
}

function showTemplateEditor(template = null) {
  editingTemplateId = template?._id || null;
  document.getElementById("editor-title").textContent = template ? "Editar Template" : "Nuevo Template";
  document.getElementById("t-nombre").value = template?.nombre || "";
  document.getElementById("t-categoria").value = template?.categoria || "viajes";
  document.getElementById("t-cta").value = template?.cta?.texto || "";
  document.getElementById("t-cta-sub").value = template?.cta?.subTexto || "";

  const scenesEditor = document.getElementById("scenes-editor");
  scenesEditor.innerHTML = "";
  const escenas = template?.escenas || [{ texto: "", duracion: 10, promptImagen: "", pexelsQuery: "" }];
  escenas.forEach((e, i) => addScene(e, i));

  document.getElementById("template-editor").style.display = "block";
  document.getElementById("template-editor").scrollIntoView({ behavior: "smooth" });
}

function addScene(data = {}, index = null) {
  const container = document.getElementById("scenes-editor");
  const i = index ?? container.children.length;
  const div = document.createElement("div");
  div.className = "scene-item";
  div.dataset.index = i;
  div.innerHTML = `
    <div class="scene-header">
      <span class="scene-num">ESCENA ${i + 1}</span>
      <button class="btn btn-danger btn-sm" onclick="this.closest('.scene-item').remove();renumberScenes()">✕ Quitar</button>
    </div>
    <div class="grid-2">
      <div class="field">
        <label>Texto (narración)</label>
        <textarea class="s-texto" rows="3" placeholder="Lo que dirá la voz en off...">${data.texto || ""}</textarea>
      </div>
      <div class="field">
        <label>Duración (segundos)</label>
        <input type="number" class="s-duracion" min="5" max="30" value="${data.duracion || 10}" />
      </div>
    </div>
    <div class="field">
      <label>Prompt de imagen (para IA)</label>
      <input type="text" class="s-prompt" placeholder="Ej: Madrid skyline at golden hour, cinematic..." value="${data.promptImagen || ""}" />
    </div>
    <div class="field">
      <label>Búsqueda Pexels (fallback)</label>
      <input type="text" class="s-pexels" placeholder="Ej: Madrid cityscape golden hour" value="${data.pexelsQuery || ""}" />
    </div>
  `;
  container.appendChild(div);
}

function renumberScenes() {
  document.querySelectorAll(".scene-item").forEach((el, i) => {
    el.dataset.index = i;
    el.querySelector(".scene-num").textContent = `ESCENA ${i + 1}`;
  });
}

async function saveTemplate() {
  const nombre = document.getElementById("t-nombre").value.trim();
  if (!nombre) { toast("Escribe el nombre del template", "error"); return; }

  const escenas = [...document.querySelectorAll(".scene-item")].map(el => ({
    texto: el.querySelector(".s-texto").value,
    duracion: parseInt(el.querySelector(".s-duracion").value) || 10,
    promptImagen: el.querySelector(".s-prompt").value,
    pexelsQuery: el.querySelector(".s-pexels").value,
  }));

  const body = {
    nombre,
    categoria: document.getElementById("t-categoria").value,
    escenas,
    cta: {
      texto: document.getElementById("t-cta").value,
      subTexto: document.getElementById("t-cta-sub").value,
    },
  };

  const url = editingTemplateId ? `${API}/api/templates/${editingTemplateId}` : `${API}/api/templates`;
  const method = editingTemplateId ? "PUT" : "POST";

  await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  document.getElementById("template-editor").style.display = "none";
  toast("Template guardado");
  loadTemplates();
}

async function editTemplate(id) {
  const t = await fetch(`${API}/api/templates/${id}`).then(r => r.json());
  showTemplateEditor(t);
}

async function deleteTemplate(id) {
  if (!confirm("¿Eliminar este template?")) return;
  await fetch(`${API}/api/templates/${id}`, { method: "DELETE" });
  toast("Template eliminado");
  loadTemplates();
}

function useTemplate(id) {
  showPage("generate");
  setTimeout(() => {
    document.getElementById("gen-template").value = id;
    document.getElementById("gen-template").dispatchEvent(new Event("change"));
  }, 100);
}

// ── Branding ──────────────────────────────────────────────────
async function subirLogo(input) {
  const file = input.files[0];
  if (!file) return;
  const status = document.getElementById("b-logo-status");
  status.textContent = "Subiendo...";
  const form = new FormData();
  form.append("logo", file);
  const res = await fetch(`${API}/api/branding/logo`, { method: "POST", body: form }).then(r => r.json()).catch(e => ({ error: e.message }));
  if (res.ok) {
    document.getElementById("b-logo-preview").src = res.logoUrl;
    document.getElementById("b-logo-preview").style.display = "block";
    status.textContent = "✅ Logo guardado";
    toast("Logo subido correctamente");
  } else {
    status.textContent = "❌ Error al subir";
    toast(res.error || "Error al subir logo", "error");
  }
}

async function loadBranding() {
  const b = await fetch(`${API}/api/branding`).then(r => r.json()).catch(() => ({}));
  document.getElementById("b-agencia").value = b.agencia || "";
  if (b.logoUrl) {
    document.getElementById("b-logo-preview").src = b.logoUrl;
    document.getElementById("b-logo-preview").style.display = "block";
    document.getElementById("b-logo-status").textContent = "Logo cargado";
  }
  document.getElementById("b-fuente").value = b.fuente || "Arial Black";
  document.getElementById("b-fondo").value = b.colorFondo || "#0a0a1a";
  document.getElementById("b-fondo-text").value = b.colorFondo || "#0a0a1a";
  document.getElementById("b-primario").value = b.colorPrimario || "#f0c040";
  document.getElementById("b-primario-text").value = b.colorPrimario || "#f0c040";
  document.getElementById("b-cta").value = b.ctaTexto || "";
  document.getElementById("b-cta-sub").value = b.ctaSubTexto || "";
  document.getElementById("b-voice").value = b.voiceId || "";
  document.getElementById("b-speed").value = b.velocidadVoz || 0.9;
  document.getElementById("b-speed-val").textContent = b.velocidadVoz || 0.9;
  document.getElementById("b-stability").value = b.estabilidadVoz || 0.6;
  document.getElementById("b-stability-val").textContent = b.estabilidadVoz || 0.6;

  document.getElementById("agencyName").textContent = b.agencia || "Mi Agencia";
}

async function saveBranding() {
  const body = {
    agencia: document.getElementById("b-agencia").value,
    fuente: document.getElementById("b-fuente").value,
    colorFondo: document.getElementById("b-fondo-text").value,
    colorPrimario: document.getElementById("b-primario-text").value,
    ctaTexto: document.getElementById("b-cta").value,
    ctaSubTexto: document.getElementById("b-cta-sub").value,
    voiceId: document.getElementById("b-voice").value,
    velocidadVoz: parseFloat(document.getElementById("b-speed").value),
    estabilidadVoz: parseFloat(document.getElementById("b-stability").value),
  };
  await fetch(`${API}/api/branding`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  document.getElementById("agencyName").textContent = body.agencia || "Mi Agencia";
  toast("Branding guardado");
}

// ── Voices ────────────────────────────────────────────────────
async function loadVoices() {
  const container = document.getElementById("voices-container");
  const branding = await fetch(`${API}/api/branding`).then(r => r.json()).catch(() => ({}));
  const voices = await fetch(`${API}/api/voices`).then(r => r.json()).catch(() => []);

  if (!voices.length) {
    container.innerHTML = `<div class="card"><p style="color:var(--text-dim)">No se pudieron cargar las voces. Verifica tu API key de ElevenLabs.</p></div>`;
    return;
  }

  const selectedId = branding.voiceId;

  container.innerHTML = `
    <div class="tabs">
      <div class="tab active" onclick="filterVoices('all',this)">🌐 Todas</div>
      <div class="tab" onclick="filterVoices('es',this)">🇪🇸 Español</div>
      <div class="tab" onclick="filterVoices('en',this)">🇺🇸 English</div>
      <div class="tab" onclick="filterVoices('female',this)">♀ Mujer</div>
      <div class="tab" onclick="filterVoices('male',this)">♂ Hombre</div>
    </div>
    <div class="voice-grid" id="voice-grid">
      ${voices.map(v => {
        const lang = v.idioma || 'en';
        const gender = v.labels?.gender || '';
        const flag = lang.startsWith('es') ? '🇪🇸' : lang.startsWith('pt') ? '🇧🇷' : lang.startsWith('fr') ? '🇫🇷' : '🇺🇸';
        return `
        <div class="voice-card ${v.id === selectedId ? 'selected' : ''}"
          data-id="${v.id}" data-lang="${lang}" data-gender="${gender}">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div class="vname">${v.nombre}</div>
            <span style="font-size:18px">${flag}</span>
          </div>
          <div class="vlabel">${gender} ${v.labels?.accent ? '· ' + v.labels.accent : ''} ${v.labels?.age ? '· ' + v.labels.age : ''}</div>
          <div class="vlabel" style="margin-top:2px;color:var(--text-dim)">${v.categoria || ''}</div>
          <div style="display:flex;gap:6px;margin-top:10px">
            ${v.previewUrl ? `<button class="btn btn-secondary btn-sm" style="flex:1" onclick="previewVoz('${v.previewUrl}', this)">▶ Escuchar</button>` : ''}
            <button class="btn btn-primary btn-sm" style="flex:1" onclick="selectVoice('${v.id}','${v.nombre}',this.closest('.voice-card'))">✓ Usar</button>
          </div>
        </div>`;
      }).join("")}
    </div>
  `;
}

let currentAudio = null;

function previewVoz(url, btn) {
  // Detener audio anterior
  if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
  document.querySelectorAll(".btn-preview-playing").forEach(b => {
    b.textContent = "▶ Escuchar"; b.classList.remove("btn-preview-playing");
  });

  const audio = new Audio(url);
  currentAudio = audio;
  btn.textContent = "⏹ Detener";
  btn.classList.add("btn-preview-playing");

  audio.play().catch(() => toast("No se pudo reproducir el audio", "error"));
  audio.onended = () => { btn.textContent = "▶ Escuchar"; btn.classList.remove("btn-preview-playing"); };
}

function filterVoices(filter, tabEl) {
  document.querySelectorAll(".tabs .tab").forEach(t => t.classList.remove("active"));
  tabEl.classList.add("active");
  document.querySelectorAll(".voice-card").forEach(c => {
    const lang = c.dataset.lang || "en";
    const gender = c.dataset.gender || "";
    let show = false;
    if (filter === "all") show = true;
    else if (filter === "es") show = lang.startsWith("es");
    else if (filter === "en") show = lang.startsWith("en");
    else if (filter === "female") show = gender === "female";
    else if (filter === "male") show = gender === "male";
    c.style.display = show ? "" : "none";
  });
}

async function selectVoice(id, nombre, el) {
  document.querySelectorAll(".voice-card").forEach(c => c.classList.remove("selected"));
  el.classList.add("selected");
  await fetch(`${API}/api/branding`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ voiceId: id }),
  });
  toast(`Voz "${nombre}" seleccionada como predeterminada`);
}

// ── Seed templates ────────────────────────────────────────────
async function cargarTemplatesBase() {
  const btn = document.getElementById("btn-seed");
  if (!confirm("¿Cargar los 7 templates base? Esto reemplazará los templates existentes.")) return;
  btn.disabled = true;
  btn.textContent = "⏳ Cargando...";
  try {
    const res = await fetch(`${API}/api/seed`, { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      toast(`${data.templates} templates cargados correctamente`);
      loadTemplates();
    } else {
      toast(data.error || "Error al cargar templates", "error");
    }
  } catch (err) {
    toast("Error de conexión", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "📦 Cargar 7 templates base";
  }
}

// ── Posts & Carrusel ─────────────────────────────────────────
const postsHistory = [];

async function loadPostsPage() {
  const sel = document.getElementById("post-template");
  if (sel && sel.options.length <= 1) {
    const templates = await fetch(`${API}/api/templates`).then(r => r.json()).catch(() => []);
    templates.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t._id;
      opt.textContent = `${t.nombre} (${t.escenas?.length || 0} slides)`;
      sel.appendChild(opt);
    });
  }
  renderPostsHistory();
}

function updateTipoPost() {
  const tipo = document.querySelector('input[name="post-tipo"]:checked')?.value;
  document.getElementById("tipo-carrusel-label").style.borderColor = tipo === "carrusel" ? "var(--accent)" : "var(--border)";
  document.getElementById("tipo-post-label").style.borderColor = tipo === "post" ? "var(--accent)" : "var(--border)";
}

async function generarPost() {
  const templateId = document.getElementById("post-template").value;
  if (!templateId) return toast("Selecciona un template", "error");

  const tipo = document.querySelector('input[name="post-tipo"]:checked')?.value || "carrusel";
  const colorFondo = document.getElementById("post-bg").value;
  const colorPrimario = document.getElementById("post-color").value;

  document.getElementById("post-progress").style.display = "block";
  document.getElementById("post-result").style.display = "none";
  document.getElementById("post-status-text").textContent = "Iniciando generación...";
  document.getElementById("post-prog-fill").style.width = "10%";

  try {
    const res = await fetch(`${API}/api/posts/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId, tipo, config: { colorFondo, colorPrimario } }),
    }).then(r => r.json());

    if (!res.ok) throw new Error(res.error || "Error al generar");

    const { jobId, total } = res;
    document.getElementById("post-status-text").textContent = `Renderizando ${total} slide(s)...`;

    // Polling de estado
    await pollPostStatus(jobId, total);

  } catch (err) {
    toast(err.message, "error");
    document.getElementById("post-progress").style.display = "none";
  }
}

async function pollPostStatus(jobId, total) {
  const maxEspera = 300; // 5 min
  let intentos = 0;
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      intentos++;
      if (intentos > maxEspera) {
        clearInterval(interval);
        reject(new Error("Tiempo de espera agotado"));
        return;
      }
      try {
        const status = await fetch(`${API}/api/posts/${jobId}/status`).then(r => r.json());
        const pct = status.listo ? 100 : Math.min(10 + (status.slides / total) * 85, 95);
        document.getElementById("post-prog-fill").style.width = `${pct}%`;
        document.getElementById("post-status-text").textContent = status.listo
          ? "✅ Listo"
          : `Renderizando slide ${status.slides}/${total}...`;

        if (status.listo && status.zipUrl) {
          clearInterval(interval);
          document.getElementById("post-progress").style.display = "none";
          document.getElementById("post-result").style.display = "block";
          document.getElementById("post-download-btn").href = status.zipUrl;
          postsHistory.unshift({ jobId, zipUrl: status.zipUrl, slides: total, fecha: new Date() });
          renderPostsHistory();
          toast("Imágenes listas para descargar");
          resolve();
        }
      } catch (e) { /* continúa polling */ }
    }, 3000);
  });
}

function renderPostsHistory() {
  const el = document.getElementById("posts-history");
  if (!postsHistory.length) {
    el.innerHTML = `<div class="empty-state"><div class="icon">🖼️</div>No hay posts generados todavía</div>`;
    return;
  }
  el.innerHTML = postsHistory.map(p => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid var(--border)">
      <div>
        <span style="font-weight:600">📦 ${p.slides} slides</span>
        <span style="color:var(--text-dim);font-size:12px;margin-left:12px">${new Date(p.fecha).toLocaleString("es")}</span>
      </div>
      <a href="${p.zipUrl}" download class="btn btn-secondary btn-sm">⬇ ZIP</a>
    </div>
  `).join("");
}

// ── Init ──────────────────────────────────────────────────────
loadDashboard();
