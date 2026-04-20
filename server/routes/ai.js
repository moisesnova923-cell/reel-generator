import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import Template from "../models/Template.js";

const router = Router();

router.post("/config", async (req, res) => {
  try {
    const { descripcion, voces = [] } = req.body;
    if (!descripcion?.trim()) return res.status(400).json({ error: "Describe el reel" });

    const templates = await Template.find({}, "nombre categoria _id");
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const systemPrompt = `Eres un experto en producción de reels de Instagram para Legacy Travel, una agencia de viajes premium.

Analiza la descripción del usuario y devuelve configuración JSON para generar el reel perfecto.

TEMPLATES DISPONIBLES:
${templates.map(t => `- ID: "${t._id}" | Nombre: "${t.nombre}" | Categoría: "${t.categoria}"`).join("\n")}

VOCES DISPONIBLES (elige la más apropiada):
${voces.slice(0, 20).map(v => `- ID: "${v.id}" | ${v.nombre} | género: ${v.genero} | uso: ${v.labels?.use_case || ""} | estilo: ${v.labels?.descriptive || ""} | acento: ${v.labels?.accent || ""}`).join("\n")}

REGLAS DE DECISIÓN:
- "voz cálida/emotiva/femenina/acogedora" → busca female + descriptive: warm/friendly/upbeat/professional
- "voz enérgica/dinámica" → descriptive: hyped/confident/sassy
- "voz profesional/seria" → descriptive: professional/formal/classy
- "transición rápida/ágil" → duracionEscena: 6
- "transición normal" → duracionEscena: 10
- "transición lenta/cinematográfica" → duracionEscena: 14
- "ciudades/urbano/arquitectura" → estiloImagen: "ciudad"
- "paisajes/naturaleza/playa" → estiloImagen: "paisaje"
- "interior/hotel/restaurante" → estiloImagen: "interior"
- "subtítulos fluidos/sin caja/palabras/animados" → estiloSubtitulo: "fluido"
- "subtítulos normales/en caja" → estiloSubtitulo: "caja"
- "animado/dinámico/interactivo/moderno" → estiloTransicion: "dinamico"
- "elegante/suave/cinematográfico" → estiloTransicion: "elegante"
- "con logo/branding" → incluirLogo: true
- colores Legacy Travel: fondo #021024, primario #5483B3, dorado #E8C67A
- si pide "dorado/gold/premium" → colorPrimario: "#E8C67A"

DEVUELVE SOLO JSON VÁLIDO, sin explicaciones fuera del JSON:
{
  "templateId": "id exacto del template",
  "voiceId": "id exacto de la voz",
  "colorFondo": "#021024",
  "colorPrimario": "#5483B3",
  "duracionEscena": 10,
  "estiloImagen": "ciudad",
  "estiloSubtitulo": "fluido",
  "estiloTransicion": "dinamico",
  "incluirLogo": true,
  "razonamiento": "Elegí el template X porque... la voz Y porque... colores Z porque..."
}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: descripcion }],
    });

    const texto = message.content[0].text.trim();
    const jsonMatch = texto.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No se pudo parsear respuesta de IA");

    const config = JSON.parse(jsonMatch[0]);
    res.json({ ok: true, config });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
