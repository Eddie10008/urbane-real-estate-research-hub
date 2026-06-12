/**
 * M-Board — Australian Spatial Intelligence Portal
 * Hybrid MapLibre (2D planning) + Cesium (3D globe) application
 */
(function () {
  'use strict';

  const config = MBOARD_CONFIG;
  const { sourceMap } = MBOARD_DATA;

  let map = null;
  let cesiumViewer = null;
  let activeTool = 'inspect';
  let drawCoords = [];
  let measureMarkers = [];
  let workbenchLayers = [];
  let activeLayerId = 'zoning';
  let viewMode = '2d';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* ── Init ─────────────────────────────────────────────── */

  function init() {
    initMap2D();
    initCesium();
    buildLayerTree();
    bindEvents();
    showToast('M-Board ready — click the map to inspect a site');
  }

  function initMap2D() {
    const style = JSON.parse(JSON.stringify(config.basemaps.satellite));
    addDataSourcesToStyle(style);

    map = new maplibregl.Map({
      container: 'map2d',
      style,
      center: config.defaultCenter,
      zoom: config.defaultZoom,
      pitch: 0,
      bearing: 0,
      maxPitch: 60
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    map.on('load', () => {
      addAllLayers();
      map.on('mousemove', updateCoords);
      map.on('move', updateScale);
      updateScale();
    });

    map.on('click', onMapClick);
  }

  function addDataSourcesToStyle(style) {
    Object.entries(sourceMap).forEach(([id, geojson]) => {
      style.sources = style.sources || {};
      style.sources[id] = { type: 'geojson', data: geojson };
    });
  }

  function addAllLayers() {
    config.layerGroups.forEach((group) => {
      group.layers.forEach((layer) => {
        addMapLayer(layer);
      });
    });

    map.addSource('draw', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.addLayer({ id: 'draw-fill', type: 'fill', source: 'draw', paint: { 'fill-color': '#3b9eff', 'fill-opacity': 0.2 }, filter: ['==', '$type', 'Polygon'] });
    map.addLayer({ id: 'draw-line', type: 'line', source: 'draw', paint: { 'line-color': '#3b9eff', 'line-width': 2, 'line-dasharray': [2, 1] } });
    map.addLayer({ id: 'draw-points', type: 'circle', source: 'draw', paint: { 'circle-radius': 5, 'circle-color': '#3b9eff', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }, filter: ['==', '$type', 'Point'] });

    map.on('mouseenter', 'listings', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'listings', () => { map.getCanvas().style.cursor = ''; });
    map.on('click', 'listings', (e) => {
      const p = e.features[0].properties;
      showSitePanel(e.lngLat.lng, e.lngLat.lat, { address: p.address, listing: p });
    });
  }

  function addMapLayer(layerDef) {
    const src = layerDef.source;
    if (!map.getSource(src)) return;

    const id = layerDef.id;
    const type = layerDef.type;
    const paint = { ...getDefaultPaint(layerDef), ...layerDef.paint };

    if (type === 'fill') {
      map.addLayer({
        id,
        type: 'fill',
        source: src,
        layout: { visibility: layerDef.defaultOn ? 'visible' : 'none' },
        paint: {
          'fill-color': paint['fill-color'] || ['match', ['get', 'zone'], ...zoneMatchArray(), config.zoneColors.default],
          'fill-opacity': paint['fill-opacity'] ?? 0.45,
          'fill-outline-color': '#ffffff40'
        }
      });
      map.addLayer({
        id: id + '-label',
        type: 'symbol',
        source: src,
        layout: {
          visibility: layerDef.defaultOn ? 'visible' : 'none',
          'text-field': ['coalesce', ['get', 'zone'], ['get', 'label'], ['get', 'name']],
          'text-size': 11,
          'text-anchor': 'center'
        },
        paint: { 'text-color': '#fff', 'text-halo-color': '#000', 'text-halo-width': 1 }
      });
    } else if (type === 'line') {
      map.addLayer({
        id, type: 'line', source: src,
        layout: { visibility: layerDef.defaultOn ? 'visible' : 'none' },
        paint: {
          'line-color': paint['line-color'] || '#3b9eff',
          'line-width': paint['line-width'] || 2,
          'line-dasharray': paint['line-dasharray'] || [1]
        }
      });
    } else if (type === 'circle') {
      map.addLayer({
        id, type: 'circle', source: src,
        layout: { visibility: layerDef.defaultOn ? 'visible' : 'none' },
        paint: {
          'circle-radius': paint['circle-radius'] || 6,
          'circle-color': paint['circle-color'] || '#3b9eff',
          'circle-stroke-width': paint['circle-stroke-width'] || 0,
          'circle-stroke-color': paint['circle-stroke-color'] || '#fff',
          'circle-opacity': paint['circle-opacity'] ?? 0.9
        }
      });
    }
  }

  function zoneMatchArray() {
    const arr = [];
    Object.entries(config.zoneColors).forEach(([k, v]) => { if (k !== 'default') arr.push(k, v); });
    arr.push(config.zoneColors.default);
    return arr;
  }

  function getDefaultPaint(layerDef) {
    if (layerDef.source === 'population') return { 'fill-color': ['interpolate', ['linear'], ['get', 'density'], 1000, '#fef3c7', 3000, '#fbbf24', 5000, '#f97316'] };
    if (layerDef.source === 'income') return { 'fill-color': ['interpolate', ['linear'], ['get', 'median_income'], 50000, '#dbeafe', 80000, '#60a5fa', 110000, '#1d4ed8'] };
    if (layerDef.source === 'age') return { 'fill-color': ['interpolate', ['linear'], ['get', 'median_age'], 30, '#d1fae5', 40, '#34d399', 50, '#059669'] };
    if (layerDef.source === 'growth') return { 'fill-color': ['interpolate', ['linear'], ['get', 'growth_pct'], 1, '#e0e7ff', 3, '#818cf8', 5, '#4f46e5'] };
    if (layerDef.source === 'fsr') return { 'fill-color': ['interpolate', ['linear'], ['get', 'fsr_value'], 0, '#f0fdf4', 1, '#86efac', 2, '#22c55e', 3, '#15803d'] };
    if (layerDef.source === 'heights') return { 'fill-color': ['interpolate', ['linear'], ['get', 'height_m'], 0, '#fef9c3', 10, '#facc15', 20, '#f97316', 40, '#dc2626'] };
    return {};
  }

  function initCesium() {
    if (typeof Cesium === 'undefined') return;

    try {
      Cesium.Ion.defaultAccessToken = config.cesiumIonToken;
    } catch { /* continue with OSM fallback */ }

    const viewerOpts = {
      animation: false,
      timeline: false,
      baseLayerPicker: true,
      geocoder: false,
      homeButton: false,
      sceneModePicker: true,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false
    };

    try {
      viewerOpts.terrain = Cesium.Terrain.fromWorldTerrain();
    } catch {
      viewerOpts.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    }

    cesiumViewer = new Cesium.Viewer('cesiumContainer', viewerOpts);

    cesiumViewer.scene.globe.depthTestAgainstTerrain = true;
    cesiumViewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(config.defaultCenter[0], config.defaultCenter[1], 8000),
      orientation: { pitch: Cesium.Math.toRadians(-45), heading: 0 }
    });

    cesiumViewer.screenSpaceEventHandler.setInputAction((click) => {
      if (viewMode === '2d') return;
      const cartesian = cesiumViewer.camera.pickEllipsoid(click.position);
      if (!cartesian) return;
      const carto = Cesium.Cartographic.fromCartesian(cartesian);
      const lng = Cesium.Math.toDegrees(carto.longitude);
      const lat = Cesium.Math.toDegrees(carto.latitude);
      showSitePanel(lng, lat);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  /* ── Layer UI ─────────────────────────────────────────── */

  function buildLayerTree() {
    const tree = $('#layerTree');
    tree.innerHTML = '';

    config.layerGroups.forEach((group) => {
      const groupEl = document.createElement('div');
      groupEl.className = 'mboard-layer-group open';
      groupEl.innerHTML = `
        <div class="mboard-layer-group-header" data-group="${group.id}">
          <span class="chevron">▶</span>
          <span class="mboard-layer-group-icon" style="background:${group.color}"></span>
          <span>${group.name}</span>
        </div>
        <div class="mboard-layer-items"></div>
      `;

      const items = groupEl.querySelector('.mboard-layer-items');
      group.layers.forEach((layer) => {
        const item = document.createElement('div');
        item.className = 'mboard-layer-item';
        item.innerHTML = `
          <input type="checkbox" id="layer-${layer.id}" data-layer="${layer.id}" ${layer.defaultOn ? 'checked' : ''}>
          <span class="mboard-layer-swatch" style="background:${group.color}"></span>
          <label for="layer-${layer.id}">${layer.name}</label>
        `;
        items.appendChild(item);
      });

      tree.appendChild(groupEl);
    });

    tree.querySelectorAll('.mboard-layer-group-header').forEach((hdr) => {
      hdr.addEventListener('click', () => hdr.parentElement.classList.toggle('open'));
    });

    tree.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener('change', () => toggleLayer(cb.dataset.layer, cb.checked));
      cb.addEventListener('focus', () => { activeLayerId = cb.dataset.layer; });
    });
  }

  function toggleLayer(id, visible) {
    const vis = visible ? 'visible' : 'none';
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', vis);
    if (map.getLayer(id + '-label')) map.setLayoutProperty(id + '-label', 'visibility', vis);
  }

  function setLayerOpacity(val) {
    const opacity = val / 100;
    if (map.getLayer(activeLayerId)) {
      const type = map.getLayer(activeLayerId).type;
      if (type === 'fill') map.setPaintProperty(activeLayerId, 'fill-opacity', opacity);
      else if (type === 'line') map.setPaintProperty(activeLayerId, 'line-opacity', opacity);
      else if (type === 'circle') map.setPaintProperty(activeLayerId, 'circle-opacity', opacity);
    }
  }

  function setBasemap(key) {
    const bm = config.basemaps[key];
    if (!bm) return;
    const style = JSON.parse(JSON.stringify(bm));
    addDataSourcesToStyle(style);

    const center = map.getCenter();
    const zoom = map.getZoom();
    const pitch = map.getPitch();
    const bearing = map.getBearing();

    map.setStyle(style);
    map.once('style.load', () => {
      addAllLayers();
      map.jumpTo({ center, zoom, pitch, bearing });
      config.layerGroups.forEach((g) => {
        g.layers.forEach((l) => {
          const cb = document.querySelector(`#layer-${l.id}`);
          if (cb) toggleLayer(l.id, cb.checked);
        });
      });
      setLayerOpacity($('#layerOpacity').value);
    });
  }

  /* ── Site Intelligence ──────────────────────────────────── */

  function onMapClick(e) {
    if (activeTool !== 'inspect') return;
    showSitePanel(e.lngLat.lng, e.lngLat.lat);
  }

  function showSitePanel(lng, lat, extra = {}) {
    const zone = findFeatureAt('zoning', lng, lat);
    const parcel = findFeatureAt('parcels', lng, lat);
    const flood = findFeatureAt('flood', lng, lat);
    const bushfire = findFeatureAt('bushfire', lng, lat);
    const heritage = findFeatureAt('heritage', lng, lat);
    const pop = findFeatureAt('population', lng, lat);

    const address = extra.address || parcel?.properties?.address || reverseGeocodeShort(lng, lat);
    const zp = zone?.properties || {};

    $('#sitePanelBody').innerHTML = `
      <div class="mboard-site-report">
        <div class="mboard-site-address">${address}</div>
        <div class="mboard-site-coords">${lat.toFixed(6)}°, ${lng.toFixed(6)}°</div>

        <div class="mboard-data-section">
          <h3>Planning Controls</h3>
          <div class="mboard-data-grid">
            <div class="mboard-data-item">
              <div class="label">Zone</div>
              <div class="value"><span class="mboard-badge mboard-badge--zone">${zp.zone || '—'}</span> ${zp.name || ''}</div>
            </div>
            <div class="mboard-data-item">
              <div class="label">LGA</div>
              <div class="value">${zp.lga || '—'}</div>
            </div>
            <div class="mboard-data-item">
              <div class="label">FSR</div>
              <div class="value">${zp.fsr || '—'}</div>
            </div>
            <div class="mboard-data-item">
              <div class="label">Height</div>
              <div class="value">${zp.height || '—'}</div>
            </div>
            <div class="mboard-data-item">
              <div class="label">Min Lot Size</div>
              <div class="value">${zp.lot_size || '—'}</div>
            </div>
            <div class="mboard-data-item">
              <div class="label">Jurisdiction</div>
              <div class="value">${$('#jurisdictionSelect').value}</div>
            </div>
          </div>
        </div>

        ${parcel ? `
        <div class="mboard-data-section">
          <h3>Cadastre</h3>
          <div class="mboard-data-grid">
            <div class="mboard-data-item"><div class="label">Lot</div><div class="value">${parcel.properties.lot}</div></div>
            <div class="mboard-data-item"><div class="label">DP</div><div class="value">${parcel.properties.dp}</div></div>
            <div class="mboard-data-item"><div class="label">Area</div><div class="value">${parcel.properties.area}</div></div>
          </div>
        </div>` : ''}

        <div class="mboard-data-section">
          <h3>Environmental Constraints</h3>
          <ul class="mboard-constraint-list">
            <li><span class="dot" style="background:${flood ? '#3b82f6' : '#10b981'}"></span> Flood: ${flood ? flood.properties.category + ' (' + flood.properties.aep + ')' : 'Not identified'}</li>
            <li><span class="dot" style="background:${bushfire ? '#f97316' : '#10b981'}"></span> Bushfire: ${bushfire ? bushfire.properties.category + ' — ' + bushfire.properties.bal : 'Not identified'}</li>
            <li><span class="dot" style="background:${heritage ? '#a855f7' : '#10b981'}"></span> Heritage: ${heritage ? heritage.properties.name + ' (' + heritage.properties.grade + ')' : 'Not identified'}</li>
          </ul>
        </div>

        ${pop ? `
        <div class="mboard-data-section">
          <h3>Demographics (ABS)</h3>
          <div class="mboard-data-grid">
            <div class="mboard-data-item"><div class="label">SA2</div><div class="value">${pop.properties.sa2}</div></div>
            <div class="mboard-data-item"><div class="label">Population</div><div class="value">${pop.properties.pop?.toLocaleString()}</div></div>
            <div class="mboard-data-item"><div class="label">Density</div><div class="value">${pop.properties.label}</div></div>
          </div>
        </div>` : ''}

        ${extra.listing ? `
        <div class="mboard-data-section">
          <h3>Property Listing</h3>
          <div class="mboard-data-grid">
            <div class="mboard-data-item"><div class="label">Status</div><div class="value">${extra.listing.status}</div></div>
            <div class="mboard-data-item"><div class="label">Price</div><div class="value">${extra.listing.price}</div></div>
            <div class="mboard-data-item"><div class="label">Bedrooms</div><div class="value">${extra.listing.beds}</div></div>
          </div>
        </div>` : ''}
      </div>
    `;

    $('#sitePanel').classList.remove('collapsed');
    map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 15), duration: 800 });
  }

  function findFeatureAt(sourceId, lng, lat) {
    const pt = turf.point([lng, lat]);
    const fc = sourceMap[sourceId];
    if (!fc) return null;
    for (const f of fc.features) {
      if (turf.booleanPointInPolygon(pt, f)) return f;
      if (f.geometry.type === 'Point') {
        const dist = turf.distance(pt, f, { units: 'meters' });
        if (dist < 200) return f;
      }
      if (f.geometry.type === 'LineString') {
        const dist = turf.pointToLineDistance(pt, f, { units: 'meters' });
        if (dist < 100) return f;
      }
    }
    return null;
  }

  function reverseGeocodeShort(lng, lat) {
    return `Site at ${lat.toFixed(4)}°S, ${lng.toFixed(4)}°E`;
  }

  /* ── Drawing & Measurement ────────────────────────────── */

  function handleDrawClick(lng, lat) {
    drawCoords.push([lng, lat]);
    updateDrawSource();

    if (activeTool === 'measure-line' && drawCoords.length >= 2) {
      const line = turf.lineString(drawCoords);
      const km = turf.length(line, { units: 'kilometers' });
      showToast(`Distance: ${km < 1 ? (km * 1000).toFixed(0) + ' m' : km.toFixed(2) + ' km'}`);
    }

    if (activeTool === 'measure-area' && drawCoords.length >= 3) {
      drawCoords.push(drawCoords[0]);
      const poly = turf.polygon([drawCoords]);
      const area = turf.area(poly);
      showToast(`Area: ${area < 10000 ? area.toFixed(0) + ' m²' : (area / 10000).toFixed(2) + ' ha'}`);
      drawCoords = [];
    }

    if (activeTool === 'draw-polygon' && drawCoords.length >= 3) {
      const closed = [...drawCoords, drawCoords[0]];
      const poly = turf.polygon([closed]);
      const area = turf.area(poly);
      showToast(`Study area: ${(area / 10000).toFixed(2)} ha drawn`);
    }

    if (activeTool === 'draw-radius' && drawCoords.length === 1) {
      const center = drawCoords[0];
      const circle = turf.circle(center, 0.5, { units: 'kilometers', steps: 64 });
      map.getSource('draw').setData({ type: 'FeatureCollection', features: [circle, turf.point(center)] });
      showToast('500m radius buffer created');
      drawCoords = [];
    }
  }

  function updateDrawSource() {
    const features = [];
    if (drawCoords.length > 0) {
      features.push(...drawCoords.map((c) => turf.point(c)));
      if (drawCoords.length >= 2) features.push(turf.lineString(drawCoords));
      if (drawCoords.length >= 3 && activeTool === 'draw-polygon') {
        features.push(turf.polygon([[...drawCoords, drawCoords[0]]]));
      }
    }
    map.getSource('draw')?.setData({ type: 'FeatureCollection', features });
  }

  function clearDrawings() {
    drawCoords = [];
    map.getSource('draw')?.setData({ type: 'FeatureCollection', features: [] });
    showToast('Drawings cleared');
  }

  /* ── Search ───────────────────────────────────────────── */

  let searchTimer = null;

  async function geocodeSearch(query) {
    const results = $('#searchResults');
    if (!query || query.length < 2) { results.hidden = true; return; }

    if (/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(query)) {
      const [lat, lng] = query.split(',').map(Number);
      flyTo(lng, lat, 14);
      results.hidden = true;
      return;
    }

    try {
      const bbox = config.australiaBounds.flat().join(',');
      const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=au&limit=6&bounded=1&viewbox=${config.australiaBounds[0][0]},${config.australiaBounds[1][1]},${config.australiaBounds[1][0]},${config.australiaBounds[0][1]}&q=${encodeURIComponent(query)}`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();

      results.innerHTML = data.map((r) =>
        `<button type="button" data-lng="${r.lon}" data-lat="${r.lat}">${r.display_name.split(',').slice(0, 3).join(',')}<small>${r.type || 'location'}</small></button>`
      ).join('') || '<button type="button" disabled>No results in Australia</button>';

      results.hidden = false;
      results.querySelectorAll('button[data-lng]').forEach((btn) => {
        btn.addEventListener('click', () => {
          flyTo(+btn.dataset.lng, +btn.dataset.lat, 14);
          results.hidden = true;
          $('#geoSearch').value = btn.textContent.trim();
        });
      });
    } catch {
      showToast('Search unavailable — try coordinates (lat, lng)');
    }
  }

  function flyTo(lng, lat, zoom) {
    map.flyTo({ center: [lng, lat], zoom: zoom || 13, duration: 1500 });
    if (cesiumViewer && viewMode !== '2d') {
      cesiumViewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lng, lat, 5000),
        duration: 1.5
      });
    }
  }

  /* ── View modes ───────────────────────────────────────── */

  function setViewMode(mode) {
    viewMode = mode;
    document.body.classList.toggle('split-view', mode === 'split');

    const map2d = $('#map2d');
    const cesium = $('#cesiumContainer');

    if (mode === '2d') {
      map2d.classList.remove('mboard-map--hidden');
      cesium.classList.add('mboard-map--hidden');
    } else if (mode === '3d') {
      map2d.classList.add('mboard-map--hidden');
      cesium.classList.remove('mboard-map--hidden');
      cesiumViewer?.resize();
    } else {
      map2d.classList.remove('mboard-map--hidden');
      cesium.classList.remove('mboard-map--hidden');
      cesiumViewer?.resize();
      map.resize();
    }

    $$('.mboard-view-toggle button').forEach((b) => {
      b.classList.toggle('active', b.dataset.view === mode);
    });
  }

  /* ── Export ───────────────────────────────────────────── */

  function captureScreenshot() {
    map.triggerRepaint();
    setTimeout(() => {
      const canvas = map.getCanvas();
      const link = document.createElement('a');
      link.download = `mboard-capture-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Screenshot saved');
    }, 200);
  }

  function generateSiteReport() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const center = map.getCenter();

    pdf.setFontSize(18);
    pdf.text('M-Board Site Report', 20, 20);
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(`Generated: ${new Date().toLocaleString('en-AU')}`, 20, 28);
    pdf.text(`Coordinates: ${center.lat.toFixed(6)}°, ${center.lng.toFixed(6)}°`, 20, 34);
    pdf.text(`Zoom: ${map.getZoom().toFixed(1)} | Jurisdiction: ${$('#jurisdictionSelect').value}`, 20, 40);

    const panelText = $('#sitePanelBody').innerText;
    const lines = pdf.splitTextToSize(panelText || 'No site selected — click the map first.', 170);
    pdf.setTextColor(0);
    pdf.text(lines, 20, 52);

    try {
      const img = map.getCanvas().toDataURL('image/jpeg', 0.7);
      pdf.addImage(img, 'JPEG', 20, 52 + lines.length * 5 + 10, 170, 100);
    } catch { /* canvas may be tainted */ }

    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text('M-Board — Urbane Real Estate Spatial Intelligence | Open data demonstration', 20, 285);

    pdf.save(`mboard-site-report-${Date.now()}.pdf`);
    showToast('Site report PDF downloaded');
  }

  /* ── Workbench ────────────────────────────────────────── */

  function handleWorkbenchUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const geojson = JSON.parse(e.target.result);
        const id = 'wb-' + Date.now();
        workbenchLayers.push({ id, name: file.name, data: geojson });

        if (map.getSource(id)) return;
        map.addSource(id, { type: 'geojson', data: geojson });
        map.addLayer({ id, type: 'line', source: id, paint: { 'line-color': '#f472b6', 'line-width': 2 } });
        if (geojson.features?.some((f) => f.geometry?.type === 'Polygon')) {
          map.addLayer({ id: id + '-fill', type: 'fill', source: id, paint: { 'fill-color': '#f472b6', 'fill-opacity': 0.2 } });
        }

        renderWorkbenchList();
        showToast(`Loaded: ${file.name}`);
      } catch {
        showToast('Invalid GeoJSON file');
      }
    };
    reader.readAsText(file);
  }

  function renderWorkbenchList() {
    const list = $('#workbenchLayers');
    list.innerHTML = workbenchLayers.map((l) =>
      `<div class="mboard-workbench-item"><span>${l.name}</span><button type="button" data-remove="${l.id}" class="mboard-icon-btn">×</button></div>`
    ).join('');

    list.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.remove;
        if (map.getLayer(id)) map.removeLayer(id);
        if (map.getLayer(id + '-fill')) map.removeLayer(id + '-fill');
        if (map.getSource(id)) map.removeSource(id);
        workbenchLayers = workbenchLayers.filter((l) => l.id !== id);
        renderWorkbenchList();
      });
    });
  }

  /* ── UI helpers ───────────────────────────────────────── */

  function updateCoords(e) {
    $('#coordsDisplay').textContent = `${e.lngLat.lat.toFixed(5)}°, ${e.lngLat.lng.toFixed(5)}°`;
  }

  function updateScale() {
    const y = map.getContainer().clientHeight / 2;
    const a = map.unproject([0, y]);
    const b = map.unproject([100, y]);
    const m = turf.distance(turf.point([a.lng, a.lat]), turf.point([b.lng, b.lat]), { units: 'meters' });
    $('#scaleDisplay').textContent = m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m.toFixed(0)} m`;
  }

  function showToast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.hidden = true; }, 3000);
  }

  function openModal(id) { $(id).hidden = false; }
  function closeModals() { $$('.mboard-modal').forEach((m) => { m.hidden = true; }); }

  /* ── Events ───────────────────────────────────────────── */

  function bindEvents() {
    $$('.mboard-view-toggle button').forEach((btn) => {
      btn.addEventListener('click', () => setViewMode(btn.dataset.view));
    });

    $('#basemapSelect').addEventListener('change', (e) => setBasemap(e.target.value));

    $('#jurisdictionSelect').addEventListener('change', (e) => {
      const j = config.jurisdictions[e.target.value];
      if (j) flyTo(j.center[0], j.center[1], j.zoom);
    });

    $('#layerOpacity').addEventListener('input', (e) => setLayerOpacity(e.target.value));

    $('#geoSearch').addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => geocodeSearch(e.target.value), 400);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.mboard-search')) $('#searchResults').hidden = true;
    });

    $$('.mboard-tool').forEach((tool) => {
      tool.addEventListener('click', () => {
        const t = tool.dataset.tool;
        if (t === 'clear') { clearDrawings(); return; }
        activeTool = t;
        drawCoords = [];
        updateDrawSource();
        $$('.mboard-tool').forEach((x) => x.classList.toggle('active', x.dataset.tool === t));
        map.getCanvas().style.cursor = t === 'inspect' ? '' : 'crosshair';
        showToast(`Tool: ${t.replace(/-/g, ' ')}`);
      });
    });

    map.on('click', (e) => {
      if (activeTool !== 'inspect') {
        e.preventDefault();
        handleDrawClick(e.lngLat.lng, e.lngLat.lat);
      }
    });

    $$('.mboard-quick-nav button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const [lat, lng, zoom] = btn.dataset.fly.split(',').map(Number);
        flyTo(lng, lat, zoom);
      });
    });

    $('#btnScreenshot').addEventListener('click', captureScreenshot);
    $('#btnSiteReport').addEventListener('click', generateSiteReport);
    $('#btnWorkbench').addEventListener('click', () => openModal('#workbenchModal'));
    $('#btnHelp').addEventListener('click', () => openModal('#helpModal'));

    $$('[data-close-modal]').forEach((el) => el.addEventListener('click', closeModals));

    $('#workbenchUpload').addEventListener('change', (e) => {
      if (e.target.files[0]) handleWorkbenchUpload(e.target.files[0]);
    });

    $('#collapseLayers').addEventListener('click', () => {
      $('#layersPanel').classList.toggle('collapsed');
    });

    $('#collapseSite').addEventListener('click', () => {
      $('#sitePanel').classList.toggle('collapsed');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeModals(); clearDrawings(); }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
