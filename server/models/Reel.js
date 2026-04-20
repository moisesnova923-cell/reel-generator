import mongoose from "mongoose";

const reelSchema = new mongoose.Schema({
  titulo: String,
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: "Template" },
  status: {
    type: String,
    enum: ["pendiente", "procesando", "listo", "error"],
    default: "pendiente",
  },
  progreso: { type: Number, default: 0 },
  videoUrl: String,
  errorMsg: String,
  config: {
    voiceId: String,
    velocidadVoz: Number,
    colorPrimario: String,
    colorFondo: String,
    fuente: String,
  },
  duracionTotal: Number,
}, { timestamps: true });

export default mongoose.model("Reel", reelSchema);
