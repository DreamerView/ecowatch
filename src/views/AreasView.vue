<script setup>
import { ref, onMounted, watch } from 'vue'

const areas = ref([])

const form = ref({
  name: '',
  coords: '',
  lat: '',
  lan: '',
  factors_air: 0,
  factors_noise: 0,
  factors_traffic: 0,
  factors_greenZones: 0
})

// ==========================
// 🧠 DMS → Decimal
// ==========================
const parseDMS = (str) => {
  try {
    const regex = /(\d+)°(\d+)'(\d+)"?([NSEW])/g
    const matches = [...str.matchAll(regex)]

    if (matches.length < 2) return null

    const toDecimal = (deg, min, sec, dir) => {
      let dec = +deg + +min / 60 + +sec / 3600
      if (dir === 'S' || dir === 'W') dec *= -1
      return +dec.toFixed(6)
    }

    const lat = toDecimal(...matches[0].slice(1))
    const lon = toDecimal(...matches[1].slice(1))

    return { lat, lon }
  } catch {
    return null
  }
}

// ==========================
// ⚡ авто-конвертация (FORM)
// ==========================
watch(() => form.value.coords, (val) => {
  const parsed = parseDMS(val)
  if (parsed) {
    form.value.lat = parsed.lat
    form.value.lan = parsed.lon
  }
})

// ==========================
// 📥 загрузка
// ==========================
const loadAreas = async () => {
  const res = await fetch('/api/areas')
  const data = await res.json()

  areas.value = data.map(a => ({
    ...a,
    coords: ''
  }))
}

// ==========================
// ➕ добавление
// ==========================
const addArea = async () => {
  await fetch('/api/areas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...form.value,
      lat: +form.value.lat,
      lan: +form.value.lan,
      factors_air: +form.value.factors_air,
      factors_noise: +form.value.factors_noise,
      factors_traffic: +form.value.factors_traffic,
      factors_greenZones: +form.value.factors_greenZones
    })
  })

  await loadAreas()

  form.value = {
    name: '',
    coords: '',
    lat: '',
    lan: '',
    factors_air: 0,
    factors_noise: 0,
    factors_traffic: 0,
    factors_greenZones: 0
  }
}

// ==========================
// ✏️ обновление
// ==========================
const updateArea = async (area) => {
  await fetch(`/api/areas/${area.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(area)
  })
}

// ==========================
// 🧠 авто-конвертация INLINE
// ==========================
const handleCoordsEdit = (area) => {
  const parsed = parseDMS(area.coords)

  if (parsed) {
    area.lat = parsed.lat
    area.lan = parsed.lon
    updateArea(area)
  }
}

// ==========================
// 🗑 удаление
// ==========================
const deleteArea = async (id) => {
  await fetch(`/api/areas/${id}`, { method: 'DELETE' })
  await loadAreas()
}

onMounted(loadAreas)
</script>

<template>
  <div class="container py-3">

    <!-- ADD -->
    <h5 class="mb-3">Добавить район</h5>

    <div class="d-flex flex-column gap-2 mb-4">

      <input v-model="form.name" placeholder="Название" class="form-control" />

      <input
        v-model="form.coords"
        placeholder="50°3'26&quot;N 72°56'9&quot;E"
        class="form-control"
      />

      <div class="d-flex gap-2">
        <input v-model="form.lat" placeholder="lat" class="form-control" />
        <input v-model="form.lan" placeholder="lon" class="form-control" />
      </div>

      <div class="d-flex gap-2">
        <input v-model="form.factors_air" placeholder="air" class="form-control" />
        <input v-model="form.factors_noise" placeholder="noise" class="form-control" />
        <input v-model="form.factors_traffic" placeholder="traffic" class="form-control" />
        <input v-model="form.factors_greenZones" placeholder="green" class="form-control" />
      </div>

      <button class="btn btn-dark" @click="addArea">
        Добавить
      </button>

    </div>

    <!-- TABLE -->
    <div class="table-responsive border rounded-3">

      <table class="table table-sm align-middle mb-0">

        <thead class="table-light">
          <tr>
            <th style="width: 180px">Название</th>
            <th style="width: 220px">DMS</th>
            <th style="width: 110px">Lat</th>
            <th style="width: 110px">Lon</th>
            <th>Air</th>
            <th>Noise</th>
            <th>Traffic</th>
            <th>Green</th>
            <th style="width: 60px"></th>
          </tr>
        </thead>

        <tbody>

          <tr v-for="a in areas" :key="a.id">

            <td>
              <input
                v-model="a.name"
                class="form-control form-control-sm"
                @blur="updateArea(a)"
              />
            </td>

            <td>
              <input
                v-model="a.coords"
                placeholder="50°..."
                class="form-control form-control-sm"
                @blur="handleCoordsEdit(a)"
              />
            </td>

            <td>
              <input
                v-model="a.lat"
                class="form-control form-control-sm"
                @blur="updateArea(a)"
              />
            </td>

            <td>
              <input
                v-model="a.lan"
                class="form-control form-control-sm"
                @blur="updateArea(a)"
              />
            </td>

            <td>
              <input
                v-model="a.factors_air"
                class="form-control form-control-sm"
                @blur="updateArea(a)"
              />
            </td>

            <td>
              <input
                v-model="a.factors_noise"
                class="form-control form-control-sm"
                @blur="updateArea(a)"
              />
            </td>

            <td>
              <input
                v-model="a.factors_traffic"
                class="form-control form-control-sm"
                @blur="updateArea(a)"
              />
            </td>

            <td>
              <input
                v-model="a.factors_greenZones"
                class="form-control form-control-sm"
                @blur="updateArea(a)"
              />
            </td>

            <td>
              <button
                class="btn btn-sm btn-outline-danger"
                @click="deleteArea(a.id)"
              >
                ✕
              </button>
            </td>

          </tr>

        </tbody>

      </table>

    </div>

  </div>
</template>