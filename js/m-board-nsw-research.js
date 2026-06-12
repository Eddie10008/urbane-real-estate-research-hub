/**
 * NSW spatial intelligence — researched facts for M-Board
 * Sources: ABS Census 2021, NSW Planning Portal, Blacktown City Council,
 * National Housing Accord, Housing SEPP 2021, Infrastructure Opportunities Plan 2026
 */
const NSW_RESEARCH = {
  meta: {
    state: 'New South Wales',
    abbreviation: 'NSW',
    population2024: 8340000,
    capital: 'Sydney',
    planningFramework: 'Environmental Planning & Assessment Act 1979',
    standardInstrument: 'Standard Instrument (Local Environmental Plans) Order 2006',
    housingSepp: 'State Environmental Planning Policy (Housing) 2021',
    lastUpdated: 'June 2026'
  },

  housingAccord: {
    northWestTarget: 46000,
    targetDate: 'June 2029',
    lgas: ['Blacktown', 'The Hills', 'Hawkesbury'],
    note: 'Combined five-year housing completions target under the National Housing Accord (Infrastructure Opportunities Plan, Feb 2026)'
  },

  policies: {
    tod: {
      name: 'Transport Oriented Development Program',
      innerRadius: 400,
      outerRadius: 1200,
      acceleratedPrecincts: 8,
      seppStations: 37,
      homesInPipeline: 18000,
      description: 'State-led density uplift near metro and rail stations. Part 1: 8 accelerated precincts within 1,200m. Part 2: TOD SEPP controls within 400m of 37 stations.'
    },
    lmr: {
      name: 'Low and Mid-Rise Housing Policy',
      stage2Date: '28 February 2025',
      radius: 800,
      centresAndStations: 171,
      maxStoreys: 6,
      description: 'Dual occupancies, terraces, townhouses and apartments within 800m walking distance of 171 nominated town centres and rail/metro/light rail stations across Greater Sydney, Central Coast, Hunter and Illawarra.'
    },
    corridor: {
      name: 'Mount Druitt to Toongabbie Corridor Strategy',
      areaHa: 6524,
      dwellingCapacityTest: 50000,
      lmrPotential: 23000,
      avgDensity: '6 dwellings/ha',
      centres: ['Mount Druitt', 'Rooty Hill', 'Doonside', 'Blacktown', 'Seven Hills', 'Toongabbie'],
      status: 'Draft structure plan — community consultation 2025–2026',
      council: 'Blacktown City Council'
    }
  },

  lgas: {
    blacktown: {
      name: 'Blacktown',
      population2025: 450000,
      populationProjected: 600000,
      medianWeeklyHouseholdIncome: 2107,
      medianAge: 35,
      source: 'ABS Census 2021 LGA; Blacktown City Council 2025'
    },
    parramatta: { name: 'Parramatta', population: 256000, role: 'Central River City CBD' },
    cumberland: { name: 'Cumberland', population: 248000, role: 'Parramatta corridor residential' },
    penrith: { name: 'Penrith', population: 217000, role: 'Western Parkland City anchor' }
  },

  stations: [
    { name: 'Blacktown', code: 'BAK', lng: 150.90735, lat: -33.76843, lines: ['T1 Western', 'T5 Cumberland', 'Richmond'], lga: 'Blacktown', tod: true, lmr: true, distanceKm: 34.87 },
    { name: 'Seven Hills', code: 'SEV', lng: 150.9368, lat: -33.7693, lines: ['T1 Western', 'T5 Cumberland'], lga: 'Blacktown', tod: false, lmr: true, corridor: true },
    { name: 'Toongabbie', code: 'TOG', lng: 150.9528, lat: -33.7877, lines: ['T1 Western'], lga: 'Blacktown', tod: false, lmr: false, corridor: true },
    { name: 'Doonside', code: 'DOO', lng: 150.8694, lat: -33.7661, lines: ['T1 Western'], lga: 'Blacktown', tod: false, lmr: true, corridor: true },
    { name: 'Mount Druitt', code: 'MDR', lng: 150.8201, lat: -33.7667, lines: ['T1 Western'], lga: 'Blacktown', tod: false, lmr: true, corridor: true },
    { name: 'Rooty Hill', code: 'ROO', lng: 150.8446, lat: -33.7719, lines: ['T1 Western'], lga: 'Blacktown', tod: false, lmr: false, corridor: true },
    { name: 'Marayong', code: 'MAR', lng: 150.8912, lat: -33.6887, lines: ['T1 Western', 'Richmond'], lga: 'Blacktown', tod: false, lmr: false },
    { name: 'Quakers Hill', code: 'QKH', lng: 150.8859, lat: -33.7389, lines: ['T5 Cumberland'], lga: 'Blacktown', tod: false, lmr: false },
    { name: 'Schofields', code: 'SCH', lng: 150.8745, lat: -33.7045, lines: ['T1 Western', 'T5 Cumberland'], lga: 'Blacktown', tod: false, lmr: false },
    { name: 'Riverstone', code: 'RIV', lng: 150.8612, lat: -33.6781, lines: ['T5 Cumberland'], lga: 'Blacktown', tod: false, lmr: false },
    { name: 'Parramatta', code: 'PAR', lng: 151.0072, lat: -33.8173, lines: ['T1 Western', 'T2 Inner West', 'Metro West (planned)'], lga: 'Parramatta', tod: false, lmr: false },
    { name: 'Auburn', code: 'AUB', lng: 151.0326, lat: -33.8492, lines: ['T1 Western', 'T2 Inner West'], lga: 'Cumberland', tod: false, lmr: true },
    { name: 'Merrylands', code: 'MER', lng: 150.9948, lat: -33.8356, lines: ['T2 Inner West'], lga: 'Cumberland', tod: false, lmr: false },
    { name: 'Westmead', code: 'WMD', lng: 151.0425, lat: -33.8087, lines: ['T1 Western'], lga: 'Parramatta', tod: false, lmr: true },
    { name: 'St Marys', code: 'STM', lng: 150.7751, lat: -33.7696, lines: ['T1 Western', 'Metro West (planned)'], lga: 'Penrith', tod: true, lmr: false },
    { name: 'Penrith', code: 'PEN', lng: 150.6973, lat: -33.7503, lines: ['T1 Western'], lga: 'Penrith', tod: false, lmr: true },
    { name: 'Werrington', code: 'WER', lng: 150.7556, lat: -33.7589, lines: ['T1 Western'], lga: 'Penrith', tod: false, lmr: false },
    { name: 'Kingswood', code: 'KIN', lng: 150.7249, lat: -33.7580, lines: ['T1 Western'], lga: 'Penrith', tod: false, lmr: false }
  ],

  sa2Regions: [
    { sa2: 'Blacktown - South', lng: 150.900, lat: -33.775, w: 0.022, h: 0.018, pop: 28400, density: 3200, medianAge: 36, medianIncome: 92400, growth: 2.1, source: 'ABS 2021 Census SA2 116011560' },
    { sa2: 'Blacktown - North', lng: 150.920, lat: -33.755, w: 0.020, h: 0.015, pop: 22100, density: 2100, medianAge: 34, medianIncome: 88400, growth: 2.4, source: 'ABS 2021 Census' },
    { sa2: 'Blacktown - East', lng: 150.935, lat: -33.768, w: 0.018, h: 0.014, pop: 19800, density: 2800, medianAge: 35, medianIncome: 96800, growth: 2.0, source: 'ABS 2021 Census' },
    { sa2: 'Mount Druitt - South', lng: 150.815, lat: -33.775, w: 0.025, h: 0.020, pop: 24600, density: 1800, medianAge: 33, medianIncome: 78000, growth: 2.8, source: 'ABS 2021 Census' },
    { sa2: 'Doonside - Woodcroft', lng: 150.870, lat: -33.765, w: 0.022, h: 0.018, pop: 31200, density: 2400, medianAge: 34, medianIncome: 83200, growth: 2.5, source: 'ABS 2021 Census' },
    { sa2: 'Parramatta - Central', lng: 151.000, lat: -33.820, w: 0.030, h: 0.025, pop: 35600, density: 4800, medianAge: 33, medianIncome: 98800, growth: 3.2, source: 'ABS 2021 Census' },
    { sa2: 'Auburn - Central', lng: 151.030, lat: -33.850, w: 0.020, h: 0.016, pop: 28900, density: 5200, medianAge: 32, medianIncome: 85600, growth: 2.6, source: 'ABS 2021 Census' },
    { sa2: 'Penrith - East', lng: 150.750, lat: -33.750, w: 0.035, h: 0.030, pop: 18900, density: 1500, medianAge: 37, medianIncome: 91200, growth: 1.8, source: 'ABS 2021 Census' },
    { sa2: 'Schofields - East', lng: 150.880, lat: -33.710, w: 0.028, h: 0.022, pop: 22400, density: 1200, medianAge: 31, medianIncome: 104800, growth: 4.5, source: 'ABS 2021 Census; greenfield growth' },
    { sa2: 'Marsden Park - Shanes Park', lng: 150.820, lat: -33.720, w: 0.030, h: 0.025, pop: 15600, density: 800, medianAge: 30, medianIncome: 112000, growth: 5.2, source: 'ABS 2021 Census; North West Growth Area' }
  ],

  growthPrecincts: [
    {
      name: 'Marsden Park North',
      lng: 150.805, lat: -33.715, w: 0.035, h: 0.028,
      lga: 'Blacktown',
      status: 'Post-exhibition (Nov 2025 – Jan 2026)',
      employmentHa: 260,
      jobs: 3900,
      dwellings: 960,
      openSpaceHa: 60,
      conservationHa: 80,
      source: 'NSW Planning Portal PPR'
    },
    {
      name: 'Marsden Park South',
      lng: 150.790, lat: -33.745, w: 0.030, h: 0.025,
      lga: 'Blacktown',
      status: 'Active — North West Growth Area',
      dwellings: 12000,
      note: 'Major greenfield release west of Richmond Road'
    },
    {
      name: 'Schofields Precinct',
      lng: 150.870, lat: -33.705, w: 0.032, h: 0.026,
      lga: 'Blacktown',
      status: 'Active',
      dwellings: 8500,
      note: 'Station precinct and North Kellyville fringe'
    },
    {
      name: 'Box Hill Release',
      lng: 150.920, lat: -33.695, w: 0.030, h: 0.025,
      lga: 'The Hills',
      status: 'Planned / Active',
      dwellings: 15000,
      note: 'North West Growth Area — Hills Shire'
    },
    {
      name: 'Grantham Farm',
      lng: 150.855, lat: -33.655, w: 0.025, h: 0.020,
      lga: 'The Hills',
      status: 'Active — Urbane sales corridor',
      dwellings: 3200,
      note: 'House-and-land packages; median sale ~$1.3M (Urbane portfolio)'
    },
    {
      name: 'Jordan Springs',
      lng: 150.735, lat: -33.725, w: 0.028, h: 0.022,
      lga: 'Penrith',
      status: 'Established growth',
      dwellings: 4500,
      note: 'Penrith LGA western growth corridor'
    },
    {
      name: 'Western Sydney Aerotropolis',
      lng: 150.785, lat: -33.935, w: 0.050, h: 0.040,
      lga: 'Liverpool / Penrith',
      status: 'Bradfield City Centre — under construction',
      jobs: 200000,
      note: 'Western Sydney Airport (WSA) catalyst; 11,000ha Aerotropolis'
    }
  ],

  urbane: {
    hq: { address: '9/18 Third Avenue, Blacktown NSW 2148', lng: 150.9058, lat: -33.7688 },
    serviceSuburbs: 58,
    corridors: [
      { name: 'Blacktown LGA core', suburbs: ['Blacktown', 'Marayong', 'Doonside', 'Rooty Hill', 'Mount Druitt', 'Seven Hills'] },
      { name: 'Parramatta corridor', suburbs: ['Auburn', 'Merrylands', 'Granville', 'Wentworthville', 'Harris Park', 'Westmead'] },
      { name: 'Growth corridors', suburbs: ['Marsden Park', 'Schofields', 'Grantham Farm', 'Jordan Springs', 'Box Hill'] },
      { name: 'Penrith / Western', suburbs: ['Werrington', 'Kingswood', 'Penrith', 'St Marys', 'St Clair'] }
    ],
    competitors: [
      { name: 'Ray White Blacktown City', address: '34 Flushcombe Road', lng: 150.9102, lat: -33.7695, sold12Mo: 80 },
      { name: 'LJ Hooker Blacktown', address: '61 Main Street', lng: 150.9085, lat: -33.7708 },
      { name: 'Century 21 Blacktown', address: '32 Flushcombe Road', lng: 150.9098, lat: -33.7698 },
      { name: 'Starr Partners Blacktown', address: 'Main Street precinct', lng: 150.9078, lat: -33.7710 },
      { name: 'Elders Real Estate Prospect', address: 'Shop 3, 1 Aldgate Street', lng: 150.9180, lat: -33.8020 }
    ]
  },

  railLines: [
    { name: 'T1 Western Line', operator: 'Sydney Trains', stations: ['Penrith', 'Werrington', 'Kingswood', 'St Marys', 'Mount Druitt', 'Rooty Hill', 'Doonside', 'Blacktown', 'Seven Hills', 'Toongabbie', 'Parramatta'] },
    { name: 'T5 Cumberland Line', operator: 'Sydney Trains', stations: ['Schofields', 'Quakers Hill', 'Blacktown', 'Seven Hills', 'Parramatta'] },
    { name: 'Richmond Line', operator: 'Sydney Trains', stations: ['Riverstone', 'Schofields', 'Marayong', 'Blacktown'] },
    { name: 'T2 Inner West', operator: 'Sydney Trains', stations: ['Parramatta', 'Merrylands', 'Auburn'] },
    { name: 'Sydney Metro West (planned)', operator: 'Sydney Metro', status: 'Under construction — Parramatta to Sydney CBD', stations: ['Parramatta', 'Westmead', 'St Marys'] }
  ],

  zoningSamples: [
    { lng: 150.898, lat: -33.772, w: 0.008, h: 0.006, zone: 'R3', name: 'Medium Density Residential', lga: 'Blacktown', fsr: '0.9:1', height: '12m', lot_size: '450m²', lep: 'Blacktown LEP 2015' },
    { lng: 150.906, lat: -33.768, w: 0.006, h: 0.005, zone: 'B2', name: 'Local Centre', lga: 'Blacktown', fsr: '2:1', height: '16m', lot_size: 'N/A', lep: 'Blacktown LEP 2015' },
    { lng: 150.912, lat: -33.765, w: 0.007, h: 0.005, zone: 'R4', name: 'High Density Residential', lga: 'Blacktown', fsr: '1.5:1', height: '21m', lot_size: 'N/A', lep: 'Blacktown LEP 2015' },
    { lng: 150.885, lat: -33.758, w: 0.010, h: 0.008, zone: 'R2', name: 'Low Density Residential', lga: 'Blacktown', fsr: '0.5:1', height: '9m', lot_size: '600m²', lep: 'Blacktown LEP 2015' },
    { lng: 150.920, lat: -33.780, w: 0.009, h: 0.007, zone: 'R1', name: 'General Residential', lga: 'Blacktown', fsr: '0.45:1', height: '8.5m', lot_size: '700m²', lep: 'Blacktown LEP 2015' },
    { lng: 150.870, lat: -33.785, w: 0.012, h: 0.009, zone: 'IN1', name: 'General Industrial', lga: 'Blacktown', fsr: '1:1', height: '15m', lot_size: 'N/A', lep: 'Blacktown LEP 2015' },
    { lng: 150.935, lat: -33.755, w: 0.008, h: 0.006, zone: 'SP2', name: 'Infrastructure', lga: 'Blacktown', fsr: 'N/A', height: 'N/A', lot_size: 'N/A', lep: 'Blacktown LEP 2015' },
    { lng: 150.950, lat: -33.770, w: 0.015, h: 0.012, zone: 'RU4', name: 'Primary Production Small Lots', lga: 'Blacktown', fsr: '0.25:1', height: '9m', lot_size: '4000m²', lep: 'Blacktown LEP 2015' },
    { lng: 151.000, lat: -33.820, w: 0.020, h: 0.015, zone: 'R3', name: 'Medium Density Residential', lga: 'Parramatta', fsr: '0.9:1', height: '14m', lot_size: '400m²', lep: 'Parramatta LEP 2023' },
    { lng: 151.050, lat: -33.850, w: 0.018, h: 0.014, zone: 'B4', name: 'Mixed Use', lga: 'Parramatta', fsr: '3:1', height: '45m', lot_size: 'N/A', lep: 'Parramatta LEP 2023' },
    { lng: 151.030, lat: -33.848, w: 0.012, h: 0.010, zone: 'R4', name: 'High Density Residential', lga: 'Cumberland', fsr: '1.8:1', height: '25m', lot_size: 'N/A', lep: 'Cumberland LEP 2023' },
    { lng: 150.750, lat: -33.750, w: 0.025, h: 0.020, zone: 'R2', name: 'Low Density Residential', lga: 'Penrith', fsr: '0.5:1', height: '9m', lot_size: '550m²', lep: 'Penrith LEP 2010' },
    { lng: 150.805, lat: -33.720, w: 0.030, h: 0.025, zone: 'E3', name: 'Productivity Support', lga: 'Blacktown', fsr: '1.5:1', height: '18m', lot_size: 'N/A', lep: 'SEPP Precincts — Central River City 2021' },
    { lng: 150.870, lat: -33.710, w: 0.028, h: 0.022, zone: 'R2', name: 'Low Density Residential', lga: 'Blacktown', fsr: '0.55:1', height: '9m', lot_size: '500m²', lep: 'Blacktown LEP 2015' }
  ]
};
