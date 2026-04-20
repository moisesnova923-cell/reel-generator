import mongoose from "mongoose";
import "dotenv/config";
import Template from "./models/Template.js";
import Branding from "./models/Branding.js";

export async function runSeed() {
  const conectar = mongoose.connection.readyState === 0;
  if (conectar) await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Seed iniciado");

await Template.deleteMany({});

const templates = [
  {
    nombre: "Paquete Migratorio España",
    categoria: "migratorio",
    escenas: [
      { texto: "Viajar a España nunca fue tan fácil. Con nuestro paquete migratorio tienes todo lo que necesitas para entrar sin problemas.", duracion: 10, promptImagen: "Aerial view of Madrid Spain skyline at golden hour, Almudena Cathedral, warm cinematic light, vertical 9:16", pexelsQuery: "Madrid Spain skyline golden hour" },
      { texto: "Seguro de viaje, reserva de hotel y boleto de retorno incluidos. Todo verificable, completamente legal.", duracion: 10, promptImagen: "Elegant hotel lobby in Madrid Spain, warm lighting, luxury interior, travel concept, vertical", pexelsQuery: "luxury hotel lobby Madrid Spain" },
      { texto: "Más de 28 mil pasajeros ya viajaron con nosotros. Tu seguridad y tranquilidad son nuestra prioridad.", duracion: 10, promptImagen: "Modern international airport terminal interior, sunlight through large windows, warm golden tones, vertical", pexelsQuery: "airport terminal modern sunlight" },
      { texto: "Las tarifas cambian cada 12 horas. Escríbenos ahora y asegura tu cupo antes de que suba el precio.", duracion: 10, promptImagen: "Passport and boarding pass on dark elegant surface, golden light, luxury travel concept, vertical", pexelsQuery: "passport boarding pass luxury dark" },
    ],
    cta: { texto: "✈ ESCRÍBENOS AHORA", subTexto: "Cupos limitados · Tarifas desde $650" },
    estiloOverride: { colorFondo: "#0a0a1a", colorPrimario: "#f0c040" },
  },
  {
    nombre: "Tour Europa 15 Días",
    categoria: "tour",
    escenas: [
      { texto: "15 días recorriendo los mejores destinos de Europa. Desde 3 mil 600 dólares con todo incluido.", duracion: 10, promptImagen: "Eiffel Tower Paris at night with golden lights, romantic atmosphere, vertical cinematic photography", pexelsQuery: "Eiffel Tower Paris night romantic" },
      { texto: "Hotel, vuelos, traslados y guía turístico en español. Tú solo disfruta el viaje.", duracion: 10, promptImagen: "Luxurious European hotel room with window view of city, warm lighting, travel luxury, vertical", pexelsQuery: "luxury hotel room Europe view" },
      { texto: "Grupos pequeños, atención personalizada. Tu experiencia de viaje perfecta comienza aquí.", duracion: 10, promptImagen: "Beautiful Barcelona Spain street architecture, colorful buildings, Gaudi style, sunny day, vertical", pexelsQuery: "Barcelona Spain architecture colorful" },
      { texto: "Plazas limitadas para el próximo tour. Reserva hoy con solo el 30% de anticipo.", duracion: 10, promptImagen: "Colosseum Rome Italy at golden hour, ancient architecture, dramatic sky, vertical travel photography", pexelsQuery: "Colosseum Rome Italy golden hour" },
    ],
    cta: { texto: "📅 RESERVA TU PLAZA", subTexto: "Solo 30% de anticipo · Grupos desde 2 personas" },
    estiloOverride: { colorFondo: "#0d1a0d", colorPrimario: "#40c070" },
  },
  {
    nombre: "Top 5 Destinos Schengen",
    categoria: "viajes",
    escenas: [
      { texto: "¿Sabías que con un solo visado puedes visitar 27 países europeos? Te mostramos los 5 destinos que no puedes perderte.", duracion: 10, promptImagen: "Europe map with major landmarks illustrated, Paris London Rome Barcelona Amsterdam, artistic travel poster style, vertical", pexelsQuery: "Europe travel landmarks collage" },
      { texto: "Madrid y Barcelona: arquitectura, gastronomía y cultura sin igual. La puerta de entrada perfecta a Europa.", duracion: 10, promptImagen: "Sagrada Familia Barcelona Spain at sunset, dramatic sky, architectural marvel, vertical cinematic", pexelsQuery: "Sagrada Familia Barcelona sunset" },
      { texto: "París y Amsterdam: el romanticismo y los canales más famosos del mundo te esperan.", duracion: 10, promptImagen: "Amsterdam canal houses reflection in water at dusk, golden lights, romantic atmosphere, vertical", pexelsQuery: "Amsterdam canals night lights" },
      { texto: "Roma: historia viva en cada esquina. 28 siglos de arte y arquitectura al alcance de tu mano.", duracion: 10, promptImagen: "Trevi Fountain Rome Italy at night, illuminated, baroque architecture, magical atmosphere, vertical", pexelsQuery: "Trevi Fountain Rome night" },
      { texto: "Contáctanos hoy y arma tu itinerario personalizado. Todos los destinos con paquete completo.", duracion: 8, promptImagen: "Airplane flying above clouds at sunset, golden hour, freedom concept, vertical travel photography", pexelsQuery: "airplane clouds sunset golden" },
    ],
    cta: { texto: "🌍 ARMA TU ITINERARIO", subTexto: "Personalizamos tu viaje · Precios desde $1,200" },
    estiloOverride: { colorFondo: "#0a1020", colorPrimario: "#60a0ff" },
  },
  {
    nombre: "Guía del Aeropuerto de Maiquetía",
    categoria: "guia",
    escenas: [
      { texto: "¿Vas a viajar desde Maiquetía? Te damos la guía completa para que todo salga perfecto desde el primer minuto.", duracion: 10, promptImagen: "Modern airport terminal exterior at dawn, aircraft parked, professional travel photography, vertical", pexelsQuery: "airport terminal exterior dawn aircraft" },
      { texto: "Llega con 4 horas de anticipación. Así tienes tiempo para chequeo de maletas, migración y abordar sin estrés.", duracion: 10, promptImagen: "Airport check-in counter with luggage conveyor belt, modern interior, warm lighting, vertical", pexelsQuery: "airport check-in counter luggage" },
      { texto: "En migración venezolana te pedirán pasaporte vigente y tus boletos. Ten todo impreso y en digital.", duracion: 10, promptImagen: "Travel documents passport boarding pass organized neatly on white surface, clean minimal style, vertical", pexelsQuery: "travel documents passport boarding pass organized" },
      { texto: "¿Primera vez viajando? Nuestro equipo te acompaña en todo el proceso vía WhatsApp desde el check-in hasta que abordes.", duracion: 10, promptImagen: "Person walking confidently through bright modern airport corridor with luggage, natural light, vertical", pexelsQuery: "person walking airport corridor luggage" },
    ],
    cta: { texto: "💬 ACOMPAÑAMIENTO GRATIS", subTexto: "Te guiamos paso a paso · WhatsApp 24/7" },
    estiloOverride: { colorFondo: "#0a1520", colorPrimario: "#00c4cc" },
  },
  {
    nombre: "Guía de Escala en Panamá",
    categoria: "guia",
    escenas: [
      { texto: "¿Tu vuelo tiene escala en el aeropuerto de Tocumen en Panamá? No te preocupes, aquí te explicamos todo.", duracion: 10, promptImagen: "Tocumen International Airport Panama interior, modern design, tropical light, vertical travel photography", pexelsQuery: "Panama Tocumen airport interior modern" },
      { texto: "Si tu escala es menor a 12 horas, no necesitas visa de tránsito. Solo sigue las señales hacia tu puerta de conexión.", duracion: 10, promptImagen: "Airport terminal wayfinding signs, directional arrows, modern interior, clean design, vertical", pexelsQuery: "airport signs directions terminal" },
      { texto: "El aeropuerto tiene tiendas, restaurantes y zonas de descanso. Más de 12 mil pasajeros nuestros lo han cruzado sin problemas.", duracion: 10, promptImagen: "Modern airport duty free shopping area, bright lights, luxury stores, travelers, vertical", pexelsQuery: "airport duty free shopping travelers" },
      { texto: "Nuestros asesores están disponibles durante tu escala. Cualquier duda, escríbenos por WhatsApp.", duracion: 10, promptImagen: "Airplane taking off from Panama with tropical landscape below, blue sky, cinematic vertical photography", pexelsQuery: "airplane takeoff tropical landscape" },
    ],
    cta: { texto: "✈ SIN MIEDO A LAS ESCALAS", subTexto: "Te acompañamos en cada paso · Escríbenos" },
    estiloOverride: { colorFondo: "#0f1a0a", colorPrimario: "#90d040" },
  },
  {
    nombre: "Financiamiento de Boletos",
    categoria: "financiamiento",
    escenas: [
      { texto: "¿Quieres viajar pero no tienes el monto completo? Con nuestros planes de financiamiento puedes reservar hoy mismo.", duracion: 10, promptImagen: "Credit card and passport on elegant dark surface, financial travel concept, golden light, vertical", pexelsQuery: "credit card passport travel finance" },
      { texto: "Scalapay en euros: divide tu boleto en 4 cuotas iguales. Pagas la primera hoy y el resto mensualmente.", duracion: 10, promptImagen: "Calendar with payment schedule, financial planning, modern minimal design, dark background, vertical", pexelsQuery: "payment schedule calendar financial planning" },
      { texto: "Financiamiento por aerolínea: paga hasta 33 días antes de tu vuelo. Disponible con Latam, Avianca y más.", duracion: 10, promptImagen: "Airplane silhouette against sunset sky, freedom travel concept, warm golden colors, dramatic vertical", pexelsQuery: "airplane sunset sky freedom" },
      { texto: "Zelle, transferencia, Wise, BBVA Europa, USDT o PayPal. Múltiples formas de pago a tu disposición.", duracion: 10, promptImagen: "Multiple payment method icons on dark screen, digital finance, modern tech concept, vertical", pexelsQuery: "digital payment methods finance technology" },
    ],
    cta: { texto: "💳 FINANCIA TU VIAJE", subTexto: "Desde el 30% de anticipo · Consulta sin compromiso" },
    estiloOverride: { colorFondo: "#1a0a20", colorPrimario: "#c060ff" },
  },
  {
    nombre: "Requisitos para Entrar a España",
    categoria: "migratorio",
    escenas: [
      { texto: "¿Sabes qué documentos necesitas para entrar a España como turista? Te explicamos todo en menos de un minuto.", duracion: 10, promptImagen: "Spain flag waving with blue sky, proud travel destination concept, cinematic vertical photography", pexelsQuery: "Spain flag blue sky travel" },
      { texto: "Necesitas: pasaporte vigente, boleto de ida y vuelta, reserva de hotel verificable y seguro de viaje.", duracion: 10, promptImagen: "Travel documents organized neatly, passport insurance hotel booking, clean flat lay, vertical", pexelsQuery: "travel documents organized flat lay" },
      { texto: "También debes demostrar solvencia económica: 103 euros por día de estancia. Puede ser efectivo o tarjeta.", duracion: 10, promptImagen: "Euro banknotes and coins on elegant dark surface, European currency, travel finance, vertical", pexelsQuery: "euro banknotes coins elegant dark" },
      { texto: "Nosotros te proveemos seguro, hotel y retorno verificables. Así llegas con todo en orden y sin contratiempos.", duracion: 10, promptImagen: "Madrid Puerta del Sol landmark at golden hour, warm atmosphere, Spain tourism, vertical photography", pexelsQuery: "Madrid Puerta del Sol golden hour" },
    ],
    cta: { texto: "📋 REQUISITOS LISTOS EN 24H", subTexto: "Seguro + Hotel + Retorno incluidos" },
    estiloOverride: { colorFondo: "#1a0a0a", colorPrimario: "#ff6040" },
  },
];

for (const t of templates) {
  await Template.create(t);
  console.log(`✅ Template creado: ${t.nombre}`);
}

await Branding.deleteMany({});
await Branding.create({
  agencia: "Legacy Solutions Travel",
  colorFondo: "#0a0a1a",
  colorPrimario: "#f0c040",
  colorTexto: "#ffffff",
  fuente: "Arial Black",
  voiceId: "EXAVITQu4vr4xnSDxMaL",
  velocidadVoz: 0.9,
  estabilidadVoz: 0.65,
  similarityVoz: 0.8,
  ctaTexto: "✈ ESCRÍBENOS AHORA",
  ctaSubTexto: "Cupos limitados · Legacy Solutions Travel",
});
console.log("✅ Branding base creado");

  console.log("\n🎉 Seed completo — 7 templates cargados en MongoDB");
  if (conectar) await mongoose.disconnect();
  return { ok: true, templates: templates.length };
}

// Ejecutar directamente si se llama como script
if (process.argv[1].endsWith("seed.js")) {
  runSeed().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}
