/**
 * M-Board sample spatial data — Greater Western Sydney & Australia-wide reference layers
 * Demonstration datasets modelled on NSW planning portal structure
 */
const MBOARD_DATA = (() => {
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

  const zoning = {
    type: 'FeatureCollection',
    features: [
      rect(150.898, -33.772, 0.008, 0.006, { zone: 'R3', name: 'Medium Density Residential', lga: 'Blacktown', fsr: '0.9:1', height: '12m', lot_size: '450m²' }),
      rect(150.906, -33.768, 0.006, 0.005, { zone: 'B2', name: 'Local Centre', lga: 'Blacktown', fsr: '2:1', height: '16m', lot_size: 'N/A' }),
      rect(150.912, -33.765, 0.007, 0.005, { zone: 'R4', name: 'High Density Residential', lga: 'Blacktown', fsr: '1.5:1', height: '21m', lot_size: 'N/A' }),
      rect(150.885, -33.758, 0.01, 0.008, { zone: 'R2', name: 'Low Density Residential', lga: 'Blacktown', fsr: '0.5:1', height: '9m', lot_size: '600m²' }),
      rect(150.920, -33.780, 0.009, 0.007, { zone: 'R1', name: 'General Residential', lga: 'Blacktown', fsr: '0.45:1', height: '8.5m', lot_size: '700m²' }),
      rect(150.870, -33.785, 0.012, 0.009, { zone: 'IN1', name: 'General Industrial', lga: 'Blacktown', fsr: '1:1', height: '15m', lot_size: 'N/A' }),
      rect(150.935, -33.755, 0.008, 0.006, { zone: 'SP2', name: 'Infrastructure', lga: 'Blacktown', fsr: 'N/A', height: 'N/A', lot_size: 'N/A' }),
      rect(150.950, -33.770, 0.015, 0.012, { zone: 'RU4', name: 'Primary Production Small Lots', lga: 'Blacktown', fsr: '0.25:1', height: '9m', lot_size: '4000m²' }),
      rect(151.000, -33.820, 0.02, 0.015, { zone: 'R3', name: 'Medium Density Residential', lga: 'Parramatta', fsr: '0.9:1', height: '14m', lot_size: '400m²' }),
      rect(151.050, -33.850, 0.018, 0.014, { zone: 'B4', name: 'Mixed Use', lga: 'Parramatta', fsr: '3:1', height: '45m', lot_size: 'N/A' }),
      rect(150.750, -33.750, 0.025, 0.02, { zone: 'R2', name: 'Low Density Residential', lga: 'Penrith', fsr: '0.5:1', height: '9m', lot_size: '550m²' }),
      rect(151.100, -33.900, 0.03, 0.025, { zone: 'E1', name: 'Local Centre', lga: 'Cumberland', fsr: '1.5:1', height: '18m', lot_size: 'N/A' })
    ]
  };

  const fsr = {
    type: 'FeatureCollection',
    features: zoning.features.map(f => ({
      ...f,
      properties: { ...f.properties, fsr_value: parseFloat(f.properties.fsr) || 0, label: f.properties.fsr }
    }))
  };

  const heights = {
    type: 'FeatureCollection',
    features: zoning.features.map(f => ({
      ...f,
      properties: { ...f.properties, height_m: parseFloat(f.properties.height) || 0, label: f.properties.height }
    }))
  };

  const lotSize = {
    type: 'FeatureCollection',
    features: zoning.features.filter(f => f.properties.lot_size !== 'N/A').map(f => ({
      ...f,
      properties: { ...f.properties, lot_m2: parseInt(f.properties.lot_size) || 0, label: f.properties.lot_size }
    }))
  };

  const heritage = {
    type: 'FeatureCollection',
    features: [
      rect(150.904, -33.769, 0.002, 0.0015, { name: 'Blacktown Heritage Cottage', grade: 'Local', year: '1890' }),
      rect(151.010, -33.815, 0.003, 0.002, { name: 'Parramatta Heritage Precinct', grade: 'State', year: '1810' }),
      rect(150.890, -33.760, 0.004, 0.003, { name: 'Prospect Conservation Area', grade: 'Local', year: '1920' })
    ]
  };

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
    features: parcels.features.map(f => {
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
      point(150.9025, -33.7711, { address: '13/18 Marcia Street, Toongabbie', price: '$900/wk', status: 'For Rent', beds: '4' })
    ]
  };

  const flood = {
    type: 'FeatureCollection',
    features: [
      rect(150.915, -33.775, 0.006, 0.004, { category: 'Flood Planning Area', aep: '1% AEP', pmf: false }),
      rect(150.878, -33.762, 0.005, 0.003, { category: 'Floodway', aep: 'PMF', pmf: true }),
      rect(151.020, -33.830, 0.008, 0.005, { category: 'Flood Planning Area', aep: '1% AEP', pmf: false })
    ]
  };

  const bushfire = {
    type: 'FeatureCollection',
    features: [
      rect(150.940, -33.745, 0.02, 0.015, { category: 'Bush Fire Prone Land', bal: 'BAL-19', vegetation: 'Forest' }),
      rect(150.860, -33.740, 0.015, 0.012, { category: 'Bush Fire Prone Land', bal: 'BAL-12.5', vegetation: 'Woodland' }),
      rect(151.080, -33.720, 0.025, 0.018, { category: 'Bush Fire Prone Land', bal: 'BAL-29', vegetation: 'Forest' })
    ]
  };

  const biodiversity = {
    type: 'FeatureCollection',
    features: [
      rect(150.925, -33.748, 0.012, 0.01, { category: 'Vegetation Category 2', significance: 'Local' }),
      rect(150.855, -33.778, 0.01, 0.008, { category: 'Vegetation Category 1', significance: 'Regional' }),
      rect(151.050, -33.710, 0.015, 0.012, { category: 'Koala Habitat', significance: 'State' })
    ]
  };

  const contamination = {
    type: 'FeatureCollection',
    features: [
      point(150.875, -33.788, { site: 'Former landfill', status: 'Remediation complete', year: '2018' }),
      point(150.930, -33.795, { site: 'Industrial spill site', status: 'Under management', year: '2022' })
    ]
  };

  const population = {
    type: 'FeatureCollection',
    features: [
      rect(150.895, -33.775, 0.025, 0.02, { sa2: 'Blacktown - South', pop: 28400, density: 3200, label: '3,200/km²' }),
      rect(150.920, -33.755, 0.02, 0.015, { sa2: 'Blacktown - North', pop: 22100, density: 2100, label: '2,100/km²' }),
      rect(151.000, -33.820, 0.03, 0.025, { sa2: 'Parramatta - Central', pop: 35600, density: 4800, label: '4,800/km²' }),
      rect(150.750, -33.750, 0.035, 0.03, { sa2: 'Penrith - East', pop: 18900, density: 1500, label: '1,500/km²' })
    ]
  };

  const incomeValues = [72000, 68000, 95000, 61000];
  const income = {
    type: 'FeatureCollection',
    features: population.features.map((f, i) => ({
      ...f,
      properties: { ...f.properties, median_income: incomeValues[i], label: '$' + (incomeValues[i] / 1000) + 'k' }
    }))
  };

  const age = {
    type: 'FeatureCollection',
    features: population.features.map((f, i) => ({
      ...f,
      properties: { ...f.properties, median_age: 32 + i * 3, label: (32 + i * 3) + ' years' }
    }))
  };

  const growth = {
    type: 'FeatureCollection',
    features: population.features.map((f, i) => ({
      ...f,
      properties: { ...f.properties, growth_pct: 1.2 + i * 0.8, label: (1.2 + i * 0.8).toFixed(1) + '% p.a.' }
    }))
  };

  const rail = {
    type: 'FeatureCollection',
    features: [
      line([[150.85, -33.75], [150.88, -33.76], [150.91, -33.77], [150.95, -33.78], [151.00, -33.82], [151.05, -33.87]], { name: 'T1 Western Line', operator: 'Sydney Trains' }),
      line([[150.90, -33.73], [150.92, -33.75], [150.94, -33.77], [150.96, -33.79]], { name: 'T5 Cumberland Line', operator: 'Sydney Trains' }),
      line([[151.00, -33.80], [151.02, -33.82], [151.05, -33.85], [151.08, -33.88]], { name: 'T2 Inner West', operator: 'Sydney Trains' })
    ]
  };

  const metro = {
    type: 'FeatureCollection',
    features: [
      line([[151.00, -33.82], [151.02, -33.84], [151.04, -33.86]], { name: 'Sydney Metro West (planned)', status: 'Under construction' }),
      line([[150.91, -33.77], [150.93, -33.78], [150.95, -33.79]], { name: 'Parramatta Light Rail', status: 'Operational' })
    ]
  };

  const employment = {
    type: 'FeatureCollection',
    features: [
      point(151.05, -33.87, { name: 'Parramatta CBD', jobs: 52000 }),
      point(150.91, -33.77, { name: 'Blacktown CBD', jobs: 18500 }),
      point(150.75, -33.75, { name: 'Penrith CBD', jobs: 12000 }),
      point(151.00, -33.82, { name: 'Olympic Park', jobs: 28000 })
    ]
  };

  const precincts = {
    type: 'FeatureCollection',
    features: [
      rect(150.780, -33.730, 0.04, 0.03, { name: 'Marsden Park Growth Area', dwellings: 12000, status: 'Active' }),
      rect(150.850, -33.710, 0.035, 0.028, { name: 'Schofields Precinct', dwellings: 8500, status: 'Active' }),
      rect(150.920, -33.700, 0.03, 0.025, { name: 'Box Hill Release', dwellings: 15000, status: 'Planned' })
    ]
  };

  const tod = {
    type: 'FeatureCollection',
    features: [
      rect(150.905, -33.768, 0.008, 0.006, { name: 'Blacktown TOD', radius: '800m', fsr_bonus: '+0.3' }),
      rect(151.002, -33.824, 0.006, 0.005, { name: 'Auburn TOD', radius: '600m', fsr_bonus: '+0.5' })
    ]
  };

  const rezoning = {
    type: 'FeatureCollection',
    features: [
      line([[150.910, -33.760], [150.920, -33.755], [150.930, -33.750], [150.940, -33.748]], { name: 'Blacktown South Rezoning PP', from: 'R2', to: 'R4', status: 'On exhibition' }),
      line([[150.870, -33.790], [150.880, -33.785], [150.890, -33.780]], { name: 'Prospect Industrial Transition', from: 'IN1', to: 'B6', status: 'Approved' })
    ]
  };

  const sourceMap = {
    zoning, fsr, heights, 'lot-size': lotSize, heritage,
    parcels, addresses, listings,
    flood, bushfire, biodiversity, contamination,
    population, income, age, growth,
    rail, metro, employment,
    precincts, tod, rezoning
  };

  return { sourceMap, zoning, parcels, listings };
})();
