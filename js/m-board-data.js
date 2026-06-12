/**
 * M-Board spatial data — NSW researched layers for Greater Western Sydney
 * Built from NSW_RESEARCH (ABS 2021, NSW Planning Portal, Blacktown City Council)
 */
const MBOARD_DATA = (() => {
  const R = typeof NSW_RESEARCH !== 'undefined' ? NSW_RESEARCH : null;

  function rect(lng, lat, w, h, props) {
    return {
      type: 'Feature',
      properties: props,
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [lng, lat], [lng + w, lat], [lng + w, lat + h], [lng, lat + h], [lng, lat]
        ]]
      }
    };
  }

  function line(coords, props) {
    return { type: 'Feature', properties: props, geometry: { type: 'LineString', coordinates: coords } };
  }

  function point(lng, lat, props) {
    return { type: 'Feature', properties: props, geometry: { type: 'Point', coordinates: [lng, lat] } };
  }

  /** Approximate circle polygon for policy buffers (400m / 800m) */
  function circlePolygon(lng, lat, radiusM, steps = 48, props = {}) {
    const coords = [];
    const latRad = lat * Math.PI / 180;
    const mPerDegLat = 111320;
    const mPerDegLng = 111320 * Math.cos(latRad);
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * 2 * Math.PI;
      coords.push([
        lng + (radiusM * Math.cos(angle)) / mPerDegLng,
        lat + (radiusM * Math.sin(angle)) / mPerDegLat
      ]);
    }
    return { type: 'Feature', properties: props, geometry: { type: 'Polygon', coordinates: [coords] } };
  }

  function stationCoords(names) {
    if (!R) return [];
    const lookup = Object.fromEntries(R.stations.map((s) => [s.name, [s.lng, s.lat]]));
    return names.map((n) => lookup[n]).filter(Boolean);
  }

  /* ── Planning: zoning from researched LEP samples ───────── */
  const zoningFeatures = (R?.zoningSamples || []).map((z) =>
    rect(z.lng, z.lat, z.w, z.h, {
      zone: z.zone, name: z.name, lga: z.lga, fsr: z.fsr, height: z.height,
      lot_size: z.lot_size, lep: z.lep
    })
  );
  const zoning = { type: 'FeatureCollection', features: zoningFeatures };

  const fsr = {
    type: 'FeatureCollection',
    features: zoning.features.map((f) => ({
      ...f,
      properties: { ...f.properties, fsr_value: parseFloat(f.properties.fsr) || 0, label: f.properties.fsr }
    }))
  };

  const heights = {
    type: 'FeatureCollection',
    features: zoning.features.map((f) => ({
      ...f,
      properties: { ...f.properties, height_m: parseFloat(f.properties.height) || 0, label: f.properties.height }
    }))
  };

  const lotSize = {
    type: 'FeatureCollection',
    features: zoning.features.filter((f) => f.properties.lot_size !== 'N/A').map((f) => ({
      ...f,
      properties: { ...f.properties, lot_m2: parseInt(f.properties.lot_size) || 0, label: f.properties.lot_size }
    }))
  };

  const heritage = {
    type: 'FeatureCollection',
    features: [
      rect(150.904, -33.769, 0.002, 0.0015, { name: 'Blacktown Heritage Cottage', grade: 'Local', year: '1890', lga: 'Blacktown' }),
      rect(151.010, -33.815, 0.003, 0.002, { name: 'Parramatta Heritage Precinct', grade: 'State', year: '1810', lga: 'Parramatta' }),
      rect(150.890, -33.760, 0.004, 0.003, { name: 'Prospect Conservation Area', grade: 'Local', year: '1920', lga: 'Blacktown' }),
      rect(150.908, -33.771, 0.002, 0.0015, { name: 'Flushcombe Road Heritage Streetscape', grade: 'Local', year: '1925', lga: 'Blacktown' })
    ]
  };

  /* ── Cadastre & Urbane portfolio ────────────────────────── */
  const parcels = {
    type: 'FeatureCollection',
    features: [
      rect(150.9055, -33.7692, 0.0012, 0.0008, { lot: '1', dp: 'DP1234567', area: '612m²', address: '9/18 Third Avenue, Blacktown' }),
      rect(150.9068, -33.7685, 0.001, 0.0007, { lot: '2', dp: 'DP1234567', area: '580m²', address: '29 Paul Street, Blacktown' }),
      rect(150.9042, -33.7701, 0.0011, 0.0009, { lot: '15A', dp: 'DP987654', area: '445m²', address: '15A Cansdale Street, Blacktown' }),
      rect(150.9080, -33.7670, 0.0013, 0.001, { lot: '7', dp: 'DP555123', area: '720m²', address: '3 Loy Place, Quakers Hill' }),
      rect(150.9020, -33.7715, 0.001, 0.0008, { lot: '4', dp: 'DP444321', area: '510m²', address: '13/18 Marcia Street, Toongabbie' }),
      rect(151.002, -33.825, 0.0015, 0.0012, { lot: '12', dp: 'DP778899', area: '380m²', address: '4508/57-59 Queen Street, Auburn' })
    ]
  };

  const addresses = {
    type: 'FeatureCollection',
    features: parcels.features.map((f) => {
      const c = f.geometry.coordinates[0];
      const lng = (c[0][0] + c[2][0]) / 2;
      const lat = (c[0][1] + c[2][1]) / 2;
      return point(lng, lat, { address: f.properties.address });
    })
  };

  const listings = {
    type: 'FeatureCollection',
    features: [
      point(150.9058, -33.7688, { address: '9/18 Third Avenue, Blacktown', price: 'Office HQ', status: 'Agency', beds: '—' }),
      point(150.9070, -33.7682, { address: '29 Paul Street, Blacktown', price: '$770/wk', status: 'For Rent', beds: '4' }),
      point(150.9048, -33.7696, { address: '15A Cansdale Street, Blacktown', price: '$580/wk', status: 'Under Application', beds: '2' }),
      point(151.0028, -33.8244, { address: '4508/57-59 Queen Street, Auburn', price: 'Contact Agent', status: 'For Sale', beds: '3' }),
      point(150.9085, -33.7665, { address: '3 Loy Place, Quakers Hill', price: '$750/wk', status: 'For Rent', beds: '4' }),
      point(150.9025, -33.7711, { address: '13/18 Marcia Street, Toongabbie', price: '$900/wk', status: 'For Rent', beds: '4' }),
      point(150.855, -33.658, { address: '25 Grantham Street, Grantham Farm', price: '$1,300,000', status: 'Sold (May 2026)', beds: '5' }),
      point(150.868, -33.768, { address: '12/7 Graham Street, Doonside', price: '$820,000', status: 'Sold (Jun 2026)', beds: '3' }),
      point(150.725, -33.758, { address: '23/29 Bringelly Road, Kingswood', price: '$820,000', status: 'Sold (May 2026)', beds: '3' })
    ]
  };

  /* ── Environmental constraints (Western Sydney) ─────────── */
  const flood = {
    type: 'FeatureCollection',
    features: [
      rect(150.915, -33.775, 0.006, 0.004, { category: 'Flood Planning Area', aep: '1% AEP', pmf: false, waterway: 'Blacktown Creek' }),
      rect(150.878, -33.762, 0.005, 0.003, { category: 'Floodway', aep: 'PMF', pmf: true, waterway: 'Eastern Creek' }),
      rect(151.020, -33.830, 0.008, 0.005, { category: 'Flood Planning Area', aep: '1% AEP', pmf: false, waterway: 'Parramatta River' }),
      rect(150.810, -33.720, 0.012, 0.008, { category: 'Flood Planning Area', aep: '1% AEP', pmf: false, waterway: 'South Creek — Marsden Park' }),
      rect(150.770, -33.770, 0.008, 0.006, { category: 'Overland Flow Path', aep: '1% AEP', pmf: false, waterway: 'South Creek tributary' })
    ]
  };

  const bushfire = {
    type: 'FeatureCollection',
    features: [
      rect(150.940, -33.745, 0.020, 0.015, { category: 'Bush Fire Prone Land', bal: 'BAL-19', vegetation: 'Forest', lga: 'Blacktown' }),
      rect(150.860, -33.740, 0.015, 0.012, { category: 'Bush Fire Prone Land', bal: 'BAL-12.5', vegetation: 'Woodland', lga: 'Blacktown' }),
      rect(151.080, -33.720, 0.025, 0.018, { category: 'Bush Fire Prone Land', bal: 'BAL-29', vegetation: 'Forest', lga: 'The Hills' }),
      rect(150.730, -33.720, 0.030, 0.022, { category: 'Bush Fire Prone Land', bal: 'BAL-19', vegetation: 'Cumberland Plain Woodland', lga: 'Penrith' })
    ]
  };

  const biodiversity = {
    type: 'FeatureCollection',
    features: [
      rect(150.925, -33.748, 0.012, 0.010, { category: 'Vegetation Category 2', significance: 'Local', species: 'Cumberland Plain' }),
      rect(150.855, -33.778, 0.010, 0.008, { category: 'Vegetation Category 1', significance: 'Regional', species: 'Shale gravel transition forest' }),
      rect(151.050, -33.710, 0.015, 0.012, { category: 'Koala Habitat', significance: 'State', species: 'Koala (endangered population)' }),
      rect(150.815, -33.725, 0.018, 0.014, { category: 'Riparian Corridor', significance: 'Local', species: 'South Creek riparian zone' })
    ]
  };

  const contamination = {
    type: 'FeatureCollection',
    features: [
      point(150.875, -33.788, { site: 'Former landfill', status: 'Remediation complete', year: '2018', register: 'NSW EPA CLM' }),
      point(150.930, -33.795, { site: 'Industrial spill site', status: 'Under management', year: '2022', register: 'NSW EPA CLM' }),
      point(150.868, -33.782, { site: 'Prospect industrial legacy', status: 'Monitored', year: '2015', register: 'NSW EPA CLM' })
    ]
  };

  /* ── Demographics from ABS 2021 Census SA2 ──────────────── */
  const population = {
    type: 'FeatureCollection',
    features: (R?.sa2Regions || []).map((s) =>
      rect(s.lng, s.lat, s.w, s.h, {
        sa2: s.sa2, pop: s.pop, density: s.density,
        label: s.density.toLocaleString() + '/km²', source: s.source
      })
    )
  };

  const income = {
    type: 'FeatureCollection',
    features: (R?.sa2Regions || []).map((s) =>
      rect(s.lng, s.lat, s.w, s.h, {
        sa2: s.sa2, median_income: s.medianIncome,
        label: '$' + Math.round(s.medianIncome / 1000) + 'k p.a.', source: s.source
      })
    )
  };

  const age = {
    type: 'FeatureCollection',
    features: (R?.sa2Regions || []).map((s) =>
      rect(s.lng, s.lat, s.w, s.h, {
        sa2: s.sa2, median_age: s.medianAge,
        label: s.medianAge + ' years', source: s.source
      })
    )
  };

  const growth = {
    type: 'FeatureCollection',
    features: (R?.sa2Regions || []).map((s) =>
      rect(s.lng, s.lat, s.w, s.h, {
        sa2: s.sa2, growth_pct: s.growth,
        label: s.growth.toFixed(1) + '% p.a.', source: s.source
      })
    )
  };

  /* ── Transport: researched rail corridors ───────────────── */
  const rail = {
    type: 'FeatureCollection',
    features: (R?.railLines || []).filter((r) => r.stations).map((r) =>
      line(stationCoords(r.stations), { name: r.name, operator: r.operator, status: r.status || 'Operational' })
    )
  };

  const metro = {
    type: 'FeatureCollection',
    features: [
      line(stationCoords(['Parramatta', 'Westmead', 'St Marys']), { name: 'Sydney Metro West', status: 'Under construction', operator: 'Sydney Metro' }),
      line([[150.910, -33.770], [150.930, -33.780], [150.950, -33.790]], { name: 'Parramatta Light Rail (Stage 1)', status: 'Operational', operator: 'Transport for NSW' })
    ]
  };

  const stations = {
    type: 'FeatureCollection',
    features: (R?.stations || []).map((s) =>
      point(s.lng, s.lat, {
        name: s.name, code: s.code, lines: s.lines.join(', '), lga: s.lga,
        tod: s.tod ? 'Yes' : 'No', lmr: s.lmr ? 'Yes' : 'No',
        corridor: s.corridor ? 'Mt Druitt–Toongabbie' : ''
      })
    )
  };

  const employment = {
    type: 'FeatureCollection',
    features: [
      point(151.050, -33.870, { name: 'Parramatta CBD', jobs: 52000, lga: 'Parramatta' }),
      point(150.907, -33.770, { name: 'Blacktown CBD', jobs: 18500, lga: 'Blacktown' }),
      point(150.697, -33.750, { name: 'Penrith CBD', jobs: 12000, lga: 'Penrith' }),
      point(151.000, -33.820, { name: 'Olympic Park', jobs: 28000, lga: 'Cumberland' }),
      point(150.805, -33.715, { name: 'Marsden Park Employment', jobs: 3900, lga: 'Blacktown', note: 'Marsden Park North rezoning' }),
      point(150.785, -33.935, { name: 'Bradfield City Centre (Aerotropolis)', jobs: 200000, lga: 'Liverpool', note: 'Western Sydney Airport catalyst' })
    ]
  };

  /* ── Strategic planning layers ──────────────────────────── */
  const precincts = {
    type: 'FeatureCollection',
    features: (R?.growthPrecincts || []).map((p) =>
      rect(p.lng, p.lat, p.w, p.h, {
        name: p.name, lga: p.lga, status: p.status,
        dwellings: p.dwellings || '—', jobs: p.jobs || '—',
        note: p.note || ''
      })
    )
  };

  const tod = {
    type: 'FeatureCollection',
    features: (R?.stations || []).filter((s) => s.tod).flatMap((s) => [
      circlePolygon(s.lng, s.lat, 400, 48, { name: s.name + ' TOD (400m)', radius: '400m', policy: 'TOD SEPP', fsr_bonus: 'State controls' }),
      circlePolygon(s.lng, s.lat, 800, 48, { name: s.name + ' TOD (800m)', radius: '800m', policy: 'TOD Program', fsr_bonus: 'Mixed-use uplift' })
    ])
  };

  const lmr = {
    type: 'FeatureCollection',
    features: (R?.stations || []).filter((s) => s.lmr).map((s) =>
      circlePolygon(s.lng, s.lat, 800, 48, {
        name: s.name + ' LMR Area', radius: '800m', policy: 'LMR Housing SEPP Stage 2',
        max_storeys: '6', effective: '28 Feb 2025'
      })
    )
  };

  const corridor = {
    type: 'FeatureCollection',
    features: [
      line(stationCoords(['Mount Druitt', 'Rooty Hill', 'Doonside', 'Blacktown', 'Seven Hills', 'Toongabbie']), {
        name: 'Mt Druitt–Toongabbie Rail Corridor',
        dwellings: '50,000 capacity test',
        lmr_potential: '23,000',
        status: R?.policies?.corridor?.status || 'Draft'
      })
    ]
  };

  const corridorArea = {
    type: 'FeatureCollection',
    features: [
      rect(150.810, -33.790, 0.155, 0.035, {
        name: 'Corridor Study Area',
        area_ha: R?.policies?.corridor?.areaHa || 6524,
        avg_density: R?.policies?.corridor?.avgDensity || '6 dwellings/ha',
        council: 'Blacktown City Council',
        label: '6,524 ha'
      })
    ]
  };

  const rezoning = {
    type: 'FeatureCollection',
    features: [
      line([[150.910, -33.760], [150.920, -33.755], [150.930, -33.750], [150.940, -33.748]], { name: 'Blacktown South Rezoning PP', from: 'R2', to: 'R4', status: 'On exhibition' }),
      line([[150.870, -33.790], [150.880, -33.785], [150.890, -33.780]], { name: 'Prospect Industrial Transition', from: 'IN1', to: 'B6', status: 'Approved' }),
      rect(150.805, -33.715, 0.035, 0.028, { name: 'Marsden Park North Rezoning', from: 'RU4/E3', to: 'E3/R2', status: 'Post-exhibition Jan 2026' })
    ]
  };

  const lga = {
    type: 'FeatureCollection',
    features: [
      rect(150.750, -33.820, 0.200, 0.120, { name: 'Blacktown', population: '450,000 (2025)', target: '46,000 homes by 2029 (NW Accord)' }),
      rect(150.980, -33.880, 0.080, 0.070, { name: 'Parramatta', population: '256,000', role: 'Central River City' }),
      rect(151.000, -33.860, 0.070, 0.060, { name: 'Cumberland', population: '248,000', role: 'Parramatta corridor' }),
      rect(150.650, -33.780, 0.120, 0.100, { name: 'Penrith', population: '217,000', role: 'Western Parkland City' }),
      rect(150.900, -33.680, 0.100, 0.080, { name: 'The Hills', population: '198,000', role: 'North West Growth Area' })
    ]
  };

  const serviceArea = {
    type: 'FeatureCollection',
    features: [
      rect(150.700, -33.900, 0.380, 0.280, {
        name: 'Urbane Service Footprint',
        suburbs: R?.urbane?.serviceSuburbs || 58,
        corridors: 'Blacktown · Parramatta · Growth · Penrith',
        hq: '9/18 Third Avenue, Blacktown'
      })
    ]
  };

  const competitors = {
    type: 'FeatureCollection',
    features: (R?.urbane?.competitors || []).map((c) =>
      point(c.lng, c.lat, { name: c.name, address: c.address, sold12Mo: c.sold12Mo || '—' })
    )
  };

  const lots = typeof MBOARD_LOTS !== 'undefined' ? MBOARD_LOTS.lots : parcels;
  const lotGrid = typeof MBOARD_LOTS !== 'undefined' ? MBOARD_LOTS.lotGrid : parcels;
  const lotLabels = typeof MBOARD_LOTS !== 'undefined' ? MBOARD_LOTS.lotLabels : addresses;

  const sourceMap = {
    zoning, fsr, heights, 'lot-size': lotSize, heritage,
    lots, 'lot-grid': lotGrid, 'lot-labels': lotLabels,
    parcels, addresses, listings,
    flood, bushfire, biodiversity, contamination,
    population, income, age, growth,
    rail, metro, stations, employment,
    precincts, tod, lmr, corridor, 'corridor-area': corridorArea, rezoning,
    lga, 'service-area': serviceArea, competitors
  };

  return {
    sourceMap, zoning, parcels, lots, listings, research: R,
    lotLookup: typeof MBOARD_LOTS !== 'undefined' ? MBOARD_LOTS.lotLookup : {},
    lotCount: typeof MBOARD_LOTS !== 'undefined' ? MBOARD_LOTS.count : parcels.features.length
  };
})();
