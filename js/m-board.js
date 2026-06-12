/**
 * M-Board — Australian Spatial Intelligence Portal
 * Hybrid MapLibre (2D planning) + Cesium (3D globe) application
 */
(function () {
  'use strict';

  const config = MBOARD_CONFIG;
  const { sourceMap, research: nswResearch, lotLookup } = MBOARD_DATA;

  let map = null;
  let cesiumViewer = null;
  let activeTool = 'inspect';
  let drawCoords = [];
  let measureMarkers = [];
  let workbenchLayers = [];
  let activeLayerId = 'lots';
  let viewMode = '2d';
  let selectedLotId = null;
  let selectedLotProps = null;
  let lotHoverPopup = null;
  let hoveredLotId = null;
  let lotPinMarker = null;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* ── Init ─────────────────────────────────────────────── */

  function init() {
    initMap2D();
    initCesium();
    buildLayerTree();
    bindEvents();
    renderNswContextBanner();
    const hint = $('#lotGridHint');
    if (hint && MBOARD_DATA.lotCount) {
      hint.textContent = `Mecone Mosaic–style cadastre grid · ${MBOARD_DATA.lotCount} lots mapped in Blacktown CBD`;
    }
    showToast('M-Board ready — click any lot on the cadastre grid for premium intelligence');
  }

  function initMap2D() {
    const style = JSON.parse(JSON.stringify(config.basemaps.mosaic || config.basemaps.satellite));
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
      document.body.classList.add('mboard-mosaic-mode');
      addAllLayers();
      map.on('mousemove', updateCoords);
      map.on('move', () => { updateScale(); updateZoomDisplay(); });
      map.on('zoom', updateZoomDisplay);
      updateScale();
      updateZoomDisplay();
      updateFooterInfo();
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

    setupLotInteractions();

    ['stations', 'competitors', 'employment'].forEach((layerId) => {
      map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });
      map.on('click', layerId, (e) => {
        const p = e.features[0].properties;
        const label = p.name || p.address;
        showSitePanel(e.lngLat.lng, e.lngLat.lat, { address: label });
      });
    });
  }

  function addMapLayer(layerDef) {
    const src = layerDef.source;
    if (!map.getSource(src)) return;

    const id = layerDef.id;
    const type = layerDef.type;
    const paint = { ...getDefaultPaint(layerDef), ...layerDef.paint };

    if (type === 'fill') {
      const isLots = src === 'lots';
      const fillOpacity = isLots ? (paint['fill-opacity'] ?? 0.06) : (paint['fill-opacity'] ?? 0.45);
      map.addLayer({
        id,
        type: 'fill',
        source: src,
        layout: { visibility: layerDef.defaultOn ? 'visible' : 'none' },
        paint: {
          'fill-color': isLots
            ? (paint['fill-color'] || '#4ade80')
            : (paint['fill-color'] || ['match', ['get', 'zone'], ...zoneMatchArray(), config.zoneColors.default]),
          'fill-opacity': isLots
            ? ['case', ['==', ['get', 'lot_id'], selectedLotId || ''], 0.35, 0.06]
            : fillOpacity,
          'fill-outline-color': isLots ? '#4ade80' : '#ffffff40'
        }
      });
      if (!isLots) {
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
      }
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
    } else if (type === 'symbol') {
      const isLotLabels = src === 'lot-labels';
      map.addLayer({
        id, type: 'symbol', source: src,
        minzoom: isLotLabels ? 15 : 14,
        layout: {
          visibility: layerDef.defaultOn ? 'visible' : 'none',
          'text-field': ['get', 'label'],
          'text-size': isLotLabels ? ['interpolate', ['linear'], ['zoom'], 15, 8, 17, 10, 19, 12] : 10,
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
          'text-anchor': 'center',
          'text-allow-overlap': isLotLabels,
          'text-ignore-placement': isLotLabels
        },
        paint: {
          'text-color': layerDef.paint?.['text-color'] || (isLotLabels ? '#4ade80' : '#e2e8f0'),
          'text-halo-color': isLotLabels ? '#0a1628' : '#0a1628',
          'text-halo-width': isLotLabels ? 1 : 1.5,
          'text-opacity': isLotLabels ? ['interpolate', ['linear'], ['zoom'], 14.5, 0, 15, 0.9, 20, 1] : 1
        }
      });
    }

  }

  function createLotPinElement() {
    const el = document.createElement('div');
    el.className = 'mboard-lot-pin';
    el.innerHTML = '<span class="mboard-lot-pin-dot"></span><span class="mboard-lot-pin-tail"></span>';
    return el;
  }

  function placeLotPin(lng, lat, feature) {
    if (!lotPinMarker) {
      lotPinMarker = new maplibregl.Marker({ element: createLotPinElement(), anchor: 'bottom' });
    }
    if (feature?.geometry) {
      const c = feature.geometry.coordinates[0];
      const pinLng = (c[0][0] + c[2][0]) / 2;
      const pinLat = (c[0][1] + c[2][1]) / 2;
      lotPinMarker.setLngLat([pinLng, pinLat]).addTo(map);
    } else {
      lotPinMarker.setLngLat([lng, lat]).addTo(map);
    }
  }

  function removeLotPin() {
    lotPinMarker?.remove();
    lotPinMarker = null;
  }

  function setupLotInteractions() {
    if (!map.getSource('lots') || map.getSource('lot-selected')) return;

    map.addSource('lot-selected', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.addLayer({
      id: 'lot-selected-fill',
      type: 'fill',
      source: 'lot-selected',
      paint: { 'fill-color': '#86efac', 'fill-opacity': 0.45 }
    });
    map.addLayer({
      id: 'lot-selected-outline',
      type: 'line',
      source: 'lot-selected',
      paint: { 'line-color': '#4ade80', 'line-width': 3.5, 'line-opacity': 1 }
    });

    lotHoverPopup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'mboard-lot-popup',
      offset: 12
    });

    map.on('mouseenter', 'lots', (e) => {
      if (activeTool !== 'inspect') return;
      map.getCanvas().style.cursor = 'pointer';
      const f = e.features[0];
      const p = f.properties;
      hoveredLotId = p.lot_id;
      lotHoverPopup.setLngLat(e.lngLat)
        .setHTML(`<strong>${p.lot_id}</strong> · ${p.zone}<br><span class="muted">${p.address || p.suburb || ''}</span>`)
        .addTo(map);
      map.setPaintProperty('lots', 'fill-opacity', [
        'case', ['==', ['get', 'lot_id'], p.lot_id], 0.2,
        ['==', ['get', 'lot_id'], selectedLotId || ''], 0.35, 0.06
      ]);
    });

    map.on('mouseleave', 'lots', () => {
      map.getCanvas().style.cursor = '';
      hoveredLotId = null;
      lotHoverPopup.remove();
      resetLotFillOpacity();
    });

    map.on('mousemove', 'lots', (e) => {
      if (lotHoverPopup.isOpen()) lotHoverPopup.setLngLat(e.lngLat);
    });

    map.on('click', 'lots', (e) => {
      if (activeTool !== 'inspect') return;
      e.originalEvent.stopPropagation();
      const f = e.features[0];
      selectLot(f.properties.lot_id, e.lngLat.lng, e.lngLat.lat, f);
    });

    ['lot-grid', 'lot-labels'].forEach((layerId) => {
      map.on('mouseenter', layerId, () => {
        if (activeTool === 'inspect') map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', layerId, () => {
        if (!hoveredLotId) map.getCanvas().style.cursor = '';
      });
      map.on('click', layerId, (e) => {
        if (activeTool !== 'inspect') return;
        e.originalEvent.stopPropagation();
        const lotId = e.features[0].properties.lot_id;
        const lotFeature = sourceMap.lots?.features?.find((f) => f.properties.lot_id === lotId);
        if (lotFeature) selectLot(lotId, e.lngLat.lng, e.lngLat.lat, lotFeature);
      });
    });
  }

  function resetLotFillOpacity() {
    if (!map.getLayer('lots')) return;
    map.setPaintProperty('lots', 'fill-opacity', [
      'case', ['==', ['get', 'lot_id'], selectedLotId || ''], 0.35, 0.06
    ]);
  }

  function formatTitleRef(props) {
    if (!props) return '—';
    if (props.title_ref && props.title_ref.startsWith('TITLE')) return props.title_ref;
    const dp = String(props.dp || '').replace(/^DP/i, 'DP');
    return `TITLE ${props.lot}/${dp}`;
  }

  function updateFooterInfo(lng, lat, props) {
    const p = props || selectedLotProps;
    const center = map?.getCenter();
    const displayLng = lng ?? center?.lng;
    const displayLat = lat ?? center?.lat;

    if (displayLat != null && displayLng != null) {
      $('#coordsDisplay').textContent = `${displayLat.toFixed(5)}, ${displayLng.toFixed(5)}`;
    }

    if (p) {
      const addr = p.address
        ? `${p.address}${p.suburb ? ', ' + p.suburb.toUpperCase() : ''} NSW ${p.postcode || ''}`.trim()
        : '—';
      $('#addressDisplay').textContent = addr.toUpperCase();
      $('#titleDisplay').textContent = formatTitleRef(p).toUpperCase();
    } else if (!selectedLotId) {
      $('#addressDisplay').textContent = '—';
      $('#titleDisplay').textContent = '—';
    }
  }

  function updateZoomDisplay() {
    if (!map) return;
    $('#zoomDisplay').textContent = map.getZoom().toFixed(2);
  }

  function selectLot(lotId, lng, lat, feature) {
    selectedLotId = lotId;
    const lotFeature = feature || sourceMap.lots?.features?.find((f) => f.properties.lot_id === lotId);
    selectedLotProps = lotFeature?.properties || lotLookup[lotId] || null;
    if (lotFeature) {
      map.getSource('lot-selected')?.setData({ type: 'FeatureCollection', features: [lotFeature] });
      placeLotPin(lng, lat, lotFeature);
    }
    resetLotFillOpacity();
    updateFooterInfo(lng, lat, selectedLotProps);
    showLotPanel(lotId, lng, lat, selectedLotProps);
  }

  function clearLotSelection() {
    selectedLotId = null;
    selectedLotProps = null;
    map.getSource('lot-selected')?.setData({ type: 'FeatureCollection', features: [] });
    removeLotPin();
    resetLotFillOpacity();
    updateFooterInfo();
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
    if (id === 'lots') {
      ['lot-selected-fill', 'lot-selected-outline', 'lot-grid', 'lot-labels'].forEach((lid) => {
        if (map.getLayer(lid)) map.setLayoutProperty(lid, 'visibility', vis);
      });
    }
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
    document.body.classList.toggle('mboard-mosaic-mode', key === 'mosaic');
    const style = JSON.parse(JSON.stringify(bm));
    addDataSourcesToStyle(style);
    removeLotPin();

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
      if (selectedLotId) {
        const lotFeature = sourceMap.lots?.features?.find((f) => f.properties.lot_id === selectedLotId);
        if (lotFeature) {
          map.getSource('lot-selected')?.setData({ type: 'FeatureCollection', features: [lotFeature] });
          placeLotPin(null, null, lotFeature);
          resetLotFillOpacity();
        }
      }
      updateZoomDisplay();
    });
  }

  /* ── Site Intelligence ──────────────────────────────────── */

  function onMapClick(e) {
    if (activeTool !== 'inspect') return;
    const lot = findFeatureAt('lots', e.lngLat.lng, e.lngLat.lat);
    if (lot) {
      selectLot(lot.properties.lot_id, e.lngLat.lng, e.lngLat.lat, lot);
      return;
    }
    clearLotSelection();
    showSitePanel(e.lngLat.lng, e.lngLat.lat);
  }

  function metaRow(label, value, mono) {
    if (value == null || value === '' || value === '—') return '';
    return `<div class="mboard-meta-row"><span class="mboard-meta-key">${label}</span><span class="mboard-meta-val${mono ? ' mboard-meta-val--mono' : ''}">${value}</span></div>`;
  }

  function showLotPanel(lotId, lng, lat, props) {
    const p = props || lotLookup[lotId] || {};
    const address = p.address || `Lot ${p.lot} ${p.dp}`;
    $('#sitePanelTitle').textContent = 'Lot Intelligence';

    const constraints = [
      { k: 'Flood', v: p.flood, ok: p.flood === 'Clear' },
      { k: 'Bushfire', v: p.bushfire, ok: p.bushfire === 'Not mapped' },
      { k: 'Heritage', v: p.heritage, ok: p.heritage === 'None' },
      { k: 'Biodiversity', v: p.biodiversity, ok: p.biodiversity === 'None' },
      { k: 'Contamination', v: p.contamination, ok: p.contamination === 'None' },
      { k: 'Easements', v: p.easements, ok: p.easements === 'None identified' }
    ];

    $('#sitePanelBody').innerHTML = `
      <div class="mboard-site-report mboard-lot-report">
        <div class="mboard-premium-badge">Premium · Mecone-style Lot Intelligence</div>
        <div class="mboard-site-address">${address}</div>
        <div class="mboard-lot-id">${p.lot_id || lotId} · ${p.suburb} NSW ${p.postcode}</div>
        <div class="mboard-site-coords">${lat.toFixed(6)}°, ${lng.toFixed(6)}°</div>

        <div class="mboard-lot-tabs" role="tablist">
          <button type="button" class="active" data-tab="overview">Overview</button>
          <button type="button" data-tab="planning">Planning</button>
          <button type="button" data-tab="property">Property</button>
          <button type="button" data-tab="constraints">Constraints</button>
          <button type="button" data-tab="das">DAs &amp; Sales</button>
        </div>

        <div class="mboard-tab-panel active" data-panel="overview">
          <div class="mboard-meta-table">
            ${metaRow('Lot / DP', `${p.lot} / ${p.dp}`)}
            ${metaRow('Section', p.section)}
            ${metaRow('Plan type', p.plan_type)}
            ${metaRow('Title ref', p.title_ref, true)}
            ${metaRow('LGA', p.lga)}
            ${metaRow('Parish', p.parish)}
            ${metaRow('Area', p.area_display)}
            ${metaRow('Frontage', p.frontage_m ? p.frontage_m + 'm' : null)}
            ${metaRow('Depth', p.depth_m ? p.depth_m + 'm' : null)}
            ${metaRow('Land use', p.land_use)}
            ${metaRow('Dwelling type', p.dwelling_type)}
            ${metaRow('Strata', p.strata)}
            ${metaRow('Owner type', p.owner_type)}
          </div>
          ${p.listing_status ? `<div class="mboard-lot-listing"><span class="mboard-badge mboard-badge--warn">${p.listing_status}</span> ${p.listing_price || ''}</div>` : ''}
        </div>

        <div class="mboard-tab-panel" data-panel="planning">
          <div class="mboard-meta-table">
            ${metaRow('Zone', `<span class="mboard-badge mboard-badge--zone">${p.zone}</span> ${p.zone_name}`)}
            ${metaRow('LEP', p.lep)}
            ${metaRow('FSR', p.fsr)}
            ${metaRow('Height', p.height)}
            ${metaRow('Min lot size', p.min_lot_size)}
            ${metaRow('TOD', p.tod)}
            ${metaRow('LMR Housing', p.lmr)}
            ${metaRow('Corridor', p.corridor)}
          </div>
        </div>

        <div class="mboard-tab-panel" data-panel="property">
          <div class="mboard-meta-table">
            ${metaRow('Last sale', p.last_sale_date)}
            ${metaRow('Sale price', p.last_sale_price)}
            ${metaRow('Land value', p.valuation_land)}
            ${metaRow('Total value', p.valuation_total)}
            ${metaRow('Council rates', p.rates_annual ? p.rates_annual + '/yr' : null)}
            ${metaRow('Year built', p.year_built)}
            ${metaRow('Storeys', p.storeys)}
            ${metaRow('Bedrooms', p.beds)}
            ${metaRow('Bathrooms', p.baths)}
            ${metaRow('Car spaces', p.cars)}
          </div>
        </div>

        <div class="mboard-tab-panel" data-panel="constraints">
          <ul class="mboard-constraint-list mboard-constraint-list--detailed">
            ${constraints.map((c) => `<li><span class="dot" style="background:${c.ok ? '#10b981' : '#f59e0b'}"></span><strong>${c.k}:</strong> ${c.v}</li>`).join('')}
          </ul>
        </div>

        <div class="mboard-tab-panel" data-panel="das">
          <div class="mboard-meta-table">
            ${metaRow('DA number', p.da_number, true)}
            ${metaRow('DA status', p.da_status)}
            ${metaRow('Lodged', p.da_lodged)}
            ${metaRow('Description', p.da_description)}
          </div>
          ${!p.da_number ? '<p class="mboard-hint">No recent development applications on this lot.</p>' : ''}
        </div>

        <div class="mboard-metadata-footer">
          <span>Source: ${p.metadata_source || 'NSW spatial data'}</span>
          <span>Updated: ${p.metadata_updated || '—'}</span>
        </div>

        <div class="mboard-lot-actions">
          <button type="button" class="mboard-btn mboard-btn--ghost mboard-btn--sm" id="btnLotReport">Export lot PDF</button>
          <button type="button" class="mboard-btn mboard-btn--ghost mboard-btn--sm" id="btnClearLot">Clear selection</button>
        </div>
      </div>
    `;

    $('#sitePanelBody').querySelectorAll('.mboard-lot-tabs button').forEach((btn) => {
      btn.addEventListener('click', () => {
        $('#sitePanelBody').querySelectorAll('.mboard-lot-tabs button').forEach((b) => b.classList.toggle('active', b === btn));
        $('#sitePanelBody').querySelectorAll('.mboard-tab-panel').forEach((panel) => {
          panel.classList.toggle('active', panel.dataset.panel === btn.dataset.tab);
        });
      });
    });

    $('#btnClearLot')?.addEventListener('click', () => {
      clearLotSelection();
      $('#sitePanelTitle').textContent = 'Site Intelligence';
      $('#sitePanelBody').innerHTML = `<div class="mboard-site-empty"><div class="mboard-site-empty-icon">📍</div><p>Click any lot on the cadastre grid for premium lot intelligence.</p></div>`;
    });

    $('#btnLotReport')?.addEventListener('click', () => generateSiteReport());

    $('#sitePanel').classList.remove('collapsed');
    map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 16), duration: 800 });
  }

  function nearestStation(lng, lat) {
    if (!nswResearch?.stations) return null;
    const pt = turf.point([lng, lat]);
    let best = null;
    let bestDist = Infinity;
    for (const s of nswResearch.stations) {
      const d = turf.distance(pt, turf.point([s.lng, s.lat]), { units: 'meters' });
      if (d < bestDist) { bestDist = d; best = { ...s, distanceM: Math.round(d) }; }
    }
    return bestDist <= 1200 ? best : null;
  }

  function renderNswContextBanner() {
    const panel = $('#layersPanel .mboard-panel-body');
    if (!panel || !nswResearch || document.getElementById('nswContextBanner')) return;

    const banner = document.createElement('div');
    banner.id = 'nswContextBanner';
    banner.className = 'mboard-nsw-banner';
    banner.innerHTML = `
      <h3>NSW Planning Context</h3>
      <p><strong>Blacktown City:</strong> ~${nswResearch.lgas.blacktown.population2025.toLocaleString()} residents (2025), projected ${nswResearch.lgas.blacktown.populationProjected.toLocaleString()}</p>
      <p><strong>Housing Accord:</strong> ${nswResearch.housingAccord.northWestTarget.toLocaleString()} new homes across Blacktown, The Hills &amp; Hawkesbury by ${nswResearch.housingAccord.targetDate}</p>
      <p><strong>Corridor Strategy:</strong> ${nswResearch.policies.corridor.dwellingCapacityTest.toLocaleString()} dwelling capacity test along Mt Druitt–Toongabbie rail line</p>
      <button type="button" class="mboard-btn mboard-btn--ghost mboard-btn--sm" id="btnNswResearch">View NSW research summary</button>
    `;
    panel.insertBefore(banner, panel.querySelector('.mboard-basemap-picker'));
  }

  function showNswResearchModal() {
    if (!nswResearch) return;
    const r = nswResearch;
    const body = $('#nswResearchBody');
    if (!body) { openModal('#helpModal'); return; }

    body.innerHTML = `
      <div class="mboard-help-grid">
        <div>
          <h4>State Overview</h4>
          <ul>
            <li>Population: ~${(r.meta.population2024 / 1e6).toFixed(1)}M (${r.meta.lastUpdated})</li>
            <li>Planning framework: ${r.meta.planningFramework}</li>
            <li>Zoning standard: ${r.meta.standardInstrument}</li>
            <li>Housing policy: ${r.meta.housingSepp}</li>
          </ul>
        </div>
        <div>
          <h4>TOD Program</h4>
          <ul>
            <li>${r.policies.tod.acceleratedPrecincts} accelerated precincts (1,200m radius)</li>
            <li>${r.policies.tod.seppStations} TOD SEPP stations (400m radius)</li>
            <li>~${r.policies.tod.homesInPipeline.toLocaleString()} homes in planning pipeline</li>
            <li>Western Sydney TOD: Blacktown, St Marys stations</li>
          </ul>
        </div>
        <div>
          <h4>Low &amp; Mid-Rise Housing</h4>
          <ul>
            <li>Stage 2 effective: ${r.policies.lmr.stage2Date}</li>
            <li>${r.policies.lmr.centresAndStations} town centres &amp; stations</li>
            <li>${r.policies.lmr.radius}m walking distance buffer</li>
            <li>Up to ${r.policies.lmr.maxStoreys} storeys near stations</li>
          </ul>
        </div>
        <div>
          <h4>Blacktown Corridor</h4>
          <ul>
            <li>Study area: ${r.policies.corridor.areaHa.toLocaleString()} hectares</li>
            <li>Capacity test: ${r.policies.corridor.dwellingCapacityTest.toLocaleString()} dwellings</li>
            <li>LMR alone could deliver: ${r.policies.corridor.lmrPotential.toLocaleString()}</li>
            <li>Centres: ${r.policies.corridor.centres.join(', ')}</li>
          </ul>
        </div>
        <div>
          <h4>Growth Precincts</h4>
          <ul>
            ${r.growthPrecincts.slice(0, 5).map((p) => `<li><strong>${p.name}</strong> — ${p.status}${p.dwellings ? ' (' + p.dwellings.toLocaleString() + ' dwellings)' : ''}</li>`).join('')}
          </ul>
        </div>
        <div>
          <h4>Urbane Real Estate</h4>
          <ul>
            <li>HQ: ${r.urbane.hq.address}</li>
            <li>${r.urbane.serviceSuburbs} service suburbs across Greater Western Sydney</li>
            <li>${r.urbane.competitors.length} mapped competitor agencies in Blacktown precinct</li>
          </ul>
        </div>
      </div>
      <p class="mboard-disclaimer">Research compiled from ABS Census 2021, NSW Planning Portal, Blacktown City Council corridor strategy, National Housing Accord targets, and Housing SEPP 2021. Demonstration layers — verify with authoritative sources before planning decisions.</p>
    `;
    openModal('#nswResearchModal');
  }

  function showSitePanel(lng, lat, extra = {}) {
    if (!extra.listing) {
      const lotHit = findFeatureAt('lots', lng, lat);
      if (lotHit) {
        selectLot(lotHit.properties.lot_id, lng, lat, lotHit);
        return;
      }
    }

    const zone = findFeatureAt('zoning', lng, lat);
    const lotAtPoint = findFeatureAt('lots', lng, lat);
    const parcel = lotAtPoint || findFeatureAt('parcels', lng, lat);
    const flood = findFeatureAt('flood', lng, lat);
    const bushfire = findFeatureAt('bushfire', lng, lat);
    const heritage = findFeatureAt('heritage', lng, lat);
    const pop = findFeatureAt('population', lng, lat);
    const todZone = findFeatureAt('tod', lng, lat);
    const lmrZone = findFeatureAt('lmr', lng, lat);
    const corridorZone = findFeatureAt('corridor-area', lng, lat) || findFeatureAt('corridor', lng, lat);
    const precinct = findFeatureAt('precincts', lng, lat);
    const lgaZone = findFeatureAt('lga', lng, lat);
    const serviceZone = findFeatureAt('service-area', lng, lat);
    const station = nearestStation(lng, lat);

    const address = extra.address || parcel?.properties?.address || reverseGeocodeShort(lng, lat);
    const zp = zone?.properties || {};
    const isNsw = $('#jurisdictionSelect').value === 'NSW';

    $('#sitePanelBody').innerHTML = `
      <div class="mboard-site-report">
        <div class="mboard-site-address">${address}</div>
        <div class="mboard-site-coords">${lat.toFixed(6)}°, ${lng.toFixed(6)}°</div>

        ${isNsw && (todZone || lmrZone || corridorZone || station) ? `
        <div class="mboard-data-section">
          <h3>NSW Housing Policy</h3>
          <ul class="mboard-constraint-list">
            ${station ? `<li><span class="dot" style="background:#06b6d4"></span> Nearest station: <strong>${station.name}</strong> (${station.distanceM}m) — ${station.lines.join(', ')}</li>` : ''}
            ${todZone ? `<li><span class="dot" style="background:#eab308"></span> TOD: ${todZone.properties.name} (${todZone.properties.policy})</li>` : ''}
            ${lmrZone ? `<li><span class="dot" style="background:#f97316"></span> LMR Housing: ${lmrZone.properties.name} — max ${lmrZone.properties.max_storeys} storeys</li>` : ''}
            ${corridorZone ? `<li><span class="dot" style="background:#dc2626"></span> Mt Druitt–Toongabbie Corridor — ${corridorZone.properties.dwellings || (corridorZone.properties.area_ha ? corridorZone.properties.area_ha.toLocaleString() + ' ha study area' : 'In corridor')}</li>` : ''}
            ${precinct ? `<li><span class="dot" style="background:#f59e0b"></span> Growth precinct: ${precinct.properties.name} (${precinct.properties.status})</li>` : ''}
          </ul>
        </div>` : ''}

        <div class="mboard-data-section">
          <h3>Planning Controls</h3>
          <div class="mboard-data-grid">
            <div class="mboard-data-item">
              <div class="label">Zone</div>
              <div class="value"><span class="mboard-badge mboard-badge--zone">${zp.zone || '—'}</span> ${zp.name || ''}</div>
            </div>
            <div class="mboard-data-item">
              <div class="label">LGA</div>
              <div class="value">${zp.lga || lgaZone?.properties?.name || '—'}</div>
            </div>
            <div class="mboard-data-item">
              <div class="label">LEP</div>
              <div class="value">${zp.lep || '—'}</div>
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
            ${serviceZone ? `<div class="mboard-data-item"><div class="label">Urbane Footprint</div><div class="value"><span class="mboard-badge mboard-badge--ok">In service area</span></div></div>` : ''}
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

  function searchLots(query) {
    const q = query.toLowerCase();
    const lots = sourceMap.lots?.features || [];
    return lots.filter((f) => {
      const p = f.properties;
      return [p.lot_id, p.lot, p.dp, p.address, p.suburb].some((v) => v && String(v).toLowerCase().includes(q));
    }).slice(0, 6).map((f) => {
      const c = f.geometry.coordinates[0];
      return {
        ...f.properties,
        lng: (c[0][0] + c[2][0]) / 2,
        lat: (c[0][1] + c[2][1]) / 2
      };
    });
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

    const lotMatches = searchLots(query);
    if (lotMatches.length) {
      results.innerHTML = lotMatches.map((m) =>
        `<button type="button" data-lot="${m.lot_id}" data-lng="${m.lng}" data-lat="${m.lat}">${m.address || m.lot_id}<small>${m.lot_id} · ${m.zone}${m.suburb ? ' · ' + m.suburb : ''}</small></button>`
      ).join('');
      results.hidden = false;
      results.querySelectorAll('button[data-lot]').forEach((btn) => {
        btn.addEventListener('click', () => {
          selectLot(btn.dataset.lot, +btn.dataset.lng, +btn.dataset.lat);
          results.hidden = true;
          $('#geoSearch').value = btn.textContent.trim();
        });
      });
      return;
    }

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
    $('#coordsDisplay').textContent = `${e.lngLat.lat.toFixed(5)}, ${e.lngLat.lng.toFixed(5)}`;
    if (!selectedLotId) updateFooterInfo(e.lngLat.lng, e.lngLat.lat);
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
      const footerJ = $('#footerJurisdiction');
      if (footerJ) footerJ.value = e.target.value;
      const j = config.jurisdictions[e.target.value];
      if (j) flyTo(j.center[0], j.center[1], j.zoom);
    });

    $('#footerJurisdiction')?.addEventListener('change', (e) => {
      const sidebarJ = $('#jurisdictionSelect');
      if (sidebarJ) sidebarJ.value = e.target.value;
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

    document.addEventListener('click', (e) => {
      if (e.target.id === 'btnNswResearch') showNswResearchModal();
    });

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
