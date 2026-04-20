import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import Template from "../models/Template.js";

const router = Router();
const client = () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Paso 1: Decidir config y si crear template nuevo ──────────
router.post("/config", async (req, res) => {
  try {
    const { descripcion, voces = [] } = req.body;
    if (!descripcion?.trim()) return res.status(400).json({ error: "Describe el reel" });

    const templates = await Template.find({}, "nombre categoria _id");

    const systemPrompt = `Eres un experto en producción de reels de Instagram para Legacy Travel, agencia de viajes premium latinoamericana.

Analiza la descripción y decide si algún template existente se adapta O si hay que crear uno nuevo.

TEMPLATES EXISTENTES:
${templates.map(t => `- ID: "${t._id}" | Nombre: "${t.nombre}" | Categoría: "${t.categoria}"`).join("\n")}

VOCES DISPONIBLES:
${voces.slice(0, 20).map(v => `- ID: "${v.id}" | ${v.nombre} | género: ${v.genero} | uso: ${v.labels?.use_case || ""} | estilo: ${v.labels?.descriptive || ""} | acento: ${v.labels?.accent || ""}`).join("\n")}

REGLAS:
- Si ningún template existente encaja bien con lo que pide → templateId: "CREAR_NUEVO"
- "voz cálida/emotiva/femenina" → female + descriptive: warm/friendly/upbeat/professional
- "voz enérgica" → descriptive: hyped/confident/sassy
- "rápido" → duracionEscena: 6 | "normal" → 10 | "lento/cinematográfico" → 14
- "ciudades" → estiloImagen: "ciudad" | "paisajes" → "paisaje" | "hotel/interior" → "interior"
- "subtítulos fluidos/animados/palabras" → estiloSubtitulo: "fluido"
- "animado/dinámico" → estiloTransicion: "dinamico"
- colores: fondo #021024, primario #5483B3, dorado/premium → #E8C67A

DEVUELVE SOLO JSON:
{
  "templateId": "id existente O 'CREAR_NUEVO'",
  "crearTemplate": false,
  "nombreTemplate": "nombre si se crea nuevo",
  "categoriaTemplate": "migratorio|tour|viajes|guia|financiamiento",
  "voiceId": "id de voz",
  "colorFondo": "#021024",
  "colorPrimario": "#5483B3",
  "duracionEscena": 10,
  "estiloImagen": "ciudad",
  "estiloSubtitulo": "fluido",
  "estiloTransicion": "dinamico",
  "incluirLogo": true,
  "razonamiento": "explicación breve"
}`;

    const msg = await client().messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: descripcion }],
    });

    const jsonMatch = msg.content[0].text.trim().match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("IA no devolvió JSON válido");
    const config = JSON.parse(jsonMatch[0]);

    // Si hay que crear template, generarlo ahora
    if (config.templateId === "CREAR_NUEVO" || config.crearTemplate) {
      const nuevoTemplate = await crearTemplateIA(descripcion, config);
      config.templateId = nuevoTemplate._id.toString();
      config.templateCreado = true;
      config.nombreTemplateCreado = nuevoTemplate.nombre;
    }

    res.json({ ok: true, config });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Crear template completo con Claude ────────────────────────
async function crearTemplateIA(descripcion, config) {
  const duracion = config.duracionEscena || 10;
  const estiloImg = config.estiloImagen || "ciudad";

  const prompt = `Eres un guionista experto en reels de Instagram para Legacy Travel, agencia de viajes.

El usuario quiere este reel: "${descripcion}"

Crea un template completo con 4-5 escenas. Cada escena debe tener un texto narrado en voz off en español latino (máx 25 palabras, impactante, directo), un prompt para generar imagen con IA (en inglés, estilo ${estiloImg}, vertical 9:16, cinematic) y una query de búsqueda para Pexels.

DEVUELVE SOLO este JSON:
{
  "nombre": "nombre del template",
  "categoria": "${config.categoriaTemplate || "viajes"}",
  "escenas": [
    {
      "texto": "texto narrado en español, máx 25 palabras, sin puntuación exagerada",
      "duracion": ${duracion},
      "promptImagen": "detailed English image prompt for Vertex AI, travel photography style, vertical 9:16, cinematic",
      "pexelsQuery": "short english search query for Pexels"
    }
  ],
  "cta": {
    "texto": "✈ TEXTO CTA EN MAYÚSCULAS",
    "subTexto": "subtexto corto · con precio si aplica"
  }
}`;

  const msg = await client().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const jsonMatch = msg.content[0].text.trim().match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("IA no pudo crear el template");

  const tData = JSON.parse(jsonMatch[0]);

  // Guardar en MongoDB con el campo correcto (escenas)
  const template = await Template.create({
    nombre: tData.nombre || config.nombreTemplate || "Template IA",
    categoria: tData.categoria || config.categoriaTemplate || "viajes",
    escenas: tData.escenas.map(e => ({
      texto: e.texto,
      duracion: e.duracion || duracion,
      promptImagen: e.promptImagen,
      pexelsQuery: e.pexelsQuery,
    })),
    cta: tData.cta || { texto: "✈ ESCRÍBENOS AHORA", subTexto: "Tu destino está sobre el horizonte" },
    estiloOverride: {
      colorFondo: config.colorFondo || "#021024",
      colorPrimario: config.colorPrimario || "#5483B3",
    },
    creadoPorIA: true,
  });

  console.log(`✅ Template IA creado: "${template.nombre}" (${template.escenas.length} escenas)`);
  return template;
}

export default router;
