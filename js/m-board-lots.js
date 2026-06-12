/**
 * M-Board Cadastral Grid — Mecone Mosaic-style lot registry with premium metadata
 * Blacktown CBD block study area (Third Avenue / Main Street precinct)
 */
const MBOARD_LOTS = (() => {
  const ZONES = {
    B2: { name: 'Local Centre', fsr: '2:1', height: '16m', color: '#60a5fa', minLot: 'N/A' },
    R3: { name: 'Medium Density Residential', fsr: '0.9:1', height: '12m', color: '#facc15', minLot: '450m²' },
    R2: { name: 'Low Density Residential', fsr: '0.5:1', height: '9m', color: '#fde047', minLot: '600m²' },
    R4: { name: 'High Density Residential', fsr: '1.5:1', height: '21m', color: '#eab308', minLot: 'N/A' },
    SP2: { name: 'Infrastructure', fsr: 'N/A', height: 'N/A', color: '#4ade80', minLot: 'N/A' }
  };

  const STREETS = {
    thirdAve: { name: 'Third Avenue', type: 'Local' },
    mainSt: { name: 'Main Street', type: 'Arterial' },
    flushcombe: { name: 'Flushcombe Road', type: 'Arterial' },
    campbell: { name: 'Campbell Street', type: 'Local' },
    harvey: { name: 'Harvey Street', type: 'Local' }
  };

  function lotRect(lng, lat, w, h, meta) {
    const zone = ZONES[meta.zone] || ZONES.R2;
    const areaM2 = meta.area_m2 || Math.round(w * 111320 * Math.cos(lat * Math.PI / 180) * h * 111320);
    const lotId = meta.lot_id || `${meta.lot}/${meta.dp}`;
    return {
      type: 'Feature',
      id: lotId,
      properties: {
        lot_id: lotId,
        lot: meta.lot,
        section: meta.section || '—',
        dp: meta.dp,
        plan_type: meta.plan_type || 'DP',
        address: meta.address || '',
        suburb: meta.suburb || 'Blacktown',
        postcode: meta.postcode || '2148',
        parish: meta.parish || 'St Matthew',
        lga: 'Blacktown',
        lep: 'Blacktown LEP 2015',
        zone: meta.zone,
        zone_name: zone.name,
        fsr: zone.fsr,
        height: zone.height,
        min_lot_size: zone.minLot,
        area_m2: areaM2,
        area_display: areaM2 + 'm²',
        frontage_m: meta.frontage_m || Math.round(w * 111320 * Math.cos(lat * Math.PI / 180)),
        depth_m: meta.depth_m || Math.round(h * 111320),
        land_use: meta.land_use || 'Residential',
        dwelling_type: meta.dwelling_type || 'Dwelling house',
        strata: meta.strata || 'No',
        owner_type: meta.owner_type || 'Private',
        title_ref: meta.title_ref || `TITLE ${meta.lot}/${meta.dp}`,
        last_sale_date: meta.last_sale_date || null,
        last_sale_price: meta.last_sale_price || null,
        valuation_land: meta.valuation_land || null,
        valuation_total: meta.valuation_total || null,
        rates_annual: meta.rates_annual || null,
        flood: meta.flood || 'Clear',
        bushfire: meta.bushfire || 'Not mapped',
        heritage: meta.heritage || 'None',
        biodiversity: meta.biodiversity || 'None',
        contamination: meta.contamination || 'None',
        easements: meta.easements || 'None identified',
        tod: meta.tod || 'Yes — 400m Blacktown Station',
        lmr: meta.lmr || 'Yes — 800m Blacktown Station',
        corridor: meta.corridor || 'Mt Druitt–Toongabbie',
        da_number: meta.da_number || null,
        da_status: meta.da_status || null,
        da_description: meta.da_description || null,
        da_lodged: meta.da_lodged || null,
        listing_status: meta.listing_status || null,
        listing_price: meta.listing_price || null,
        beds: meta.beds || null,
        baths: meta.baths || null,
        cars: meta.cars || null,
        year_built: meta.year_built || null,
        storeys: meta.storeys || null,
        metadata_source: 'NSW Lot Search · Valuer General · Blacktown LEP 2015',
        metadata_updated: 'June 2026',
        premium: true
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [lng, lat], [lng + w, lat], [lng + w, lat + h], [lng, lat + h], [lng, lat]
        ]]
      }
    };
  }

  /** Generate Mecone-style cadastral grid block */
  function generateGrid(originLng, originLat, cols, rows, cellW, cellH, defaults) {
    const features = [];
    let lotNum = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const w = cellW * (c % 3 === 0 ? 1.2 : c % 2 === 0 ? 0.9 : 1);
        const h = cellH * (r % 2 === 0 ? 1 : 0.85);
        const lng = originLng + c * cellW * 1.02;
        const lat = originLat - r * cellH * 1.02;
        const zone = r === 0 && c < 4 ? 'B2' : r < 2 && c < 2 ? 'R4' : r > 3 ? 'R2' : 'R3';
        const dp = r < 2 ? 'DP1234567' : r < 4 ? 'DP987654' : 'DP555123';
        features.push(lotRect(lng, lat, w, h, {
          lot: String(lotNum++),
          section: String.fromCharCode(65 + (r % 4)),
          dp,
          zone,
          ...defaults,
          address: defaults.addressPrefix ? `${lotNum - 1} ${defaults.addressPrefix}` : ''
        }));
      }
    }
    return features;
  }

  const premiumLots = [
    lotRect(150.9055, -33.7692, 0.0012, 0.0008, {
      lot: '1', section: 'A', dp: 'DP1234567', zone: 'B2',
      address: '9/18 Third Avenue, Blacktown', strata: 'Yes — Strata Plan SP98765',
      land_use: 'Commercial / Office', dwelling_type: 'Strata unit — commercial suite',
      area_m2: 612, frontage_m: 12, depth_m: 51,
      owner_type: 'Urbane Real Estate Pty Ltd',
      last_sale_date: 'Mar 2020', last_sale_price: '$485,000',
      valuation_land: '$420,000', valuation_total: '$612,000', rates_annual: '$2,840',
      listing_status: 'Agency HQ', listing_price: 'Office HQ',
      year_built: 1985, storeys: 2, beds: null, baths: 1, cars: 2,
      easements: 'Right of carriageway — Third Avenue',
      da_number: 'DA-2020/0892', da_status: 'Determined — Approved',
      da_description: 'Change of use to real estate office', da_lodged: 'Jan 2020'
    }),
    lotRect(150.9068, -33.7685, 0.0010, 0.0007, {
      lot: '2', section: 'A', dp: 'DP1234567', zone: 'R3',
      address: '29 Paul Street, Blacktown',
      area_m2: 580, frontage_m: 15, depth_m: 39,
      last_sale_date: 'Nov 2019', last_sale_price: '$720,000',
      valuation_land: '$580,000', valuation_total: '$890,000', rates_annual: '$2,120',
      listing_status: 'For Rent', listing_price: '$770/week',
      beds: 4, baths: 1, cars: 1, year_built: 1972, storeys: 1,
      land_use: 'Residential', dwelling_type: 'Freestanding house'
    }),
    lotRect(150.9042, -33.7701, 0.0011, 0.0009, {
      lot: '15A', section: 'B', dp: 'DP987654', zone: 'R3',
      address: '15A Cansdale Street, Blacktown',
      area_m2: 445, frontage_m: 10, depth_m: 45,
      valuation_total: '$655,000', rates_annual: '$1,890',
      listing_status: 'Under Application', listing_price: '$580/week',
      beds: 2, baths: 1, cars: 1, year_built: 1968, storeys: 1,
      flood: 'Clear', heritage: 'None'
    }),
    lotRect(150.9050, -33.7680, 0.0009, 0.0006, {
      lot: '3', section: 'A', dp: 'DP1234567', zone: 'B2',
      address: '12 Main Street, Blacktown',
      area_m2: 420, land_use: 'Retail', dwelling_type: 'Shop top housing',
      valuation_total: '$1,240,000', storeys: 2,
      da_number: 'DA-2025/1247', da_status: 'Under assessment',
      da_description: 'Shop top housing — 4 dwellings above retail', da_lodged: 'Sep 2025'
    }),
    lotRect(150.9045, -33.7675, 0.0010, 0.0007, {
      lot: '4', section: 'A', dp: 'DP1234567', zone: 'B2',
      address: '14 Main Street, Blacktown',
      area_m2: 510, land_use: 'Retail', dwelling_type: 'Commercial',
      last_sale_date: 'Jun 2024', last_sale_price: '$1,850,000',
      valuation_total: '$2,100,000', year_built: 1960, storeys: 1
    }),
    lotRect(150.9072, -33.7678, 0.0008, 0.0006, {
      lot: '5', section: 'A', dp: 'DP1234567', zone: 'R4',
      address: '22 Third Avenue, Blacktown',
      area_m2: 380, land_use: 'Residential flat building',
      dwelling_type: 'Residential flat building', storeys: 4,
      valuation_total: '$1,450,000',
      da_number: 'DA-2024/0891', da_status: 'Approved', da_description: '4-storey apartment building (12 units)'
    }),
    lotRect(150.9038, -33.7695, 0.0011, 0.0008, {
      lot: '8', section: 'B', dp: 'DP987654', zone: 'R2',
      address: '6 Campbell Street, Blacktown',
      area_m2: 650, frontage_m: 18, depth_m: 36,
      last_sale_date: 'Dec 2025', last_sale_price: '$1,500,000',
      valuation_total: '$1,520,000', beds: 4, baths: 2, cars: 2, year_built: 1988
    }),
    lotRect(150.9062, -33.7705, 0.0010, 0.0008, {
      lot: '10', section: 'B', dp: 'DP987654', zone: 'R3',
      address: '8 Harvey Street, Blacktown',
      area_m2: 520, beds: 3, baths: 2, cars: 1, year_built: 1975,
      listing_status: 'Off-market', valuation_total: '$780,000'
    }),
    lotRect(150.9078, -33.7690, 0.0012, 0.0007, {
      lot: '6', section: 'A', dp: 'DP1234567', zone: 'SP2',
      address: 'Blacktown Station Car Park (part)',
      land_use: 'Infrastructure', dwelling_type: 'Transport infrastructure',
      area_m2: 2400, owner_type: 'Transport Asset Holding Entity',
      flood: 'Overland flow — minor', easements: 'Rail corridor — 30m setback'
    }),
    lotRect(150.9030, -33.7682, 0.0013, 0.0009, {
      lot: '11', section: 'C', dp: 'DP444321', zone: 'R3',
      address: '45 Flushcombe Road, Blacktown',
      area_m2: 720, frontage_m: 20, depth_m: 36,
      valuation_total: '$950,000', heritage: 'Local — streetscape contribution'
    })
  ];

  const gridBlock = generateGrid(150.9025, -33.7672, 6, 5, 0.00055, 0.00042, {
    suburb: 'Blacktown', postcode: '2148',
    addressPrefix: 'Third Avenue, Blacktown'
  });

  const existingIds = new Set(premiumLots.map((f) => f.id));
  const gridFiltered = gridBlock.filter((f) => !existingIds.has(f.id));

  const allLots = [...premiumLots, ...gridFiltered];

  allLots.forEach((f, i) => {
    if (!f.properties.valuation_total && f.properties.zone !== 'SP2') {
      const base = f.properties.area_m2 * (f.properties.zone === 'B2' ? 2800 : 1400);
      f.properties.valuation_land = '$' + Math.round(base * 0.65).toLocaleString();
      f.properties.valuation_total = '$' + Math.round(base).toLocaleString();
      f.properties.rates_annual = '$' + Math.round(base * 0.004).toLocaleString();
    }
    if (!f.properties.last_sale_date && i % 4 === 0) {
      f.properties.last_sale_date = ['Mar 2023', 'Aug 2024', 'Feb 2025', 'Nov 2025'][i % 4];
      f.properties.last_sale_price = '$' + (600000 + i * 45000).toLocaleString();
    }
  });

  const lots = { type: 'FeatureCollection', features: allLots };

  const lotGrid = {
    type: 'FeatureCollection',
    features: allLots.map((f) => ({
      type: 'Feature',
      properties: { lot_id: f.properties.lot_id, zone: f.properties.zone },
      geometry: f.geometry
    }))
  };

  const lotLabels = {
    type: 'FeatureCollection',
    features: allLots.map((f) => {
      const c = f.geometry.coordinates[0];
      const lng = (c[0][0] + c[2][0]) / 2;
      const lat = (c[0][1] + c[2][1]) / 2;
      const dpShort = String(f.properties.dp || '').replace(/^DP/i, 'DP');
      const label = `${f.properties.lot}/${dpShort}`;
      return {
        type: 'Feature',
        properties: {
          label,
          lot: f.properties.lot,
          dp: f.properties.dp,
          lot_id: f.properties.lot_id,
          zone: f.properties.zone,
          address: f.properties.address || ''
        },
        geometry: { type: 'Point', coordinates: [lng, lat] }
      };
    })
  };

  const lotLookup = Object.fromEntries(allLots.map((f) => [f.properties.lot_id, f.properties]));

  return { lots, lotGrid, lotLabels, lotLookup, ZONES, count: allLots.length };
})();
