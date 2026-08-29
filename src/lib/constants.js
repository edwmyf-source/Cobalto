// Cuando esté en true, el código de verificación por WhatsApp será OBLIGATORIO
// en el onboarding. Por ahora el campo se muestra pero es opcional.
export const WHATSAPP_VERIFICATION_ENABLED = false

// Registro/login por celular con código SMS. Requiere Twilio configurado en
// Supabase (Authentication → Providers → Phone). Actívalo cuando esté listo:
// solo cambia este valor a `true`, no hay que tocar nada más.
export const PHONE_AUTH_ENABLED = true

// Canal por el que se envía el código cuando PHONE_AUTH_ENABLED esté activo.
// 'sms' funciona con cualquier proveedor de Supabase (Twilio, MessageBird, etc).
// 'whatsapp' SOLO funciona si el proveedor en Supabase es Twilio o Twilio Verify,
// y requiere haber configurado un remitente de WhatsApp en la consola de Twilio
// (sandbox para pruebas, o un número de WhatsApp Business aprobado por Meta
// para producción).
// ACTUALMENTE EN 'sms': Twilio Verify ya está configurado en Supabase y los SMS
// funcionan de inmediato. WhatsApp queda pendiente de que Meta apruebe el perfil
// de WhatsApp Business (Twilio bloquea el canal hasta entonces con el mensaje
// "You don't have an approved WhatsApp profile"). Cuando lo aprueben, basta
// cambiar este valor a 'whatsapp' -- no hay que tocar nada más.
export const PHONE_AUTH_CHANNEL = 'sms' // 'sms' | 'whatsapp'

// Registro/login con código de 6 dígitos por correo. Requiere que la plantilla
// "Magic Link" en Supabase incluya {{ .Token }} (Authentication → Email Templates).
// Mientras esté en `false`, el registro usa correo + contraseña tradicional.
export const EMAIL_CODE_AUTH_ENABLED = true

// El rol viene de la base de datos (profiles.role), no de un correo escrito
// en el código. Es la misma fuente de verdad que usa la función is_admin()
// de Supabase, que es la que realmente protege los datos vía RLS.
export const isAdmin = (profile) => profile?.role === 'admin'

// Nuevas categorías con subcategorías
export const CATEGORIES = [
  {
    value: 'productos',
    label: 'Productos',
    subcategories: [
      'Materias Primas',
      'Reactivos',
      'Equipos y Consumibles',
      'Mobiliarios',
      'Otros',
    ],
  },
  {
    value: 'servicios',
    label: 'Servicios',
    subcategories: [
      'Análisis de Laboratorio',
      'Mantenimiento/Calibración',
      'Asesoría/Capacitación',
      'Maquila',
      'Otros',
    ],
  },
  {
    value: 'empleos',
    label: 'Empleos',
    subcategories: [
      'Operativo',
      'Técnico',
      'Profesional',
      'Coordinador',
      'Gerencial',
    ],
  },
  {
    value: 'informacion',
    label: 'Información',
    // Mismas 4 opciones que usa el filtro del feed (NOVEDADES_SUBCATS): antes
    // había una lista distinta aquí para publicar, así que una publicación
    // con "Recursos" o "Legal" no coincidía con ningún filtro y quedaba
    // invisible al buscar por subcategoría.
    subcategories: [
      'Noticias y eventos',
      'Normatividad',
      'Conocimiento técnico',
      'Preguntas',
    ],
  },
]

// Flat lookup
export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.value, c]))

// Reactions
export const REACTIONS = [
  { type: 'like', icon: 'thumbsup', label: 'Me interesa' },
  { type: 'celebrate', icon: 'partypopper', label: 'Felicitaciones' },
  { type: 'curious', icon: 'eye', label: 'Interesante' },
  { type: 'love', icon: 'heart', label: 'Me encanta' },
  { type: 'surprised', icon: 'sparkles', label: 'Me sorprende' },
]

// Legacy compat
export const CATEGORY_SEED = CATEGORIES.flatMap(c =>
  c.subcategories.map(sub => ({ main_type: c.value, name: sub }))
)

export const DEPARTAMENTOS = [
  'Amazonas','Antioquia','Arauca','Atlántico','Bogotá D.C.','Bolívar','Boyacá',
  'Caldas','Caquetá','Casanare','Cauca','Cesar','Chocó','Córdoba','Cundinamarca',
  'Guainía','Guaviare','Huila','La Guajira','Magdalena','Meta','Nariño',
  'Norte de Santander','Putumayo','Quindío','Risaralda','San Andrés',
  'Santander','Sucre','Tolima','Valle del Cauca','Vaupés','Vichada'
]

// Top 3 que concentran el mayor volumen industrial
export const DEPARTAMENTOS_TOP3 = ['Antioquia', 'Bogotá D.C.', 'Valle del Cauca']

// Para el filtro de Vacantes: top 3 primero, luego el resto alfabético
export const DEPARTAMENTOS_ORDERED = [
  ...DEPARTAMENTOS_TOP3,
  ...DEPARTAMENTOS.filter(d => !DEPARTAMENTOS_TOP3.includes(d)).sort(),
]

// Tabs del marketplace
export const MARKETPLACE_TABS = [
  { value: 'todo',      label: 'TODO',      color: '#0047AB', bg: '#EBF1FC' },
  { value: 'novedades', label: 'INFO',      color: '#16a34a', bg: '#dcfce7', categories: ['informacion'] },
  { value: 'tienda',    label: 'PROVEEDORES', color: '#0369a1', bg: '#dbeafe', categories: ['productos', 'servicios'] },
  { value: 'vacantes',  label: 'VACANTES',  color: '#ea580c', bg: '#ffedd5', categories: ['empleos'] },
]

export const TAB_COLOR = {
  todo:          { color: '#0047AB', bg: '#EBF1FC' },
  novedades:     { color: '#16a34a', bg: '#dcfce7' },
  tienda:        { color: '#0369a1', bg: '#dbeafe' },
  vacantes:      { color: '#ea580c', bg: '#ffedd5' },
}

// Estructura de Tienda: intent → categoría → subcategorías
export const TIENDA_CATS = [
  {
    value: 'productos',
    label: 'Productos',
    subcategories: ['Materias Primas', 'Reactivos', 'Equipos y Consumibles', 'Mobiliarios', 'Otros'],
  },
  {
    value: 'servicios',
    label: 'Servicios',
    subcategories: ['Análisis de Laboratorio', 'Mantenimiento/Calibración', 'Asesoría/Capacitación', 'Maquila', 'Otros'],
  },
]

// Subcategorías de Novedades (pestaña "Info")
export const NOVEDADES_SUBCATS = ['Noticias y eventos', 'Normatividad', 'Conocimiento técnico', 'Preguntas']

// Niveles de Vacantes
export const VACANTES_NIVELES = ['Operativo', 'Técnico', 'Profesional', 'Coordinador', 'Gerencial']

export const SEGMENTS = [
  'ACADEMICO','INDUSTRIAL','ALIMENTOS','COSMETICO','FARMACEUTICO',
  'ESTATAL','AMBIENTAL','AGRICOLA','VETERINARIO','CLINICO'
]
