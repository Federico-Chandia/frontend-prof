import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { Oficio } from '../types';
import api from '../services/api';
import ZonasTrabajoSelector from '../components/ZonasTrabajoSelector';
import OnboardingBanner from '../components/OnboardingBanner';
import ProfileProgress from '../components/ProfileProgress';
import PricingBanner from '../components/PricingBanner';
import ProfileChecklist from '../components/ProfileChecklist';
import { useNotifications } from '../hooks/useNotifications';

// Subcomponente para manejar subcategorías dinámicas.
type SubcategoryFieldProps = {
  categoria: string;
  value: string;
  onChange: (val: string) => void;
};

const SUBCATEGORIES: Record<string, string[]> = {
  'Salud y Medicina': [
    'Médico clínico','Médico general','Pediatra','Ginecólogo','Obstetra','Cardiólogo','Neurólogo','Endocrinólogo','Dermatólogo','Traumatólogo','Psiquiatra','Psicólogo','Nutricionista','Kinesiólogo','Fisioterapeuta','Fonoaudiólogo','Odontólogo','Ortodontista','Cirujano general','Cirujano plástico','Anestesiólogo','Infectólogo','Oncólogo','Reumatólogo','Hematólogo','Gastroenterólogo','Urólogo','Nefrólogo','Oftalmólogo','Otorrinolaringólogo','Enfermero','Enfermero especializado','Técnico en radiología','Técnico en laboratorio','Paramédico','Masoterapeuta','Quiropráctico','Podólogo','Acompañante terapéutico','Cuidador de pacientes','Operador socio-terapéutico'
  ],
  'Construcción y Oficios': [
    'Albañil','Constructor general','Maestro mayor de obras','Arquitecto','Ingeniero civil','Electricista','Electricista matriculado','Plomero','Gasista','Gasista matriculado','Carpintero','Carpintero de obra','Carpintero de muebles','Yesero','Pintor','Pintor industrial','Techista','Herrero','Soldador','Ceramista','Colocador de porcelanato','Parquetero','Instalador de durlock','Instalador de aire acondicionado','Refrigerista','Instalador de calefacción','Vidriero','Colocador de ventanas','Especialista en microcemento','Impermeabilizador','Jardinero de obra','Paisajista','Topógrafo','Montador de estructuras','Instalador de energías renovables'
  ],
  'Servicios Hogareños': [
    'Limpieza general','Limpieza profunda','Niñera','Cuidador de adulto mayor','Jardinero','Podador','Fumigador','Control de plagas','Mantenimiento general','Técnico en electrodomésticos','Reparador de lavarropas','Reparador de heladeras','Reparador de cocinas','Mudanzas','Fletes','Armador de muebles','Instalador de TV','Instalador de cortinas','Lavado de alfombras','Lavado de tapizados','Cerrajero','Servicio de emergencias domiciliarias'
  ],
  'Tecnología y Programación': [
    'Fullstack developer','Backend developer','Frontend developer','Mobile developer','DevOps','QA tester','Analista funcional','UX/UI designer','Diseñador de interfaces','Administrador de servidores','Especialista en ciberseguridad','Ethical hacker','Data scientist','Data engineer','Administrador de bases de datos (DBA)','Machine learning engineer','Cloud engineer','Soporte técnico','Técnico en hardware','Técnico en redes','Especialista en IoT','Programador Python','Programador JavaScript','Programador Java','Programador C#','Programador PHP','Programador Ruby','Diseñador web','Webmaster','Especialista WordPress','Tester manual','Tester automatizado'
  ],
  'Educación y Tutorías': [
    'Profesor de matemáticas','Profesor de lengua','Profesor de inglés','Profesor de francés','Profesor de italiano','Profesor de alemán','Profesor de portugués','Tutor escolar primario','Tutor escolar secundario','Tutor universitario','Clases particulares','Preparador de exámenes','Profesor de música','Profesor de guitarra','Profesor de piano','Profesor de canto','Profesor de danza','Profesor de arte','Profesor de educación física','Educador especial','Psicopedagogo','Maestra jardinera','Bibliotecario','Investigador académico'
  ],
  'Marketing y Publicidad': [
    'Community manager','Especialista en redes sociales','Marketing digital','Analista SEO','Analista SEM','Gestor de campañas','Copywriter','Content creator','Productor audiovisual','Fotógrafo','Videógrafo','Editor de video','Brand manager','Publicidad tradicional','Growth hacker'
  ],
  'Diseño y Creativida': [
    'Diseñador gráfico','Ilustrador','Animador 2D','Animador 3D','Modelador 3D','Diseñador industrial','Diseñador de modas','Diseñador de interiores','Diseñador editorial','Director de arte','Fotógrafo artístico','Escultor'
  ],
  'Legal y Jurídico': [
    'Abogado','Abogado penalista','Abogado laboralista','Abogado civil','Abogado comercial','Escribano','Mediador','Procurador','Asesor jurídico'
  ],
  'Contabilidad, Finanzas y Administración': [
    'Contador','Analista contable','Auditor','Licenciado en administración','Asistente administrativo','Gestor de trámites','Liquidador de sueldos','Analista financiero','Planificador financiero','Broker de inversiones'
  ],
  'Gastronomía y Cocina': [
    'Chef','Cocinero','Ayudante de cocina','Pastelero','Panadero','Repostero','Bartender','Barista','Sommelier','Catering','Organizador gastronómico'
  ],
  'Deportes y Fitness': [
    'Entrenador personal','Preparador físico','Profesor de gimnasia','Instructor de yoga','Instructor de pilates','Entrenador funcional','Profesor de natación','Kinesiólogo deportivo','Masajista deportivo'
  ],
  'Belleza y Estética': [
    'Peluquero','Estilista','Maquillador','Manicura','Pedicura','Cosmetóloga','Depiladora','Lashista','Barbero','Masajista','Tatuador','Piercer'
  ],
  'Veterinaria y Cuidado Animal': [
    'Veterinario','Auxiliar veterinario','Peluquero canino','Entrenador de perros','Paseador de perros','Cuidador de mascotas'
  ],
  'Transporte y Logística': [
    'Chofer particular','Chofer profesional','Fletero','Transportista','Motoquero','Repartidor','Logística','Operador de depósito'
  ],
  'Mecánica y Automotores': [
    'Mecánico automotor','Mecánico de motos','Electricista automotor','Chapista','Pintor automotor','Gomería','Alineación y balanceo','Lavadero especializado'
  ],
  'Servicios Rurales y Agro': [
    'Ingeniero agrónomo','Veterinario rural','Peón rural','Capatáz','Maquinista agrícola','Aplicador de agroquímicos','Clasificador de granos','Esquila','Arreo','Tareas de campo'
  ],
  'Limpieza e Higiene': [
    'Limpieza de casas','Limpieza de oficinas','Limpieza industrial','Limpieza de vidrios en altura','Limpieza de hospitales','Limpieza post obra'
  ],
  'Seguridad y Vigilancia': [
    'Vigilador','Seguridad privada','Custodio','Control de accesos','Monitoreo CCTV','Prevención de pérdidas'
  ],
  'Inmobiliario y Construcción Ligera': [
    'Agente inmobiliario','Tasador','Home staging','Decorador','Instalador de pisos','Colocador de vinilos'
  ],
  'Arte, Música y Entretenimiento': [
    'Músico','Cantante','DJ','Productor musical','Actor','Artista plástico','Payaso','Mago','Animador infantil','Bailarín'
  ],
  'Eventos y Organización': [
    'Organizador de eventos','Wedding planner','Decorador de eventos','Técnico de sonido','Técnico de iluminación','Catering','Fotografía de eventos','Video de eventos'
  ],
  'Industria y Manufactura': [
    'Operario industrial','Tornero','Fresador','Operador CNC','Serralero','Soldador industrial'
  ],
  'Servicios Comunitarios y Sociales': [
    'Trabajador social','Acompañante comunitario','Cuidador domiciliario','Voluntario profesional','Mediador comunitario'
  ],
  'Traducción, Idiomas y Comunicación': [
    'Traductor','Intérprete','Corrector de textos','Redactor profesional','Periodista','Locutor'
  ],
  'Otros Servicios Profesionales': [
    'Astrólogo','Tarotista','Consultor independiente','Coach personal','Coach empresarial','Realizador de trámites'
  ]
};

// Mapear etiquetas human-readable a los slugs aceptados por el backend
const CATEGORY_TO_SLUG: Record<string, string> = {
  'Salud y Medicina': 'salud-bienestar',
  'Construcción y Oficios': 'construccion',
  'Servicios Hogareños': 'servicios-hogar',
  'Tecnología y Programación': 'tecnologia',
  'Educación y Tutorías': 'educacion',
  'Marketing y Publicidad': 'profesionales',
  'Diseño y Creativida': 'profesionales',
  'Legal y Jurídico': 'profesionales',
  'Contabilidad, Finanzas y Administración': 'profesionales',
  'Gastronomía y Cocina': 'profesionales',
  'Deportes y Fitness': 'profesionales',
  'Belleza y Estética': 'profesionales',
  'Veterinaria y Cuidado Animal': 'salud-bienestar',
  'Transporte y Logística': 'transporte',
  'Mecánica y Automotores': 'profesionales',
  'Servicios Rurales y Agro': 'otro',
  'Limpieza e Higiene': 'servicios-hogar',
  'Seguridad y Vigilancia': 'profesionales',
  'Inmobiliario y Construcción Ligera': 'construccion',
  'Arte, Música y Entretenimiento': 'profesionales',
  'Eventos y Organización': 'eventos',
  'Industria y Manufactura': 'otro',
  'Servicios Comunitarios y Sociales': 'otro',
  'Traducción, Idiomas y Comunicación': 'profesionales',
  'Otros Servicios Profesionales': 'otro'
};

const ALLOWED_PROFESIONS = new Set(['plomero','electricista','gasista','pintor','carpintero','albañil','jardinero','cerrajero','otro']);

const SLUG_TO_CATEGORY: Record<string, string> = Object.keys(CATEGORY_TO_SLUG).reduce((acc, key) => {
  const slug = CATEGORY_TO_SLUG[key];
  acc[slug] = key;
  return acc;
}, {} as Record<string, string>);

const SubcategoryField: React.FC<SubcategoryFieldProps> = ({ categoria, value, onChange }) => {
  const options = SUBCATEGORIES[categoria] || [];

  if (options.length > 0) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Seleccionar subcategoría</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
        <option value="__otra">Otra (especificar)</option>
      </select>
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Ingresa subcategoría (opcional)"
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    />
  );
};

const MiPerfil: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [oficio, setOficio] = useState<Oficio | null>(null);
  const [estadisticas, setEstadisticas] = useState({
    totalTrabajos: 0,
    ingresosMes: 0,
    ratingPromedio: 0,
    totalReviews: 0
  });
  const [ultimasReviews, setUltimasReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState({ percentage: 0, missingFields: [] as string[] });
  const [userTokens, setUserTokens] = useState({ remaining: 5, plan: 'basico' as 'basico' | 'profesional' | 'premium' });
  const { permission, supported, requestPermission, showWorkRequestNotification } = useNotifications();
  const [portfolioFotos, setPortfolioFotos] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    // Información personal
    nombreCompleto: '',
    fotoPerfil: '',
    telefono: '',
    whatsappLaboral: '',
    // Servicios
    tipoOficio: '',
    descripcion: '',
    experiencia: 0,
    disponibilidadHoraria: {
      lunes: { activo: true, inicio: '09:00', fin: '18:00' },
      martes: { activo: true, inicio: '09:00', fin: '18:00' },
      miercoles: { activo: true, inicio: '09:00', fin: '18:00' },
      jueves: { activo: true, inicio: '09:00', fin: '18:00' },
      viernes: { activo: true, inicio: '09:00', fin: '18:00' },
      sabado: { activo: true, inicio: '09:00', fin: '15:00' },
      domingo: { activo: false, inicio: '09:00', fin: '18:00' }
    },
    tarifas: { porHora: 0, visitaTecnica: 0, emergencia: 0 },
    radioCobertura: 20,
    zonasTrabajo: [] as string[],
    certificaciones: [] as string[],
    matricula: '',
    seguroResponsabilidad: false
    ,
    // Categorías: principal y subcategoria (subcategoria puede ser texto libre si no hay opciones)
    categoriaPrincipal: '',
    subcategoria: ''
  });

  useEffect(() => {
    fetchPerfil();
    // Detectar si viene del onboarding
    if (searchParams.get('onboarding') === 'true') {
      setShowOnboarding(true);
      setEditMode(true);
    }
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    calculateProfileCompletion();
  }, [formData, oficio]);

  const calculateProfileCompletion = () => {
    const requiredFields = [
      { key: 'tipoOficio', label: 'Tipo de oficio' },
      { key: 'descripcion', label: 'Descripción de servicios' },
      { key: 'tarifas.porHora', label: 'Tarifa por hora' },
      { key: 'telefono', label: 'Teléfono' },
      { key: 'zonasTrabajo', label: 'Zonas de trabajo' }
    ];

    const optionalFields = [
      { key: 'experiencia', label: 'Años de experiencia' },
      { key: 'fotoPerfil', label: 'Foto de perfil' }
    ];

    const missingFields: string[] = [];
    let completedRequired = 0;
    let completedOptional = 0;

    requiredFields.forEach(field => {
      const value = field.key.includes('.') 
        ? formData.tarifas?.porHora 
        : formData[field.key as keyof typeof formData];
      
      if (!value || (Array.isArray(value) && value.length === 0) || value === 0) {
        missingFields.push(field.label);
      } else {
        completedRequired++;
      }
    });

    optionalFields.forEach(field => {
      const value = formData[field.key as keyof typeof formData];
      if (value && (!Array.isArray(value) || value.length > 0) && value !== 0) {
        completedOptional++;
      }
    });

    const requiredWeight = 70;
    const optionalWeight = 30;
    const percentage = Math.round(
      (completedRequired / requiredFields.length) * requiredWeight +
      (completedOptional / optionalFields.length) * optionalWeight
    );

    setProfileCompletion({ percentage, missingFields });
  };

  const handleUpgradePlan = (planId: string) => {
    if (planId === 'manage') {
      // Redirigir a gestión de suscripción
      window.open('/suscripciones', '_blank');
    } else {
      // Redirigir a página de pago
      window.open(`/checkout?plan=${planId}`, '_blank');
    }
  };

  const handleDismissOnboarding = () => {
    setShowOnboarding(false);
    setSearchParams({});
  };

  const getChecklistItems = () => {
    return [
      {
        id: 'tipoOficio',
        label: 'Seleccionar tipo de oficio',
        completed: !!formData.tipoOficio,
        required: true
      },
      {
        id: 'descripcion',
        label: 'Agregar descripción de servicios',
        completed: !!formData.descripcion,
        required: true
      },
      {
        id: 'tarifas',
        label: 'Configurar tarifas',
        completed: formData.tarifas.porHora > 0,
        required: true
      },
      {
        id: 'telefono',
        label: 'Agregar teléfono de contacto',
        completed: !!formData.telefono,
        required: true
      },
      {
        id: 'zonasTrabajo',
        label: 'Definir zonas de trabajo',
        completed: formData.zonasTrabajo.length > 0,
        required: true
      },
      {
        id: 'fotoPerfil',
        label: 'Subir foto de perfil',
        completed: !!formData.fotoPerfil,
        required: false
      },
      {
        id: 'experiencia',
        label: 'Especificar años de experiencia',
        completed: formData.experiencia > 0,
        required: false
      }
    ];
  };

  const handleChecklistItemClick = (itemId: string) => {
    if (!editMode) {
      setEditMode(true);
    }
    // Scroll al campo correspondiente
    const element = document.getElementById(itemId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus();
    }
  };

  const fetchPerfil = async () => {
    try {
      // Intentar obtener el perfil específico del usuario autenticado
      try {
        const response = await api.get('/oficios/mi-perfil');
        const miOficio = response.data.oficio;
        
        setOficio(miOficio);
        setPortfolioFotos(miOficio.fotos || []);
        setFormData({
          nombreCompleto: miOficio.usuario.nombre || '',
          fotoPerfil: miOficio.usuario.avatar || '',
          telefono: miOficio.usuario.telefono || '',
          whatsappLaboral: miOficio.whatsappLaboral || '',
          tipoOficio: miOficio.tipoOficio,
          categoriaPrincipal: SLUG_TO_CATEGORY[miOficio.categoria] || miOficio.categoria || (miOficio.tipoOficio || ''),
          subcategoria: miOficio.profesionPersonalizada || '',
          descripcion: miOficio.descripcion,
          experiencia: miOficio.experiencia,
          disponibilidadHoraria: miOficio.disponibilidadHoraria || formData.disponibilidadHoraria,
          tarifas: miOficio.tarifas,
          radioCobertura: miOficio.radioCobertura || 20,
          zonasTrabajo: miOficio.zonasTrabajo,
          certificaciones: miOficio.certificaciones,
          matricula: miOficio.matricula || '',
          seguroResponsabilidad: miOficio.seguroResponsabilidad || false
        });
        await fetchEstadisticas(miOficio._id);
      } catch (err) {
        console.log('No se pudo obtener el perfil de oficio, probablemente no existe aún');
        // Si no existe perfil, inicializar con datos del usuario
        setOficio(null);
        setFormData(prev => ({
          ...prev,
          nombreCompleto: user?.nombre || '',
          telefono: user?.telefono || ''
        ,
          categoriaPrincipal: prev.categoriaPrincipal || '',
          subcategoria: prev.subcategoria || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePortfolioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArr = Array.from(files);
    fileArr.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPortfolioFotos(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePortfolioPhoto = (index: number) => {
    setPortfolioFotos(prev => prev.filter((_, i) => i !== index));
  };

  const fetchEstadisticas = async (oficioId: string) => {
    try {
      console.log('Fetching estadisticas for oficio:', oficioId);
      
      // Obtener reservas del oficio
      let reservas = [];
      let reviews = [];
      
      try {
        // Obtener todas las reservas del usuario (como oficio)
        const reservasRes = await api.get('/reservas?tipo=profesional');
        reservas = reservasRes.data || [];
        console.log('Reservas obtenidas:', reservas.length);
      } catch (err) {
        console.log('Error obteniendo reservas:', err);
        reservas = [];
      }
      
      try {
        // Obtener reviews del oficio
        const reviewsRes = await api.get(`/reviews/oficio/${oficioId}`);
        reviews = reviewsRes.data.reviews || [];
        console.log('Reviews obtenidas:', reviews.length);
      } catch (err) {
        console.log('Error obteniendo reviews:', err);
        reviews = [];
      }
      
      // Calcular estadísticas
      const trabajosCompletados = reservas.filter(r => r.estado === 'completada').length;
      
      const ahora = new Date();
      const ingresosMes = reservas
        .filter(r => {
          if (r.estado !== 'completada') return false;
          const fecha = new Date(r.fechaHora);
          return fecha.getMonth() === ahora.getMonth() && 
                 fecha.getFullYear() === ahora.getFullYear();
        })
        .reduce((total, r) => total + (r.costos?.total || 0), 0);
      
      const ratingPromedio = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + (r.puntuacion || 0), 0) / reviews.length 
        : 0;
      
      const nuevasEstadisticas = {
        totalTrabajos: trabajosCompletados,
        ingresosMes: Math.round(ingresosMes),
        ratingPromedio: Math.round(ratingPromedio * 10) / 10,
        totalReviews: reviews.length
      };
      
      console.log('Estadisticas calculadas:', nuevasEstadisticas);
      setEstadisticas(nuevasEstadisticas);
      setUltimasReviews(reviews.slice(-3).reverse());
    } catch (error) {
      console.error('Error general fetching estadisticas:', error);
      setEstadisticas({
        totalTrabajos: 0,
        ingresosMes: 0,
        ratingPromedio: 0,
        totalReviews: 0
      });
    }
  };

  const handleActualizarEstadisticas = () => {
    if (oficio) {
      console.log('Actualizando estadisticas...');
      fetchEstadisticas(oficio._id);
    }
  };

  const handleSave = async () => {
    // Validaciones básicas
    if (!formData.tipoOficio) {
      setMessage({ type: 'error', text: 'Debe seleccionar un tipo de oficio' });
      return;
    }
    if (!formData.descripcion) {
      setMessage({ type: 'error', text: 'Debe agregar una descripción' });
      return;
    }
    if (!formData.tarifas.porHora || formData.tarifas.porHora <= 0) {
      setMessage({ type: 'error', text: 'Debe especificar una tarifa por hora válida' });
      return;
    }

    // Construir payload seguro para el backend
    const payload: any = { ...formData };

    // Mapear categoría humana a slug esperado por el backend
    if (formData.categoriaPrincipal) {
      const slug = CATEGORY_TO_SLUG[formData.categoriaPrincipal];
      if (slug) payload.categoria = slug;
    }

    // Si hay subcategoría, guardarla en 'profesionPersonalizada' y evitar enviar un 'tipoOficio' inválido
    if (formData.subcategoria) {
      payload.profesionPersonalizada = formData.subcategoria;
      payload.tipoOficio = 'otro';
    } else {
      // Si no hay subcategoria, asegurarse que tipoOficio sea uno de los permitidos por el backend
      if (!ALLOWED_PROFESIONS.has(String(formData.tipoOficio))) {
        payload.tipoOficio = 'otro';
      }
    }

    // Incluir fotos del portfolio en el payload
    payload.fotos = portfolioFotos;

    // Eliminar campos propios del frontend antes de enviar
    delete payload.categoriaPrincipal;
    delete payload.subcategoria;

    // Limpiar campos vacíos
    const cleanData = { ...payload };
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === '' || cleanData[key] === null) {
        delete cleanData[key];
      }
    });

    setSaving(true);
    setMessage(null);
    try {
      if (oficio) {
        await api.put(`/oficios/${oficio._id}`, cleanData);
        setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      } else {
        await api.post('/oficios', cleanData);
        setMessage({ type: 'success', text: 'Perfil creado correctamente' });
      }
      await fetchPerfil();
      setEditMode(false);
    } catch (error: any) {
      console.error('Error saving perfil:', error);
      const errorMsg = error.response?.data?.errors?.[0]?.msg || 
                      error.response?.data?.message || 
                      'Error al guardar el perfil';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData({...formData, fotoPerfil: result});
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Onboarding Banner */}
        {showOnboarding && (
          <OnboardingBanner onDismiss={handleDismissOnboarding} />
        )}

        {/* Profile Progress */}
        {user?.rol === 'profesional' && (
          <ProfileProgress 
            completionPercentage={profileCompletion.percentage}
            missingFields={profileCompletion.missingFields}
          />
        )}

        {/* Pricing Banner */}
        {user?.rol === 'profesional' && (
          <PricingBanner 
            currentPlan={userTokens.plan}
            tokensRemaining={userTokens.remaining}
            onUpgrade={handleUpgradePlan}
          />
        )}

        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil Profesional</h1>
            <p className="text-gray-600 mt-2">Gestiona tu información y portfolio</p>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {editMode ? 'Cancelar' : 'Editar Perfil'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Información Personal */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Información Personal</h2>
              
              {editMode ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden">
                      {formData.fotoPerfil ? (
                        <img src={formData.fotoPerfil} alt="Perfil" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                          👤
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer">
                        Cambiar Foto
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        value={formData.nombreCompleto}
                        onChange={(e) => setFormData({...formData, nombreCompleto: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp Laboral (opcional)
                      </label>
                      <input
                        type="tel"
                        value={formData.whatsappLaboral}
                        onChange={(e) => setFormData({...formData, whatsappLaboral: e.target.value})}
                        placeholder="+54 9 11 1234-5678"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden">
                      {formData.fotoPerfil ? (
                        <img src={formData.fotoPerfil} alt="Perfil" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                          👤
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{formData.nombreCompleto || user?.nombre}</h3>
                      <p className="text-gray-600 capitalize">{oficio?.tipoOficio}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Teléfono:</span>
                      <p className="font-medium">{formData.telefono || 'No especificado'}</p>
                    </div>
                    
                    {formData.whatsappLaboral && (
                      <div>
                        <span className="text-sm text-gray-500">WhatsApp Laboral:</span>
                        <p className="font-medium flex items-center gap-2">
                          {formData.whatsappLaboral}
                          <a 
                            href={`https://wa.me/${formData.whatsappLaboral.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800"
                          >
                            💬
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Descripción de Servicios */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Descripción de Servicios</h2>
              
              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría Principal
                    </label>
                      {/** Lista de categorías principales proporcionada por el usuario */}
                      <select
                        value={formData.categoriaPrincipal}
                        onChange={(e) => setFormData({
                          ...formData,
                          categoriaPrincipal: e.target.value,
                          // Mantener compatibilidad con tipoOficio usado en el backend
                          tipoOficio: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Seleccionar categoría</option>
                        <option>Salud y Medicina</option>
                        <option>Construcción y Oficios</option>
                        <option>Servicios Hogareños</option>
                        <option>Tecnología y Programación</option>
                        <option>Educación y Tutorías</option>
                        <option>Marketing y Publicidad</option>
                        <option>Diseño y Creativida</option>
                        <option>Legal y Jurídico</option>
                        <option>Contabilidad, Finanzas y Administración</option>
                        <option>Gastronomía y Cocina</option>
                        <option>Deportes y Fitness</option>
                        <option>Belleza y Estética</option>
                        <option>Veterinaria y Cuidado Animal</option>
                        <option>Transporte y Logística</option>
                        <option>Mecánica y Automotores</option>
                        <option>Servicios Rurales y Agro</option>
                        <option>Limpieza e Higiene</option>
                        <option>Seguridad y Vigilancia</option>
                        <option>Inmobiliario y Construcción Ligera</option>
                        <option>Arte, Música y Entretenimiento</option>
                        <option>Eventos y Organización</option>
                        <option>Industria y Manufactura</option>
                        <option>Servicios Comunitarios y Sociales</option>
                        <option>Traducción, Idiomas y Comunicación</option>
                        <option>Otros Servicios Profesionales</option>
                      </select>

                      {/** Subcategorías dinámicas: si hay opciones predefinidas, se mostrará un select; si no, un campo de texto libre */}
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subcategoría</label>
                        {/* Mapa de subcategorías vacío por ahora; el usuario proveerá las opciones posteriormente */}
                        {/* Si no hay subcategorías definidas, permitir input libre */}
                        <SubcategoryField
                          categoria={formData.categoriaPrincipal}
                          value={formData.subcategoria}
                          onChange={(val: string) => setFormData({...formData, subcategoria: val})}
                        />
                      </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción de Servicios
                    </label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                      rows={4}
                      placeholder="Describe los servicios que ofreces, tu experiencia y especialidades..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Años de Experiencia
                      </label>
                      <input
                        type="number"
                        value={formData.experiencia}
                        onChange={(e) => setFormData({...formData, experiencia: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Matrícula Profesional
                      </label>
                      <input
                        type="text"
                        value={formData.matricula}
                        onChange={(e) => setFormData({...formData, matricula: e.target.value})}
                        placeholder="Ej: MP-12345"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.seguroResponsabilidad}
                      onChange={(e) => setFormData({...formData, seguroResponsabilidad: e.target.checked})}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">
                      Tengo seguro de responsabilidad civil
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-500">Categoría:</span>
                    <p className="font-medium text-lg">{formData.categoriaPrincipal || oficio?.tipoOficio || 'No especificada'}</p>
                    { formData.subcategoria && (
                      <p className="text-sm text-gray-500 mt-1">{formData.subcategoria}</p>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Descripción:</span>
                    <p className="text-gray-700 mt-1">{oficio?.descripcion || 'No hay descripción'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Experiencia:</span>
                      <p className="font-medium">{oficio?.experiencia || 0} años</p>
                    </div>
                    
                    {formData.matricula && (
                      <div>
                        <span className="text-sm text-gray-500">Matrícula:</span>
                        <p className="font-medium flex items-center">
                          {formData.matricula}
                          <span className="ml-2 text-green-600">✓ Verificado</span>
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {formData.seguroResponsabilidad && (
                    <div className="flex items-center text-green-600">
                      <span className="mr-2">🛡️</span>
                      <span className="text-sm">Seguro de responsabilidad civil activo</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Disponibilidad Horaria */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Disponibilidad Horaria</h2>
              
              {editMode ? (
                <div className="space-y-3">
                  {Object.entries(formData.disponibilidadHoraria).map(([dia, horario]) => (
                    <div key={dia} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                      <div className="w-20">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={horario.activo}
                            onChange={(e) => setFormData({
                              ...formData,
                              disponibilidadHoraria: {
                                ...formData.disponibilidadHoraria,
                                [dia]: { ...horario, activo: e.target.checked }
                              }
                            })}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium capitalize">{dia}</span>
                        </label>
                      </div>
                      
                      {horario.activo && (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={horario.inicio}
                            onChange={(e) => setFormData({
                              ...formData,
                              disponibilidadHoraria: {
                                ...formData.disponibilidadHoraria,
                                [dia]: { ...horario, inicio: e.target.value }
                              }
                            })}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="text-gray-500">a</span>
                          <input
                            type="time"
                            value={horario.fin}
                            onChange={(e) => setFormData({
                              ...formData,
                              disponibilidadHoraria: {
                                ...formData.disponibilidadHoraria,
                                [dia]: { ...horario, fin: e.target.value }
                              }
                            })}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(formData.disponibilidadHoraria).map(([dia, horario]) => (
                    <div key={dia} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium capitalize">{dia}</span>
                      {horario.activo ? (
                        <span className="text-sm text-gray-600">
                          {horario.inicio} - {horario.fin}
                        </span>
                      ) : (
                        <span className="text-sm text-red-600">No disponible</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tarifas */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Tarifas y Cobertura</h2>
              
              {editMode ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Por Hora ($) *
                        <span className="text-xs text-gray-500 block">Tarifa estándar por hora de trabajo</span>
                      </label>
                      <input
                        type="number"
                        value={formData.tarifas.porHora}
                        onChange={(e) => setFormData({
                          ...formData, 
                          tarifas: {...formData.tarifas, porHora: parseInt(e.target.value)}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: 3000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Visita Técnica ($)
                        <span className="text-xs text-gray-500 block">Costo por evaluación inicial</span>
                      </label>
                      <input
                        type="number"
                        value={formData.tarifas.visitaTecnica}
                        onChange={(e) => setFormData({
                          ...formData, 
                          tarifas: {...formData.tarifas, visitaTecnica: parseInt(e.target.value)}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: 1500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergencia ($)
                        <span className="text-xs text-gray-500 block">Tarifa adicional fuera de horario</span>
                      </label>
                      <input
                        type="number"
                        value={formData.tarifas.emergencia}
                        onChange={(e) => setFormData({
                          ...formData, 
                          tarifas: {...formData.tarifas, emergencia: parseInt(e.target.value)}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: 5000"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Área de Cobertura
                      <span className="text-xs text-gray-500 block">Distancia máxima que estás dispuesto a viajar</span>
                    </label>
                    <select
                      value={formData.radioCobertura}
                      onChange={(e) => setFormData({...formData, radioCobertura: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={10}>10km - Zona local</option>
                      <option value={20}>20km - Zona metropolitana</option>
                      <option value={50}>50km - Zona extendida</option>
                      <option value={100}>+50km - Sin límite</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">${oficio?.tarifas.porHora}</p>
                      <p className="text-sm text-gray-600">Por Hora</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">${oficio?.tarifas.visitaTecnica}</p>
                      <p className="text-sm text-gray-600">Visita Técnica</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">${oficio?.tarifas.emergencia}</p>
                      <p className="text-sm text-gray-600">Emergencia</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Área de Cobertura:</span>
                      <span className="text-lg font-bold text-blue-600">
                        {oficio?.radioCobertura || 20}km
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {(oficio?.radioCobertura || 20) <= 10 ? 'Zona local' : 
                       (oficio?.radioCobertura || 20) <= 20 ? 'Zona metropolitana' : 
                       (oficio?.radioCobertura || 20) <= 50 ? 'Zona extendida' : 'Sin límite'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Últimas Reseñas */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Últimas Reseñas</h2>
              {ultimasReviews.length > 0 ? (
                <div className="space-y-4">
                  {ultimasReviews.map((review, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">{review.cliente?.nombre || 'Cliente'}</span>
                          <div className="flex ml-2">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-sm ${i < review.puntuacion ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                      {review.comentario && (
                        <p className="text-gray-700 text-sm">{review.comentario}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>Aún no tienes reseñas</p>
                  <p className="text-sm mt-1">Completa trabajos para recibir las primeras reseñas de tus clientes</p>
                </div>
              )}
            </div>

            {/* Portfolio de Trabajos */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Portfolio de Trabajos</h2>
                <label className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer relative overflow-hidden">
                  Agregar Foto
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePortfolioUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {portfolioFotos.length > 0 ? (
                  portfolioFotos.map((foto, index) => (
                    <div key={index} className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                      <img src={foto} alt={`Trabajo ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePortfolioPhoto(index)}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75"
                        title="Eliminar foto"
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-gray-400 text-4xl">+</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Estadísticas</h3>
                <button
                  onClick={handleActualizarEstadisticas}
                  className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50"
                >
                  🔄 Actualizar
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating Promedio:</span>
                  <span className="font-medium">{estadisticas.ratingPromedio} ⭐</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Trabajos:</span>
                  <span className="font-medium">{estadisticas.totalTrabajos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ingresos del Mes:</span>
                  <span className="font-medium">${estadisticas.ingresosMes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reseñas:</span>
                  <span className="font-medium">{estadisticas.totalReviews}</span>
                </div>
              </div>
              
              {/* Contacto Rápido */}
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-semibold mb-3">Contacto</h4>
                <div className="space-y-2">
                  {formData.telefono && (
                    <a
                      href={`tel:${formData.telefono}`}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      📞 {formData.telefono}
                    </a>
                  )}
                  {formData.whatsappLaboral && (
                    <a
                      href={`https://wa.me/${formData.whatsappLaboral.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-green-600 hover:text-green-800 text-sm"
                    >
                      💬 WhatsApp Laboral
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Notificaciones */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-4">Notificaciones</h3>
              {supported ? (
                <div className="space-y-3">
                  {permission === 'granted' ? (
                    <div className="flex items-center text-green-600">
                      <span className="mr-2">✓</span>
                      <span className="text-sm">Notificaciones activadas</span>
                    </div>
                  ) : permission === 'denied' ? (
                    <div className="text-sm text-red-600">
                      Notificaciones bloqueadas. Activa en configuración del navegador.
                    </div>
                  ) : (
                    <button
                      onClick={requestPermission}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                    >
                      Activar Notificaciones
                    </button>
                  )}
                  <p className="text-xs text-gray-500">
                    Recibe alertas cuando lleguen nuevas solicitudes de trabajo
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Tu navegador no soporta notificaciones
                </p>
              )}
            </div>

            {/* Profile Checklist */}
            <ProfileChecklist 
              items={getChecklistItems()}
              onItemClick={handleChecklistItemClick}
            />

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-4">Zonas de Trabajo</h3>
              <ZonasTrabajoSelector
                zonasSeleccionadas={formData.zonasTrabajo}
                onChange={(zonas) => setFormData({...formData, zonasTrabajo: zonas})}
                editMode={editMode}
              />
            </div>
          </div>
        </div>

        {/* Mensaje de estado */}
        {message && (
          <div className={`mt-4 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {editMode && (
          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={() => {
                setEditMode(false);
                setMessage(null);
              }}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiPerfil;