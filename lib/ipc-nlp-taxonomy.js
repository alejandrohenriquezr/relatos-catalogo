// @ts-check
/**
 * Diccionario de búsqueda ciudadana para la canasta IPC 2023.
 * Se mantiene separado de la interfaz para que pueda auditarse, ampliarse o
 * reutilizarse en indexadores y metabuscadores.
 */
export const IPC_SEARCH_TAXONOMY = [
  { id: "01.1.1.3.1", official: "Pan", synonyms: ["marraqueta", "hallulla", "pan batido", "pan francés", "pan amasado"], division: "Alimentos y bebidas no alcohólicas", tags: ["panadería", "cereales", "alimento básico"] },
  { id: "01.1.1.1.1", official: "Arroz", synonyms: ["arroz grano largo", "arroz corriente"], division: "Alimentos y bebidas no alcohólicas", tags: ["cereal", "abarrotes", "alimento básico"] },
  { id: "01.1.1.2.1", official: "Harina de trigo", synonyms: ["harina blanca", "harina para pan"], division: "Alimentos y bebidas no alcohólicas", tags: ["harina", "repostería", "cereal"] },
  { id: "01.1.1.5.1", official: "Pastas", synonyms: ["fideos", "tallarines", "espagueti", "spaghetti"], division: "Alimentos y bebidas no alcohólicas", tags: ["pasta", "abarrotes", "cereal"] },
  { id: "01.1.2.1.1", official: "Carne de vacuno", synonyms: ["carne de res", "carne roja", "vacuno", "posta", "asiento", "lomo"], division: "Alimentos y bebidas no alcohólicas", tags: ["carne", "carnicería", "proteína"] },
  { id: "01.1.2.1.2", official: "Carne de pollo", synonyms: ["pollo", "ave", "pechuga", "trutro", "tuto de pollo"], division: "Alimentos y bebidas no alcohólicas", tags: ["carne", "ave", "proteína"] },
  { id: "01.1.2.1.3", official: "Carne de cerdo", synonyms: ["cerdo", "chancho", "carne de chancho"], division: "Alimentos y bebidas no alcohólicas", tags: ["carne", "porcino", "proteína"] },
  { id: "01.1.4.1.1", official: "Leche líquida", synonyms: ["leche", "leche de vaca", "leche entera", "leche descremada"], division: "Alimentos y bebidas no alcohólicas", tags: ["lácteos", "desayuno"] },
  { id: "01.1.4.7.1", official: "Huevos", synonyms: ["huevo", "docena de huevos"], division: "Alimentos y bebidas no alcohólicas", tags: ["proteína", "alimento básico"] },
  { id: "01.1.5.1.1", official: "Aceite vegetal y de maravilla", synonyms: ["aceite", "aceite de maravilla", "aceite para cocinar"], division: "Alimentos y bebidas no alcohólicas", tags: ["aceites", "cocina", "abarrotes"] },
  { id: "01.1.7.2.1", official: "Papas", synonyms: ["papa", "papas frescas"], division: "Alimentos y bebidas no alcohólicas", tags: ["verduras", "feria", "tubérculo"] },
  { id: "01.1.7.1.2", official: "Tomates", synonyms: ["tomate", "tomates frescos"], division: "Alimentos y bebidas no alcohólicas", tags: ["verduras", "feria", "hortaliza"] },
  { id: "01.2.5.1.1", official: "Bebidas gaseosas", synonyms: ["bebida", "gaseosa", "bebida de fantasía"], division: "Alimentos y bebidas no alcohólicas", tags: ["bebidas", "refresco", "sin alcohol"] },
  { id: "01.2.4.1.1", official: "Agua embotellada", synonyms: ["agua en botella", "agua mineral", "botella de agua"], division: "Alimentos y bebidas no alcohólicas", tags: ["bebidas", "agua", "sin alcohol"] },
  { id: "02.1.3.1.1", official: "Cervezas", synonyms: ["cerveza", "chela"], division: "Bebidas alcohólicas y tabaco", tags: ["alcohol", "bebidas"] },
  { id: "02.1.2.1.1", official: "Vinos", synonyms: ["vino", "vinito"], division: "Bebidas alcohólicas y tabaco", tags: ["alcohol", "bebidas"] },
  { id: "02.2.1.1.1", official: "Cigarrillos", synonyms: ["cigarros", "puchos", "tabaco"], division: "Bebidas alcohólicas y tabaco", tags: ["tabaquismo", "tabaco"] },
  { id: "03", official: "Vestuario y calzado", synonyms: ["ropa", "vestimenta", "prendas", "zapatos", "zapatillas"], division: "Vestuario y calzado", tags: ["vestuario", "calzado", "indumentaria"] },
  { id: "04.1.1.1.1", official: "Arriendo", synonyms: ["alquiler", "renta de vivienda", "arrendamiento", "arriendo de casa", "arriendo de departamento"], division: "Vivienda y servicios básicos", tags: ["vivienda", "hogar", "canon de arriendo"] },
  { id: "04.3.3.1.1", official: "Gastos comunes", synonyms: ["gasto común", "administración del edificio", "cuota del condominio"], division: "Vivienda y servicios básicos", tags: ["vivienda", "edificio", "condominio"] },
  { id: "04.4.1.1.1", official: "Suministro de electricidad", synonyms: ["luz", "cuenta de la luz", "cuenta eléctrica", "electricidad"], division: "Vivienda y servicios básicos", tags: ["servicios básicos", "energía", "hogar"] },
  { id: "04.4.2.1.1", official: "Gas licuado", synonyms: ["gas", "balón de gas", "cilindro de gas", "gas de 15 kilos"], division: "Vivienda y servicios básicos", tags: ["servicios básicos", "combustible doméstico", "hogar"] },
  { id: "04.3.1.1.1", official: "Suministro de agua", synonyms: ["cuenta del agua", "agua potable", "servicio de agua"], division: "Vivienda y servicios básicos", tags: ["servicios básicos", "agua", "hogar"] },
  { id: "05.6.1.1.1", official: "Detergentes y suavizantes para ropa", synonyms: ["detergente", "jabón para lavar", "suavizante"], division: "Equipamiento y mantención del hogar", tags: ["aseo", "lavado", "hogar"] },
  { id: "05.6.2.1.1", official: "Servicio doméstico", synonyms: ["asesora del hogar", "trabajadora de casa particular", "nana"], division: "Equipamiento y mantención del hogar", tags: ["cuidados", "limpieza", "trabajo doméstico"] },
  { id: "06.1.1", official: "Medicamentos", synonyms: ["remedios", "fármacos", "medicinas"], division: "Salud", tags: ["farmacia", "salud", "tratamiento"] },
  { id: "07.1.1", official: "Automóviles", synonyms: ["auto", "vehículo", "coche", "auto particular"], division: "Transporte", tags: ["movilidad", "vehículos", "transporte privado"] },
  { id: "07.2.2.2.1", official: "Gasolina", synonyms: ["bencina", "combustible para auto", "nafta"], division: "Transporte", tags: ["combustible", "vehículo", "transporte"] },
  { id: "07.3.1", official: "Transporte de pasajeros por vías urbanas y carreteras", synonyms: ["transporte público", "micro", "bus", "colectivo", "locomoción colectiva"], division: "Transporte", tags: ["pasaje", "movilidad", "transporte terrestre"] },
  { id: "07.3.2", official: "Transporte aéreo de pasajeros", synonyms: ["avión", "pasaje aéreo", "vuelo", "ticket aéreo"], division: "Transporte", tags: ["viaje", "aerolínea", "pasaje"] },
  { id: "08.2.2.1.1", official: "Conexión a internet", synonyms: ["internet", "wifi", "banda ancha", "plan de internet"], division: "Información y comunicación", tags: ["conectividad", "telecomunicaciones", "hogar"] },
  { id: "08.2.1.1.1", official: "Servicios de telefonía móvil", synonyms: ["plan de celular", "cuenta del celular", "telefonía celular", "datos móviles"], division: "Información y comunicación", tags: ["celular", "telecomunicaciones", "conectividad"] },
  { id: "09.3.2.1.1", official: "Alimentos para mascotas", synonyms: ["comida para perro", "comida para gato", "alimento de mascota", "pellets"], division: "Recreación, deportes y cultura", tags: ["mascotas", "perro", "gato"] },
  { id: "09.4.1.1.1", official: "Servicios para mascotas", synonyms: ["veterinaria", "veterinario", "peluquería canina"], division: "Recreación, deportes y cultura", tags: ["mascotas", "salud animal"] },
  { id: "09.7.1.2.1", official: "Libros", synonyms: ["libro", "novela", "lectura"], division: "Recreación, deportes y cultura", tags: ["cultura", "lectura", "publicaciones"] },
  { id: "10", official: "Educación", synonyms: ["colegio", "jardín infantil", "universidad", "mensualidad", "matrícula", "arancel"], division: "Educación", tags: ["enseñanza", "estudios", "servicios educativos"] },
  { id: "11.1.1.1.1", official: "Alimentos adquiridos en restaurantes, cafés y similares", synonyms: ["restaurante", "comer afuera", "menú", "colación", "almuerzo fuera de casa"], division: "Restaurantes y alojamiento", tags: ["comida preparada", "cafetería", "gastronomía"] },
  { id: "11.2.1.1.1", official: "Servicios de alojamiento", synonyms: ["hotel", "hostal", "hospedaje", "alojamiento turístico"], division: "Restaurantes y alojamiento", tags: ["turismo", "viaje", "estadía"] },
  { id: "12.1.1.1.1", official: "Seguros", synonyms: ["seguro", "póliza", "prima de seguro"], division: "Seguros y servicios financieros", tags: ["protección financiera", "cobertura"] },
  { id: "12.2.1", official: "Gastos financieros", synonyms: ["comisión bancaria", "costo bancario", "mantención de cuenta"], division: "Seguros y servicios financieros", tags: ["banco", "comisiones", "finanzas"] },
  { id: "13.1.1.2.1", official: "Papel higiénico", synonyms: ["confort", "papel de baño", "papel sanitario"], division: "Bienes y servicios diversos", tags: ["higiene", "aseo personal", "hogar"] },
  { id: "13.1.2.1.1", official: "Servicios de peluquería", synonyms: ["peluquería", "corte de pelo", "barbería", "salón de belleza"], division: "Bienes y servicios diversos", tags: ["cuidado personal", "estética"] },
];

/** Reglas de desambiguación aplicadas antes del ordenamiento de resultados. */
export const IPC_AMBIGUITY_RULES = [
  { term: "gas", description: "Con hogar, balón o cuenta se interpreta como gas doméstico; con auto, vehículo o estación, como combustible de transporte.", contexts: [{ words: ["auto", "vehiculo", "estacion", "bencina"], preferId: "07.2.2.2.1" }, { words: ["hogar", "balon", "cilindro", "cuenta"], preferId: "04.4.2.1.1" }] },
  { term: "arriendo", description: "Sin otro contexto se asigna a vivienda; si se menciona auto o vehículo, se evita esa asignación automática.", contexts: [{ words: ["casa", "departamento", "vivienda", "pieza"], preferId: "04.1.1.1.1" }] },
  { term: "pasaje", description: "Avión o vuelo prioriza transporte aéreo; micro, bus o interurbano prioriza transporte terrestre.", contexts: [{ words: ["avion", "vuelo", "aereo"], preferId: "07.3.2" }, { words: ["micro", "bus", "interurbano", "colectivo"], preferId: "07.3.1" }] },
  { term: "cuenta", description: "El servicio mencionado determina la categoría: luz, agua, celular o internet.", contexts: [{ words: ["luz", "electrica", "electricidad"], preferId: "04.4.1.1.1" }, { words: ["agua"], preferId: "04.3.1.1.1" }, { words: ["celular", "telefono"], preferId: "08.2.1.1.1" }, { words: ["internet", "wifi"], preferId: "08.2.2.1.1" }] },
  { term: "plan", description: "Celular o datos móviles se asigna a telefonía; internet o wifi, a conexión a internet.", contexts: [{ words: ["celular", "movil", "datos"], preferId: "08.2.1.1.1" }, { words: ["internet", "wifi", "banda ancha"], preferId: "08.2.2.1.1" }] },
  { term: "agua", description: "Cuenta, potable o servicio prioriza suministro domiciliario; botella o mineral prioriza agua embotellada.", contexts: [{ words: ["cuenta", "potable", "servicio"], preferId: "04.3.1.1.1" }, { words: ["botella", "embotellada", "mineral"], preferId: "01.2.4.1.1" }] },
];
