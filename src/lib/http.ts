export async function readJson<T>(res: Response, fallback: T): Promise<T> {
  if (!res.ok) return fallback
  const text = await res.text()
  if (!text.trim()) return fallback
  try {
    return JSON.parse(text) as T
  } catch {
    return fallback
  }
}
