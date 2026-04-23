<template>
  <div ref="pageRef" class="eco-page">
    <aside class="sidebar" :class="{ 'is-hidden': !isSidebarVisible }">
      <div class="brand">
        <div class="brand-head">
          <h1>Карта Темиртау</h1>

          <button
            type="button"
            class="sidebar-toggle-btn"
            @click="toggleSidebar"
          >
            Скрыть
          </button>
        </div>
      </div>

      <div class="sidebar-inner">
        <small>
          Выберите район и посмотрите индекс экологического стресса на карте.
        </small>

        <div class="card">
            <label class="label">Об авторе</label>
            <div class="author-card">
              <div class="author-image">
                <img loading="lazy" src="/avatar.jpeg" alt=""/>
              </div>
              <div class="author-content">
                <h3 title="Абсейт Инкарим Валихановна">Абсеит Инкарим Валихановна</h3>
                <a target="_blank" href="https://www.instagram.com/valihankyzy__/">Instagram</a>
              </div>
            </div>
        </div>

        <div class="card">
          <label class="label">Режим отображения</label>

          <div class="mode-switch">
            <button
              type="button"
              class="mode-btn"
              :class="{ active: displayMode === 'single' }"
              @click="setDisplayMode('single')"
            >
              Одиночный
            </button>

            <button
              type="button"
              class="mode-btn"
              :class="{ active: displayMode === 'multiple' }"
              @click="setDisplayMode('multiple')"
            >
              Все районы
            </button>
          </div>

          <div v-if="displayMode === 'multiple'" class="level-filter-box">
            <label class="label" for="levelFilter">Сортировка по индексу</label>

            <select
              id="levelFilter"
              v-model="multipleLevelFilter"
              class="level-filter-select"
            >
              <option value="all">Все районы</option>
              <option value="critical">Критический</option>
              <option value="high">Высокий</option>
              <option value="moderate">Умеренный</option>
              <option value="low">Низкий</option>
            </select>
          </div>

          <div class="radius-control">
            <div class="radius-head">
              <label class="label radius-label">Радиус площади</label>
              <strong class="radius-value">{{ areaRadiusLabel }}</strong>
            </div>

            <input
              v-model.number="areaRadius"
              type="range"
              class="radius-range"
              min="200"
              max="500"
              step="100"
            />

            <div class="radius-scale">
              <span>200 м</span>
              <span>500 м</span>
            </div>
          </div>
        </div>

        <div class="card">
          <label class="label">Поиск района</label>

          <div class="search-box" :class="{ 'is-active': isSearching }">
            <span class="search-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 21L16.65 16.65M18 11C18 14.866 14.866 18 11 18C7.13401 18 4 14.866 4 11C4 7.13401 7.13401 4 11 4C14.866 4 18 7.13401 18 11Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>

            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="Введите название района..."
              autocomplete="off"
              @keydown.esc="clearSearch"
            />

            <button
              v-if="searchQuery"
              type="button"
              class="search-clear"
              aria-label="Очистить поиск"
              @click="clearSearch"
            >
              ×
            </button>
          </div>
        </div>

        <div v-if="isSearching" class="card">
          <div class="card-head">
            <div>
              <div class="card-title">Результаты поиска</div>
              <div class="card-subtitle">Найдено: {{ filteredAreas.length }}</div>
            </div>
          </div>

          <div v-if="filteredAreas.length" class="search-list">
            <button
              v-for="area in filteredAreas"
              :key="area.id"
              type="button"
              class="search-item"
              :class="{ active: area.id === selectedAreaId }"
              @click="handleAreaSelect(area)"
            >
              <div class="search-item-main">
                <div class="search-item-top">
                  <span
                    class="search-dot"
                    :class="resolveLevel(getIndex(area)).className"
                  ></span>

                  <strong v-html="highlightMatch(area.name)"></strong>
                </div>

                <span>
                  Индекс: {{ getIndex(area) }} · {{ resolveLevel(getIndex(area)).label }}
                </span>
              </div>

              <span class="search-arrow">→</span>
            </button>
          </div>

          <div v-else class="empty-state">
            По вашему запросу ничего не найдено
          </div>
        </div>

        <template v-else-if="activeArea">
          <div :key="activeArea.id" class="card">
            <div class="card-head">
              <div>
                <div class="card-title">Индекс экологического стресса</div>
                <p class="card-subtitle">{{ activeArea.name }}</p>
              </div>

              <div class="badge" :class="activeArea.level.className">
                {{ activeArea.level.label }}
              </div>
            </div>

            <div class="index-box" :class="activeArea.level.className">
              <div class="index-number">{{ activeArea.index }}</div>

              <div class="index-meta">
                <strong>{{ activeArea.level.label }}</strong>
                <span>по выбранному району</span>
              </div>
            </div>

            <div class="formula">
              I = (air × 0.40 + noise × 0.20 + traffic × 0.20 + (10 - greenZones) ×
              0.20) × 10
            </div>

            <div class="mini-grid">
              <div class="mini-card">
                <span>Воздух 💨</span>
                <strong>{{ activeArea.factors_air }}/10</strong>
              </div>

              <div class="mini-card">
                <span>Шум 🔊</span>
                <strong>{{ activeArea.factors_noise }}/10</strong>
              </div>

              <div class="mini-card">
                <span>Транспорт 🚌</span>
                <strong>{{ activeArea.factors_traffic }}/10</strong>
              </div>

              <div class="mini-card">
                <span>Зелёные зоны 🌳</span>
                <strong>{{ activeArea.factors_greenZones }}/10</strong>
              </div>
            </div>

            <div class="coords-card">
              <span>Координаты 🗺️</span>
              <strong>{{ activeArea.lat }}, {{ activeArea.lan }}</strong>
            </div>
          </div>

          <div v-if="currentNoiseLevelInfo" class="card">
            <div class="card-head">
              <div>
                <div class="card-subtitle">Влияние шума</div>
              </div>

              <div class="badge" :class="activeArea.level.className">
                {{ activeArea.level.label }}
              </div>
            </div>

            <details class="spoiler-block" open>
              <summary class="spoiler-summary">
                Риски влияния на организм
              </summary>

              <div class="spoiler-content">
                <div
                  v-for="(item, idx) in currentNoiseLevelInfo.risks_body"
                  :key="`body-${idx}`"
                  class="gray-item"
                >
                  {{ item }}
                </div>
              </div>
            </details>

            <details class="spoiler-block">
              <summary class="spoiler-summary">
                Риски влияния на психологию
              </summary>

              <div class="spoiler-content">
                <div
                  v-for="(item, idx) in currentNoiseLevelInfo.risks_psychology"
                  :key="`psychology-${idx}`"
                  class="gray-item"
                >
                  {{ item }}
                </div>
              </div>
            </details>

            <details class="spoiler-block">
              <summary class="spoiler-summary">
                Риски влияния на социальную жизнь
              </summary>

              <div class="spoiler-content">
                <div
                  v-for="(item, idx) in currentNoiseLevelInfo.risks_social"
                  :key="`social-${idx}`"
                  class="gray-item"
                >
                  {{ item }}
                </div>
              </div>
            </details>

            <details class="spoiler-block">
              <summary class="spoiler-summary">
                Как стресс влияет
              </summary>

              <div class="spoiler-content">
                <div
                  v-for="(item, idx) in currentNoiseLevelInfo.stress_effect"
                  :key="`stress-${idx}`"
                  class="gray-item"
                >
                  {{ item }}
                </div>
              </div>
            </details>

            <details class="spoiler-block">
              <summary class="spoiler-summary">
                Методы профилактики
              </summary>

              <div class="spoiler-content">
                <div
                  v-for="(item, idx) in currentNoiseLevelInfo.prevention"
                  :key="`prevention-${idx}`"
                  class="gray-item"
                >
                  {{ item }}
                </div>
              </div>
            </details>
          </div>
        </template>
      </div>
    </aside>

    <section class="map-section">
      <button
        v-if="!isSidebarVisible"
        type="button"
        class="sidebar-show-btn"
        @click="toggleSidebar"
      >
        Показать панель
      </button>

      <div ref="mapRef" class="map"></div>

      <div class="map-actions">
        <button
          type="button"
          class="map-btn"
          aria-label="Увеличить"
          @click="zoomIn"
        >
          +
        </button>

        <button
          type="button"
          class="map-btn"
          aria-label="Уменьшить"
          @click="zoomOut"
        >
          −
        </button>
      </div>

      <div class="map-overlay">
        <div class="overlay-card">
          <strong>{{ currentCity.name }}</strong>
          <span>
            {{ displayMode === 'single' ? 'Одиночный режим' : 'Все районы' }}
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-providers'
import areas from '../../data/temirtau-areas.json'
import noiseLevels from '../../data/noise-levels.json'

const currentCity = {
  id: 'temirtau',
  name: 'Темиртау',
  center: [50.0549, 72.9646],
  zoom: 14
}

const selectedAreaId = ref(areas[0]?.id ?? null)
const activeArea = ref(null)
const isSidebarVisible = ref(true)
const searchQuery = ref('')
const displayMode = ref('single')
const areaRadius = ref(300)
const multipleLevelFilter = ref('all')

const pageRef = ref(null)
const searchInputRef = ref(null)
const mapRef = ref(null)

let mapInstance = null
let tileLayer = null
let areaLayerGroup = null

const cssColorMap = ref({
  low: '#198754',
  moderate: '#d4a106',
  high: '#fd7e14',
  critical: '#dc3545',
  primary: '#2563eb',
})

const escapeRegExp = (value = '') =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const escapeHtml = (value = '') =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

const normalizedSearch = computed(() => searchQuery.value.trim().toLowerCase())
const isSearching = computed(() => normalizedSearch.value.length > 0)

const areaRadiusLabel = computed(() => {
  if (areaRadius.value >= 1000) {
    const km = areaRadius.value / 1000
    return `${Number.isInteger(km) ? km : km.toFixed(1)} км`
  }

  return `${areaRadius.value} м`
})

const currentNoiseLevelInfo = computed(() => {
  const levelKey = activeArea.value?.level?.className
  if (!levelKey) return null
  return noiseLevels[levelKey] ?? null
})

const syncCssColors = () => {
  const el = pageRef.value
  if (!el) return

  const styles = getComputedStyle(el)

  cssColorMap.value = {
    low: styles.getPropertyValue('--color-low-polygon').trim() || '#198754',
    moderate: styles.getPropertyValue('--color-moderate-polygon').trim() || '#d4a106',
    high: styles.getPropertyValue('--color-high-polygon').trim() || '#fd7e14',
    critical: styles.getPropertyValue('--color-critical-polygon').trim() || '#dc3545',
    primary: styles.getPropertyValue('--color-primary-polygon').trim() || '#2563eb',
  }
}

const resolveLevel = (index) => {
  if (index >= 75) return { label: 'Критический', className: 'critical' }
  if (index >= 50) return { label: 'Высокий', className: 'high' }
  if (index >= 25) return { label: 'Умеренный', className: 'moderate' }
  return { label: 'Низкий', className: 'low' }
}

const getIndex = (area) => {
  const greenStress = 10 - area.factors_greenZones

  return Math.round(
    (
      area.factors_air * 0.4 +
      area.factors_noise * 0.2 +
      area.factors_traffic * 0.2 +
      greenStress * 0.2
    ) * 10
  )
}

const buildArea = (area) => {
  if (!area) return null

  const index = getIndex(area)

  return {
    ...area,
    index,
    level: resolveLevel(index),
  }
}

const getAreaLatLng = (area) => [area.lat, area.lan]

const getAreaColor = (area) => {
  if (!area?.level?.className) return cssColorMap.value.primary
  return cssColorMap.value[area.level.className] || cssColorMap.value.primary
}

const filteredAreas = computed(() => {
  const query = normalizedSearch.value
  if (!query) return []

  return areas.filter((area) => area.name.toLowerCase().includes(query))
})

const visibleMultipleAreas = computed(() => {
  if (multipleLevelFilter.value === 'all') return areas

  return areas.filter((area) => {
    const level = resolveLevel(getIndex(area))
    return level.className === multipleLevelFilter.value
  })
})

const highlightMatch = (text = '') => {
  const safeText = escapeHtml(text)
  const query = normalizedSearch.value

  if (!query) return safeText

  const pattern = new RegExp(`(${escapeRegExp(query)})`, 'ig')
  return safeText.replace(pattern, '<mark>$1</mark>')
}

const setActiveAreaById = (id) => {
  selectedAreaId.value = Number(id)
  const rawArea = areas.find((item) => item.id === selectedAreaId.value) ?? null
  activeArea.value = buildArea(rawArea)
}

const clearAreas = () => {
  if (!mapInstance || !areaLayerGroup) return
  areaLayerGroup.clearLayers()
}

const createAreaCircle = (area, isActive = false) => {
  const builtArea = buildArea(area)
  const areaColor = getAreaColor(builtArea)

  const circle = L.circle(getAreaLatLng(builtArea), {
    radius: areaRadius.value,
    color: areaColor,
    fillColor: areaColor,
    fillOpacity: isActive ? 0.38 : 0.2,
    weight: isActive ? 4 : 2,
    opacity: isActive ? 1 : 0.85,
  })

  circle.bindPopup(
    `<strong>${builtArea.name}</strong><br>Индекс: ${builtArea.index}<br>Уровень: ${builtArea.level.label}<br>Радиус: ${areaRadiusLabel.value}`
  )

  circle.on('click', () => {
    handleAreaSelect(area, { fromMap: true })
  })

  return circle
}

const renderAreas = () => {
  if (!mapInstance || !areaLayerGroup) return

  clearAreas()

  if (displayMode.value === 'single') {
    if (!activeArea.value) return
    areaLayerGroup.addLayer(createAreaCircle(activeArea.value, true))
    return
  }

  visibleMultipleAreas.value.forEach((area) => {
    const isActive = Number(area.id) === selectedAreaId.value
    areaLayerGroup.addLayer(createAreaCircle(area, isActive))
  })
}

const focusArea = () => {
  if (!mapInstance || !activeArea.value) return

  mapInstance.flyTo(getAreaLatLng(activeArea.value), 14, {
    duration: 0.8,
  })
}

const handleAreaSelect = (area, options = {}) => {
  setActiveAreaById(area.id)
  searchQuery.value = ''
  renderAreas()

  if (options.fromMap || displayMode.value === 'single') {
    focusArea()
  }
}

const clearSearch = async () => {
  searchQuery.value = ''
  await nextTick()
  searchInputRef.value?.focus()
}

const setDisplayMode = (mode) => {
  if (displayMode.value === mode) return

  displayMode.value = mode

  if (mode === 'single') {
    multipleLevelFilter.value = 'all'
  }

  renderAreas()

  if (mode === 'single') {
    focusArea()
  } else if (mapInstance) {
    mapInstance.flyTo(currentCity.center, currentCity.zoom, {
      duration: 0.8,
    })
  }
}

const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value

  if (!mapInstance) return

  setTimeout(() => {
    mapInstance.invalidateSize()
  }, 250)
}

const zoomIn = () => {
  if (mapInstance) mapInstance.zoomIn()
}

const zoomOut = () => {
  if (mapInstance) mapInstance.zoomOut()
}

watch(areaRadius, () => {
  renderAreas()
})

watch(multipleLevelFilter, () => {
  if (displayMode.value === 'multiple') {
    renderAreas()
  }
})

const cityBounds = [
  [50.00, 72.90], // низ левый (пример)
  [50.10, 73.05], // верх правый
]

onMounted(async () => {
  setActiveAreaById(areas[0]?.id)

  await nextTick()
  syncCssColors()

  mapInstance = L.map(mapRef.value, {
    zoomControl: false,
    preferCanvas: true,
  }).setView(currentCity.center, currentCity.zoom)

  tileLayer = L.tileLayer.provider('Stadia.Outdoors')
  tileLayer.addTo(mapInstance)

  areaLayerGroup = L.layerGroup().addTo(mapInstance)

  if (mapInstance.attributionControl) {
    mapInstance.attributionControl.setPrefix(false)
    mapInstance.attributionControl.setPosition('bottomright')
  }

  renderAreas()
  focusArea()
})

onBeforeUnmount(() => {
  clearAreas()

  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }

  areaLayerGroup = null
  tileLayer = null
})
</script>

<style scoped>
.eco-page {
  --color-page-bg: #f5f7fb;
  --color-text-main: #1f2937;
  --color-text-dark: #111827;
  --color-text-title: #333333;
  --color-text-muted: #6b7280;
  --color-text-light: #9ca3af;
  --color-white: #ffffff;

  --color-primary: #92a8b3;
  --color-primary-font:#fff;
  --color-primary-hover: #eff6ff;
  --color-primary-border: #93c5fd;
  --color-primary-ring: rgba(37, 99, 235, 0.08);

  --color-border: #e5e7eb;
  --color-border-soft: #eef2f7;
  --color-border-input: #d1d5db;

  --color-surface: #ffffff;
  --color-surface-soft: #f8fafc;
  --color-surface-muted: #f3f4f6;
  --color-surface-clear: rgba(255, 255, 255, 0.96);
  --color-surface-clear-soft: #ffffffeb;
  --color-surface-clear-attribution: rgba(255, 255, 255, 0.78);

  --color-mark-bg: #fde68a;

  --color-low: #8aa282;
  --color-low-font: #fff;
  --color-low-soft: #8aa282;
  --color-moderate: #d8a75f;
  --color-moderate-font: #fff;
  --color-high: #bc8f8f;
  --color-high-font: #fff5ee;
  --color-critical: #ff7779;
  --color-critical-font: #fff;

  --color-low-polygon: hsl(91, 49%, 55%);
  --color-moderate-polygon: #d8a75f;
  --color-high-polygon: hsl(0, 25%, 60%);
  --color-critical-polygon: #ff7779;

  --shadow-sm: 0 6px 18px rgba(15, 23, 42, 0.08);
  --shadow-card: 0 8px 24px rgba(15, 23, 42, 0.04);
  --shadow-md: 0 10px 30px rgba(15, 23, 42, 0.12);
  --shadow-lg: 0 10px 30px rgba(15, 23, 42, 0.18);
  --shadow-xl: 0 14px 34px rgba(15, 23, 42, 0.2);
  --shadow-sidebar: 0 20px 50px rgba(15, 23, 42, 0.18);

  position: relative;
  width: 100%;
  min-height: 100dvh;
  overflow: hidden;
  background: var(--color-page-bg);
  color: var(--color-text-main);
}

* {
  box-sizing: border-box;
}

.author-card {
  display: flex;
  gap:1.5rem;
  align-items: center;
}

.author-image {
  width:5rem;
  height:5rem;
  background-color: var(--color-primary);
  border-radius: 100%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.author-image > img {
  width:4.5rem;
  height: 4.5rem;
  border-radius: 100%;
}

.author-content {
  display: flex;
  flex-direction: column;
  gap:0.5rem;
  min-width: 0;
}

.author-content > * {
  margin:0;
}

.author-content > a {
  color:var(--color-primary)
}

.sidebar {
  position: absolute;
  top: 16px;
  left: 16px;
  bottom: 16px;
  z-index: 700;
  width: min(400px, calc(100vw - 32px));
  overflow: hidden;
  background: var(--color-surface-clear);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(229, 231, 235, 0.9);
  border-radius: 24px;
  box-shadow: var(--shadow-sidebar);
  transition: 0.25s ease;
}

.sidebar.is-hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateX(-24px);
}

.brand {
  padding: 1rem;
  height: 4rem;
}

.brand-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.brand h1 {
  margin: 0 0 8px;
  font-size: 28px;
  line-height: 1.1;
  color: var(--color-text-title);
}

.sidebar-inner {
  margin: 0 0.5rem;
  height: calc(100% - 4rem);
  padding: 1rem;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-toggle-btn,
.sidebar-show-btn {
  border: 0;
  cursor: pointer;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 600;
  background: var(--color-primary);
  color: var(--color-primary-font);
}

.sidebar-show-btn {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 800;
  box-shadow: var(--shadow-lg);
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 16px;
  margin-top: 16px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap:1rem;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-title {
  font-size: 12px;
  margin-bottom:0.5rem;
  color: var(--color-text-muted);
}

.card-subtitle {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
}

.badge {
  padding: 8px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-white);
}

.badge.low {
  background: var(--color-low-soft);
  color: var(--color-low-font);
}

.badge.moderate {
  background: var(--color-moderate);
  color: var(--color-moderate-font);
}

.badge.high {
  background: var(--color-high);
  color: var(--color-high-font);
}

.badge.critical {
  background: var(--color-critical);
  color: var(--color-critical-font);
}

.label {
  display: block;
  font-size: 14px;
  font-weight: 600;
}

.mode-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.mode-btn {
  border: 1px solid var(--color-border-input);
  background: var(--color-surface-soft);
  color: #374151;
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.18s ease;
}

.mode-btn:hover {
  border-color: var(--color-primary-border);
  background: var(--color-primary-hover);
}

.mode-btn.active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-primary-font)
}

.level-filter-box {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap:1rem;
}

.level-filter-select {
  width: 100%;
  min-height: 48px;
  padding: 12px 14px;
  border: 1px solid var(--color-border-input);
  border-radius: 14px;
  background: var(--color-surface);
  color: var(--color-text-dark);
  font-size: 14px;
  outline: none;
  transition: 0.18s ease;
}

.level-filter-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-primary-ring);
}

.radius-control {
  margin-top: 14px;
  padding: 14px;
  border-radius: 14px;
  background: var(--color-surface-soft);
  border: 1px solid var(--color-border-soft);
}

.radius-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  margin-bottom:1rem;
}

.radius-label {
  margin: 0;
}

.radius-value {
  font-size: 14px;
  color: var(--color-primary);
}

.radius-range {
  width: 100%;
  cursor: pointer;
}

.radius-scale {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 48px;
  border: 1px solid var(--color-border-input);
  border-radius: 14px;
  background: var(--color-surface-muted);
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.search-box:focus-within,
.search-box.is-active {
  background: var(--color-surface);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-primary-ring);
}

.search-icon {
  position: absolute;
  left: 14px;
  width: 18px;
  height: 18px;
  color: var(--color-text-muted);
  pointer-events: none;
}

.search-icon svg {
  display: block;
  width: 100%;
  height: 100%;
}

.search-input {
  width: 100%;
  min-height: 48px;
  padding: 12px 44px 12px 42px;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--color-text-dark);
  font-size: 15px;
}

.search-input::placeholder {
  color: var(--color-text-light);
}

.search-clear {
  position: absolute;
  right: 10px;
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: 999px;
  background: var(--color-border);
  color: #4b5563;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition: 0.18s ease;
}

.search-clear:hover {
  background: var(--color-border-input);
  color: var(--color-text-dark);
}

.search-list {
  display: grid;
  gap: 10px;
}

.search-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-surface-soft);
  cursor: pointer;
  text-align: left;
  transition: 0.18s ease;
}

.search-item:hover,
.search-item.active {
  border-color: var(--color-primary);
  background: var(--color-primary-hover);
}

.search-item-main {
  display: grid;
  gap: 4px;
}

.search-item-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex-shrink: 0;
}

.search-dot.low {
  background: var(--color-low);
}

.search-dot.moderate {
  background: var(--color-moderate);
}

.search-dot.high {
  background: var(--color-high);
}

.search-dot.critical {
  background: var(--color-critical);
}

.search-item-main strong {
  font-size: 15px;
  color: var(--color-text-dark);
  font-weight: 700;
}

.search-item-main span {
  font-size: 13px;
  color: var(--color-text-muted);
}

.search-arrow {
  font-size: 18px;
  color: var(--color-primary);
  flex-shrink: 0;
}

:deep(mark) {
  padding: 0 2px;
  border-radius: 6px;
  background: var(--color-mark-bg);
  color: inherit;
}

.empty-state {
  padding: 14px;
  border-radius: 14px;
  background: var(--color-surface-soft);
  border: 1px solid var(--color-border-soft);
  color: var(--color-text-muted);
  font-size: 14px;
}

.index-box {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border-radius: 18px;
  color: var(--color-white);
}

.index-box.low {
  background: var(--color-low);
  color: var(--color-low-font);
}

.index-box.moderate {
  background: var(--color-moderate);
  color: var(--color-moderate-font);
}

.index-box.high {
  background: var(--color-high);
  color: var(--color-high-font);
}

.index-box.critical {
  background: var(--color-critical);
  color: var(--color-critical-font);
}

.index-number {
  font-size: 44px;
  font-weight: 800;
  line-height: 1;
}

.index-meta {
  display: grid;
  gap: 4px;
}

.index-meta span {
  font-size: 13px;
  opacity: 0.95;
}

.formula {
  margin-top: 12px;
  padding: 12px;
  border-radius: 14px;
  background: var(--color-surface-soft);
  border: 1px solid var(--color-border-soft);
  font-size: 13px;
  line-height: 1.5;
}

.mini-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 12px;
}

.mini-card,
.coords-card {
  display: grid;
  gap: 0.7rem;
  padding: 12px;
  border-radius: 14px;
  background: var(--color-surface-soft);
  border: 1px solid var(--color-border-soft);
}

.mini-card span,
.coords-card span {
  font-size: 12px;
  text-align: center;
  color: var(--color-text-muted);
}

.mini-card strong,
.coords-card strong {
  font-size: 18px;
  text-align: center;
}

.coords-card {
  margin-top: 12px;
}

.spoiler-block {
  margin-top: 12px;
  border: 1px solid var(--color-border-soft);
  border-radius: 16px;
  background: var(--color-surface-soft);
  overflow: hidden;
}

.spoiler-summary {
  position: relative;
  display: flex;
  min-height: 52px;
  padding: 14px 44px 14px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-dark);
  list-style: none;
  user-select: none;
}

.spoiler-summary::-webkit-details-marker {
  display: none;
}

.spoiler-summary::after {
  content: '+';
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-muted);
  transition: transform 0.18s ease;
}

.spoiler-block[open] .spoiler-summary::after {
  content: '−';
}

.spoiler-content {
  padding: 0 14px 14px;
  display: grid;
  gap: 10px;
}

.gray-item {
  padding: 12px 14px;
  border-radius: 12px;
  background: #eef2f7;
  border: 1px solid #e5e7eb;
  color: var(--color-text-main);
  font-size: 14px;
  line-height: 1.55;
}

.map-section {
  position: relative;
  min-height: 100dvh;
  height: 100dvh;
}

.map {
  width: 100%;
  height: 100dvh;
}

.map-actions {
  position: absolute;
  right: 20px;
  bottom: 24px;
  z-index: 800;
  display: grid;
  gap: 10px;
}

.map-btn {
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: 16px;
  background: var(--color-surface-clear);
  color: var(--color-text-main);
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.map-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-xl);
}

.map-btn:active {
  transform: scale(0.97);
}

.map-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 500;
}

.overlay-card {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 16px;
  background: var(--color-surface-clear);
  box-shadow: var(--shadow-md);
}

.overlay-card span {
  color: var(--color-text-muted);
  font-size: 12px;
}

:deep(.leaflet-control-attribution) {
  margin: 0 0 12px 12px !important;
  padding: 6px 10px !important;
  border-radius: 12px;
  background: var(--color-surface-clear-soft) !important;
  box-shadow: var(--shadow-md);
  font-size: 12px !important;
  line-height: 1.2;
  color: var(--color-text-main);
}

:deep(.leaflet-control-attribution a) {
  text-decoration: none;
  font-size: inherit;
}

@media (max-width: 980px) {
  .sidebar {
    top: 12px;
    left: 12px;
    right: 12px;
    bottom: 12px;
    width: auto;
    border-radius: 20px;
  }

  .mini-grid {
    grid-template-columns: 1fr;
  }

  .map-actions {
    right: 16px;
    bottom: 20px;
  }

  .map-overlay {
    top: auto;
    right: 16px;
    bottom: 140px;
  }

  .mode-switch {
    grid-template-columns: 1fr;
  }
}
</style>