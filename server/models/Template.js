import mongoose from "mongoose";

const escenaSchema = new mongoose.Schema({
  texto: String,
  duracion: { type: Number, default: 10 },
  promptImagen: String,
  pexelsQuery: String,
});

const templateSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  categoria: { type: String, default: "viajes" },
  escenas: [escenaSchema],
  cta: {
    texto: String,
    subTexto: String,
  },
  estiloOverride: {
    colorFondo: String,
    colorPrimario: String,
    fuente: String,
  },
  activo: { type: Boolean, default: true },
  creadoPorIA: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Template", templateSchema);
