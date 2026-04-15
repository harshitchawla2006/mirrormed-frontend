import axios from 'axios'

const BASE = 'https://mirrormed.onrender.com'

const api = axios.create({ baseURL: BASE, timeout: 300000 })

// POST /predict — send image file
export const predictImage = async (file) => {
  const fd = new FormData()
  fd.append('file', file)
  const res = await api.post('/predict', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

// GET /health — check if API is alive
export const checkHealth = async () => {
  const res = await api.get('/health')
  return res.data
}

// GET /metrics — prediction statistics
export const getMetrics = async () => {
  const res = await api.get('/metrics')
  return res.data
}