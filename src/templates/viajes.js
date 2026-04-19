// Template base para reels de agencia de viajes
// Personaliza el texto, prompts de imagen y estilo

export const templateViajesMigratorio = {
  id: "viaje-migratorio-01",
  titulo: "¿Listo para viajar a Europa?",
  escenas: [
    {
      texto: "Viajar a España nunca fue tan fácil. Con nuestro paquete migratorio completo tienes todo lo que necesitas.",
      duracion: 10,
      promptImagen: "Airplane window view with beautiful sunset clouds, golden hour light, cinematic style, travel photography",
    },
    {
      texto: "Seguro de viaje, reserva de hotel y boleto de retorno incluidos. Todo verificable y completamente legal.",
      duracion: 10,
      promptImagen: "Madrid Spain beautiful cityscape at golden hour, Puerta del Sol, warm colors, professional travel photography",
    },
    {
      texto: "Más de 28 mil pasajeros ya viajaron con nosotros. Tu seguridad es nuestra prioridad.",
      duracion: 10,
      promptImagen: "Happy Venezuelan family at airport terminal, luggage, smiling, travel excitement, warm lighting",
    },
    {
      texto: "Las tarifas cambian cada 12 horas. Escríbenos ahora y asegura tu cupo antes de que suba el precio.",
      duracion: 10,
      promptImagen: "Passport, plane ticket, and travel documents on elegant dark background, luxury travel concept",
    },
  ],
  cta: {
    texto: "✈ ESCRÍBENOS AHORA",
    subTexto: "Cupos limitados · Tarifas desde $650",
  },
  estilo: {
    colorFondo: "#0a0a1a",
    colorPrimario: "#f0c040",
    fuente: "Arial Black",
  },
};

export const templateTour = {
  id: "tour-europa-01",
  titulo: "Tour Europa 15 días",
  escenas: [
    {
      texto: "15 días recorriendo los mejores destinos de Europa. Desde $3,600 con todo incluido.",
      duracion: 10,
      promptImagen: "Eiffel Tower Paris at night with golden lights, romantic atmosphere, professional photography",
    },
    {
      texto: "Hotel, vuelos, traslados y guía turístico en español. Tú solo disfruta el viaje.",
      duracion: 10,
      promptImagen: "Luxurious European hotel lobby with elegant decor, warm lighting, travel luxury",
    },
    {
      texto: "Grupos pequeños, atención personalizada. Tu experiencia de viaje perfecta comienza aquí.",
      duracion: 10,
      promptImagen: "Small travel group exploring Barcelona Spain streets, colorful architecture, happy tourists",
    },
    {
      texto: "Plazas limitadas para el próximo tour. Reserva hoy con solo el 30% de anticipo.",
      duracion: 10,
      promptImagen: "European travel collage: Paris, Rome, Barcelona, Amsterdam, stunning photography",
    },
  ],
  cta: {
    texto: "📅 RESERVA TU PLAZA",
    subTexto: "Solo 30% de anticipo · Grupos desde 2 personas",
  },
  estilo: {
    colorFondo: "#0d1a0d",
    colorPrimario: "#40c070",
    fuente: "Arial Black",
  },
};
