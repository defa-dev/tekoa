/**
 * Geocodificação de endereços via Google Geocoding API (server-side).
 * Usada para transformar o endereço de uma comunidade em coordenadas.
 */

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export interface GeoPoint {
  lat: number
  lng: number
}

export async function geocodeAddress(address: string): Promise<GeoPoint | null> {
  if (!KEY || !address || !address.trim()) return null

  const url =
    'https://maps.googleapis.com/maps/api/geocode/json' +
    `?address=${encodeURIComponent(address)}&components=country:BR&key=${KEY}`

  try {
    const res = await fetch(url)
    const data = await res.json()
    if (data.status === 'OK' && data.results?.[0]) {
      const loc = data.results[0].geometry.location
      return { lat: loc.lat, lng: loc.lng }
    }
  } catch {
    // silencioso: sem coordenadas, a comunidade fica sem pin no mapa
  }
  return null
}
