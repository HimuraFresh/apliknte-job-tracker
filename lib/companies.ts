// Empresas que contratan en España, con peso en perfiles de datos. Solo se sugieren al
// escribir en "Empresa", y siempre detras de las que el usuario ya ha usado.
// ponytail: lista fija a mano; si hay que mantenerla entre varios, pasarla a una tabla.
export const COMPANIES = [
  // Banca, finanzas y pagos
  "Abanca", "Afi", "Allfunds", "American Express", "Andbank", "Arquia Banca", "Axesor",
  "Banca March", "Banco Caminos", "Banco Cooperativo Español", "Banco de España",
  "Banco Mediolanum", "Banco Sabadell", "Banco Santander", "Bankinter", "BBVA", "Bizum",
  "BlackRock", "BME", "BNP Paribas", "Caja Rural", "CaixaBank", "Cajamar", "Cecabank",
  "Cetelem", "Citi", "CNMV", "Cofidis", "Deutsche Bank", "Equifax", "EVO Banco", "Experian",
  "Fintonic", "Global Payments", "Ibercaja", "Indexa Capital", "Informa D&B", "ING",
  "Inversis", "J.P. Morgan", "Kutxabank", "Laboral Kutxa", "Mastercard", "Moody's",
  "MyInvestor", "N26", "Openbank", "PayPal", "Redsys", "Renta 4 Banco", "Revolut",
  "Santander Consumer Finance", "seQura", "Triodos Bank", "Unicaja", "Visa", "WiZink",
  "Worldline",

  // Seguros
  "Aegon", "Allianz", "Asisa", "AXA", "Caser", "Catalana Occidente", "Cigna", "DKV", "Fiatc",
  "Generali", "Helvetia", "Liberty Seguros", "Línea Directa", "Mapfre", "MetLife",
  "Mutua Madrileña", "Ocaso", "Pelayo", "Reale Seguros", "Sanitas", "Santalucía",
  "SegurCaixa Adeslas", "Verti", "Zurich",

  // Consultoría y servicios tecnológicos
  "Accenture", "Alten", "Altia", "Atos", "Aubay", "Axpe Consulting", "Ayesa", "Babel",
  "Bain & Company", "BDO", "Bip", "Bosonit", "Boston Consulting Group", "Capgemini",
  "Cognizant", "Deloitte", "Denodo", "Devoteam", "DXC Technology", "Endava", "EPAM Systems",
  "EY", "Fujitsu", "GFT", "Globant", "GMV", "Grant Thornton", "Grupo Oesía", "HCLTech",
  "Hiberus", "IBM", "Indra", "Inetum", "Infosys", "Izertis", "Kearney", "Keepler", "Keyrus",
  "Knowmad Mood", "KPMG", "Kyndryl", "Making Science", "Management Solutions",
  "McKinsey & Company", "Minsait", "NTT Data", "Oliver Wyman", "Orange Business",
  "Paradigma Digital", "Plain Concepts", "PwC", "Ricoh", "Roland Berger", "SDG Group",
  "Seidor", "Sener", "Sngular", "Sopra Steria", "Stratesys", "Stratio",
  "Tata Consultancy Services", "Telefónica Tech", "Thales", "The Cocktail", "Thoughtworks",
  "T-Systems", "Unisys", "Viewnext", "Wipro",

  // Datos, analítica e investigación de mercados
  "Databricks", "IQVIA", "Ipsos", "Kantar", "NielsenIQ", "Qlik", "SAS", "Snowflake",
  "Teradata",

  // Grandes tecnológicas y software
  "Adobe", "Amazon", "Amazon Web Services", "Apple", "Cisco", "Dell Technologies", "Ericsson",
  "Google", "Hewlett Packard Enterprise", "HP", "Huawei", "Intel", "Lenovo", "Meta",
  "Microsoft", "Netflix", "Nokia", "Oracle", "S21sec", "Salesforce", "Samsung", "SAP",
  "ServiceNow", "Uber", "Workday",

  // Startups y tecnológicas nacidas en España
  "Adevinta", "Amadeus", "Bit2Me", "BlaBlaCar", "Cabify", "CARTO", "Civitatis", "Clarity AI",
  "Clikalia", "Devo", "Doctoralia", "eDreams ODIGEO", "Factorial", "Fever", "Fotocasa",
  "Freepik", "Genially", "Glovo", "Holaluz", "Holded", "Hotelbeds", "Housfy", "Idealista",
  "InfoJobs", "Jobandtalent", "Just Eat", "King", "Lingokids", "Mercadona Tech", "Paack",
  "PcComponentes", "Red Points", "Seedtag", "Signaturit", "Socialpoint", "Spotahome",
  "Tinsa", "TravelPerk", "Typeform", "Ubisoft", "Wallapop", "Wallbox",

  // Telecomunicaciones, medios y deporte
  "Atresmedia", "Cellnex", "Digi", "FC Barcelona", "Grupo Planeta", "LaLiga", "MasOrange",
  "Mediaset España", "Orange", "Prisa", "Real Madrid", "RTVE", "Telefónica",
  "Unidad Editorial", "Vocento", "Vodafone",

  // Energía y servicios públicos
  "Acciona Energía", "Agbar", "BP", "Canal de Isabel II", "Cepsa", "EDP", "Enagás", "Endesa",
  "Galp", "Iberdrola", "Moeve", "Naturgy", "Red Eléctrica", "Redeia", "Repsol",
  "Siemens Gamesa", "Solaria", "TotalEnergies", "Veolia",

  // Construcción, infraestructuras, transporte y logística
  "Abertis", "Acciona", "ACS", "Adif", "Aena", "Air Europa", "Air Nostrum", "ALSA", "Binter",
  "Correos", "DHL", "DSV", "EMT Madrid", "FCC", "FedEx", "Ferrovial", "GLS", "Iberia",
  "Iberia Express", "Kuehne+Nagel", "Logista", "Maersk", "Metro de Madrid", "MRW", "OHLA",
  "Renfe", "Sacyr", "SEUR", "Técnicas Reunidas", "UPS", "Volotea", "Vueling",

  // Industria y automoción
  "ABB", "Acerinox", "Airbus", "ArcelorMittal", "BASF", "Bosch", "Bridgestone", "CAF",
  "CIE Automotive", "Ford", "Gestamp", "Grupo Antolin", "Irizar", "ITP Aero",
  "Mercedes-Benz", "Michelin", "Mondragon", "Navantia", "Orona", "Philips", "Porcelanosa",
  "Renault", "Roca", "Saint-Gobain", "Schneider Electric", "SEAT", "Siemens", "Stellantis",
  "Talgo", "Volkswagen",

  // Farmacia y salud
  "Abbott", "AbbVie", "Almirall", "Amgen", "AstraZeneca", "Bayer", "Boehringer Ingelheim",
  "Bristol Myers Squibb", "Cinfa", "Cofares", "Esteve", "Faes Farma", "Ferrer", "Grifols",
  "GSK", "HM Hospitales", "Johnson & Johnson", "Kern Pharma", "Lilly", "Medtronic", "MSD",
  "Normon", "Novartis", "Novo Nordisk", "Pfizer", "PharmaMar", "Quirónsalud", "Ribera Salud",
  "Roche", "Rovi", "Sanofi", "Siemens Healthineers", "Stada", "Takeda", "Vithas",

  // Distribución, moda, consumo y alimentación
  "Ahorramás", "Alcampo", "Aldi", "Alsea", "Calidad Pascual", "Campofrío", "Carrefour",
  "Coca-Cola Europacific Partners", "Colgate-Palmolive", "Consum", "Damm", "Danone",
  "Decathlon", "Deoleo", "Desigual", "DIA", "Douglas", "Ebro Foods", "El Corte Inglés",
  "ElPozo Alimentación", "Eroski", "Fnac", "GBfoods", "Grupo Bimbo", "H&M", "Heineken",
  "Henkel", "Hijos de Rivera", "IKEA", "Inditex", "ISDIN", "L'Oréal", "Leroy Merlin", "Lidl",
  "Mahou San Miguel", "Makro", "Mango", "Mars", "McDonald's", "MediaMarkt", "Mercadona",
  "Mondelēz International", "Nestlé", "PepsiCo", "Primark", "Procter & Gamble", "Puig",
  "Reckitt", "Sephora", "Telepizza", "Tendam", "Unilever", "Worten",

  // Turismo y hoteles
  "Barceló", "Hotusa", "Iberostar", "Logitravel", "Meliá", "NH Hotels", "Paradores", "RIU",

  // Empleo y selección
  "Adecco", "Eurofirms", "Experis", "Gi Group", "Hays", "ManpowerGroup", "Michael Page",
  "Page Personnel", "Randstad", "Robert Half", "Robert Walters", "Synergie", "Walters People",

  // Sector público e investigación
  "Agencia Espacial Europea", "Agencia Tributaria", "Ayuntamiento de Madrid",
  "Barcelona Supercomputing Center", "Comunidad de Madrid", "CSIC", "EUIPO", "INE", "Red.es",

  // Publicidad, inmobiliario, seguridad y educación
  "CBRE", "Dentsu", "Havas", "IE University", "JLL", "Merlin Properties", "Prosegur",
  "Publicis Groupe", "Securitas", "Verisure", "WPP",
].sort((a, b) => a.localeCompare(b, "es"));
