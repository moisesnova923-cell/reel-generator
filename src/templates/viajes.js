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
      pexelsQuery: "airplane window sunset travel",
    },
    {
      texto: "Seguro de viaje, reserva de hotel y boleto de retorno incluidos. Todo verificable y completamente legal.",
      duracion: 10,
      promptImagen: "Madrid Spain beautiful cityscape at golden hour, Puerta del Sol, warm colors, professional travel photography",
      pexelsQuery: "Madrid Spain cityscape golden hour",
    },
    {
      texto: "Más de 28 mil pasajeros ya viajaron con nosotros. Tu seguridad es nuestra prioridad.",
      duracion: 10,
      promptImagen: "Modern international airport terminal interior, sunlight through windows, luggage conveyor, warm golden tones, vertical travel photography",
      pexelsQuery: "airport terminal modern sunlight",
    },
    {
      texto: "Las tarifas cambian cada 12 horas. Escríbenos ahora y asegura tu cupo antes de que suba el precio.",
      duracion: 10,
      promptImagen: "Passport and boarding pass on dark elegant surface, golden light, luxury travel concept, vertical photography",
      pexelsQuery: "passport boarding pass luxury dark",
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
      pexelsQuery: "Eiffel Tower Paris night romantic",
    },
    {
      texto: "Hotel, vuelos, traslados y guía turístico en español. Tú solo disfruta el viaje.",
      duracion: 10,
      promptImagen: "Luxurious European hotel lobby with elegant decor, warm lighting, travel luxury",
      pexelsQuery: "luxury hotel lobby Europe elegant",
    },
    {
      texto: "Grupos pequeños, atención personalizada. Tu experiencia de viaje perfecta comienza aquí.",
      duracion: 10,
      promptImagen: "Small travel group exploring Barcelona Spain streets, colorful architecture, happy tourists",
      pexelsQuery: "Barcelona Spain tourists street colorful",
    },
    {
      texto: "Plazas limitadas para el próximo tour. Reserva hoy con solo el 30% de anticipo.",
      duracion: 10,
      promptImagen: "European travel collage: Paris, Rome, Barcelona, Amsterdam, stunning photography",
      pexelsQuery: "Europe travel landmarks beautiful",
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
