// Simple in-memory store for prediction history (persisted to localStorage)
const STORAGE_KEY = 'mirrormed_predictions'

export const getHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

export const addPrediction = (entry) => {
  const history = getHistory()
  const updated = [{ ...entry, id: Date.now(), timestamp: new Date().toISOString() }, ...history].slice(0, 50)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export const clearHistory = () => localStorage.removeItem(STORAGE_KEY)