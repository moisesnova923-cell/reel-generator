import mongoose from "mongoose";

const brandingSchema = new mongoose.Schema({
  agencia: { type: String, default: "Mi Agencia" },
  colorFondo: { type: String, default: "#0a0a1a" },
  colorPrimario: { type: String, default: "#f0c040" },
  colorTexto: { type: String, default: "#ffffff" },
  fuente: { type: String, default: "Arial Black" },
  logoUrl: { type: String, default: "" },
  voiceId: { type: String, default: "EXAVITQu4vr4xnSDxMaL" },
  velocidadVoz: { type: Number, default: 0.9 },
  estabilidadVoz: { type: Number, default: 0.6 },
  similarityVoz: { type: Number, default: 0.8 },
  ctaTexto: { type: String, default: "✈ ESCRÍBENOS AHORA" },
  ctaSubTexto: { type: String, default: "Cupos limitados · Tarifas desde $650" },
}, { timestamps: true });

export default mongoose.model("Branding", brandingSchema);
