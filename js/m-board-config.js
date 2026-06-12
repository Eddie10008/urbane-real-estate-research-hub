/**
 * M-Board configuration — basemaps, layer catalogue, jurisdiction presets
 * Inspired by Mecone Mosaic planning analytics + Google Earth 3D globe
 */
const MBOARD_CONFIG = {
  defaultCenter: [150.9069, -33.7689],
  defaultZoom: 13,
  australiaBounds: [[112.9, -44.2], [154.0, -9.1]],

  // Free Cesium Ion token for terrain/imagery (replace with your own for production)
  cesiumIonToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyMjY0NjQ5OH0.XcKpgANiY19MC4bdFUXMVEBToBmqS8kuYpUlxJhZ6YY',

  basemaps: {
    satellite: {
      version: 8,
      sources: {
        esri: {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: 'Esri'
        }
      },
      layers: [{ id: 'esri', type: 'raster', source: 'esri' }]
    },
    hybrid: {
      version: 8,
      sources: {
        esri: {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256
        },
        labels: {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256
        }
      },
      layers: [
        { id: 'esri', type: 'raster', source: 'esri' },
        { id: 'labels', type: 'raster', source: 'labels', paint: { 'raster-opacity': 0.85 } }
      ]
    },
    streets: {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap'
        }
      },
      layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
    },
    topo: {
      version: 8,
      sources: {
        topo: {
          type: 'raster',
          tiles: ['https://tile.opentopomap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: 'OpenTopoMap'
        }
      },
      layers: [{ id: 'topo', type: 'raster', source: 'topo' }]
    },
    dark: {
      version: 8,
      sources: {
        dark: {
          type: 'raster',
          tiles: ['https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'],
          tileSize: 256,
          attribution: 'CARTO'
        }
      },
      layers: [{ id: 'dark', type: 'raster', source: 'dark' }]
    },
    light: {
      version: 8,
      sources: {
        light: {
          type: 'raster',
          tiles: ['https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'],
          tileSize: 256,
          attribution: 'CARTO'
        }
      },
      layers: [{ id: 'light', type: 'raster', source: 'light' }]
    }
  },

  layerGroups: [
    {
      id: 'planning',
      name: 'Planning Controls',
      color: '#3b9eff',
      layers: [
        { id: 'zoning', name: 'Land Zoning', source: 'zoning', type: 'fill', defaultOn: true, paint: { 'fill-opacity': 0.45 } },
        { id: 'fsr', name: 'Floor Space Ratio (FSR)', source: 'fsr', type: 'fill', defaultOn: false },
        { id: 'heights', name: 'Building Heights', source: 'heights', type: 'fill', defaultOn: false },
        { id: 'lot-size', name: 'Minimum Lot Size', source: 'lot-size', type: 'fill', defaultOn: false },
        { id: 'heritage', name: 'Heritage Items & Areas', source: 'heritage', type: 'fill', defaultOn: false, paint: { 'fill-color': '#a855f7', 'fill-opacity': 0.5 } }
      ]
    },
    {
      id: 'cadastre',
      name: 'Cadastre & Property',
      color: '#10b981',
      layers: [
        { id: 'parcels', name: 'Lot & Parcel Boundaries', source: 'parcels', type: 'line', defaultOn: true, paint: { 'line-color': '#fbbf24', 'line-width': 1.2 } },
        { id: 'addresses', name: 'Property Addresses', source: 'addresses', type: 'circle', defaultOn: false, paint: { 'circle-radius': 4, 'circle-color': '#10b981' } },
        { id: 'listings', name: 'Urbane Listings', source: 'listings', type: 'circle', defaultOn: true, paint: { 'circle-radius': 7, 'circle-color': '#ef4444', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' } }
      ]
    },
    {
      id: 'environment',
      name: 'Environmental Constraints',
      color: '#ef4444',
      layers: [
        { id: 'flood', name: 'Flood Prone Land', source: 'flood', type: 'fill', defaultOn: false, paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.4 } },
        { id: 'bushfire', name: 'Bushfire Prone Land', source: 'bushfire', type: 'fill', defaultOn: false, paint: { 'fill-color': '#f97316', 'fill-opacity': 0.45 } },
        { id: 'biodiversity', name: 'Biodiversity & Vegetation', source: 'biodiversity', type: 'fill', defaultOn: false, paint: { 'fill-color': '#22c55e', 'fill-opacity': 0.4 } },
        { id: 'contamination', name: 'Contaminated Land Register', source: 'contamination', type: 'circle', defaultOn: false, paint: { 'circle-radius': 8, 'circle-color': '#dc2626' } }
      ]
    },
    {
      id: 'demographics',
      name: 'Demographics (ABS)',
      color: '#8b5cf6',
      layers: [
        { id: 'population', name: 'Population Density', source: 'population', type: 'fill', defaultOn: false },
        { id: 'income', name: 'Median Household Income', source: 'income', type: 'fill', defaultOn: false },
        { id: 'age', name: 'Median Age Profile', source: 'age', type: 'fill', defaultOn: false },
        { id: 'growth', name: 'Population Growth Projection', source: 'growth', type: 'fill', defaultOn: false }
      ]
    },
    {
      id: 'transport',
      name: 'Transport & Infrastructure',
      color: '#06b6d4',
      layers: [
        { id: 'rail', name: 'Rail Network', source: 'rail', type: 'line', defaultOn: false, paint: { 'line-color': '#06b6d4', 'line-width': 3 } },
        { id: 'metro', name: 'Metro & Light Rail', source: 'metro', type: 'line', defaultOn: false, paint: { 'line-color': '#8b5cf6', 'line-width': 3 } },
        { id: 'employment', name: 'Employment Hubs', source: 'employment', type: 'circle', defaultOn: false, paint: { 'circle-radius': 10, 'circle-color': '#0891b2', 'circle-opacity': 0.7 } }
      ]
    },
    {
      id: 'strategic',
      name: 'Strategic Planning',
      color: '#f59e0b',
      layers: [
        { id: 'precincts', name: 'Growth Precincts', source: 'precincts', type: 'fill', defaultOn: false, paint: { 'fill-color': '#f59e0b', 'fill-opacity': 0.35 } },
        { id: 'tod', name: 'Transport Oriented Development', source: 'tod', type: 'fill', defaultOn: false, paint: { 'fill-color': '#eab308', 'fill-opacity': 0.3 } },
        { id: 'rezoning', name: 'Proposed Rezoning', source: 'rezoning', type: 'line', defaultOn: false, paint: { 'line-color': '#f43f5e', 'line-width': 2, 'line-dasharray': [4, 2] } }
      ]
    }
  ],

  zoneColors: {
    'R1': '#fef08a', 'R2': '#fde047', 'R3': '#facc15', 'R4': '#eab308',
    'R5': '#ca8a04', 'B1': '#93c5fd', 'B2': '#60a5fa', 'B3': '#3b82f6',
    'B4': '#2563eb', 'B5': '#1d4ed8', 'B6': '#1e40af', 'B7': '#1e3a8a',
    'IN1': '#c4b5fd', 'IN2': '#a78bfa', 'IN3': '#8b5cf6', 'SP1': '#86efac',
    'SP2': '#4ade80', 'SP3': '#22c55e', 'RE1': '#6ee7b7', 'RE2': '#34d399',
    'RU1': '#d9f99d', 'RU2': '#bef264', 'RU4': '#a3e635', 'RU5': '#84cc16',
    'E1': '#67e8f9', 'E2': '#22d3ee', 'E3': '#06b6d4', 'E4': '#0891b2',
    'W1': '#7dd3fc', 'W2': '#38bdf8', 'W3': '#0ea5e9', 'W4': '#0284c7',
    'default': '#94a3b8'
  },

  jurisdictions: {
    NSW: { center: [151.0, -33.5], zoom: 8, label: 'New South Wales' },
    VIC: { center: [144.5, -37.5], zoom: 7, label: 'Victoria' },
    QLD: { center: [145.5, -22.5], zoom: 6, label: 'Queensland' },
    WA: { center: [121.5, -26.0], zoom: 5, label: 'Western Australia' },
    SA: { center: [136.0, -30.0], zoom: 6, label: 'South Australia' },
    TAS: { center: [146.5, -42.0], zoom: 7, label: 'Tasmania' },
    ACT: { center: [149.1, -35.3], zoom: 11, label: 'Australian Capital Territory' },
    NT: { center: [133.5, -19.5], zoom: 5, label: 'Northern Territory' }
  }
};
