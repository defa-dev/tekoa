'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { Icon } from '@/components/icons/Icon'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
const DEFAULT = { lat: -14.235, lng: -51.925 }

export interface PickedLocation {
  lat: number
  lng: number
  address: string
}

interface CommunityMapPickerProps {
  lat: number | null
  lng: number | null
  address: string
  onChange: (value: PickedLocation) => void
}

function pin(): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 9,
    fillColor: '#b8342a',
    fillOpacity: 1,
    strokeColor: '#f5efe6',
    strokeWeight: 3,
  }
}

/**
 * Seletor de localização da comunidade num mapa do Google.
 * Clique no mapa (ou busque um endereço) para marcar o ponto — as coordenadas
 * e o endereço são capturados automaticamente.
 */
export function CommunityMapPicker({
  lat,
  lng,
  address,
  onChange,
}: CommunityMapPickerProps) {
  const mapEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)
  const [search, setSearch] = useState(address || '')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    lat != null && lng != null ? { lat, lng } : null
  )

  function setMarker(pos: google.maps.LatLngLiteral) {
    if (!mapRef.current) return
    if (!markerRef.current) {
      markerRef.current = new google.maps.Marker({
        map: mapRef.current,
        position: pos,
        draggable: true,
        icon: pin(),
      })
      markerRef.current.addListener('dragend', () => {
        const p = markerRef.current!.getPosition()
        if (p) commit({ lat: p.lat(), lng: p.lng() })
      })
    } else {
      markerRef.current.setPosition(pos)
    }
    mapRef.current.panTo(pos)
  }

  function commit(pos: google.maps.LatLngLiteral) {
    setMarker(pos)
    setCoords(pos)
    geocoderRef.current?.geocode({ location: pos }, (res, status) => {
      const addr = status === 'OK' && res?.[0] ? res[0].formatted_address : search
      setSearch(addr)
      onChange({ lat: pos.lat, lng: pos.lng, address: addr })
    })
  }

  useEffect(() => {
    if (!API_KEY || !mapEl.current) return
    let cancelled = false

    ;(async () => {
      const loader = new Loader({ apiKey: API_KEY!, version: 'weekly' })
      const [{ Map }, { Geocoder }] = await Promise.all([
        loader.importLibrary('maps'),
        loader.importLibrary('geocoding'),
      ])
      if (cancelled || !mapEl.current) return

      const hasPoint = lat != null && lng != null
      mapRef.current = new Map(mapEl.current, {
        center: hasPoint ? { lat: lat!, lng: lng! } : DEFAULT,
        zoom: hasPoint ? 15 : 4,
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
      })
      geocoderRef.current = new Geocoder()
      if (hasPoint) setMarker({ lat: lat!, lng: lng! })

      mapRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) commit({ lat: e.latLng.lat(), lng: e.latLng.lng() })
      })
    })()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSearch(e?: React.MouseEvent | React.KeyboardEvent) {
    e?.preventDefault()
    if (!geocoderRef.current || !search.trim()) return
    geocoderRef.current.geocode(
      { address: search, componentRestrictions: { country: 'BR' } },
      (res, status) => {
        if (status === 'OK' && res?.[0]) {
          const loc = res[0].geometry.location
          mapRef.current?.setZoom(15)
          commit({ lat: loc.lat(), lng: loc.lng() })
        }
      }
    )
  }

  return (
    <div>
      <p className="mb-1.5 font-body text-[10px] font-medium uppercase tracking-[0.07em] text-tinta-mid">
        Localização no mapa
      </p>

      <div className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
          placeholder="Buscar endereço ou clicar no mapa"
          className="w-full rounded-md border border-palha bg-creme-dark px-3 py-2.5 font-body text-sm text-tinta placeholder:text-tinta-light focus:border-terra focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="flex h-[42px] shrink-0 items-center gap-1 rounded-md bg-terra px-3 font-strong text-[13px] font-bold text-creme hover:bg-terra-dark"
        >
          <Icon name="search" size={16} />
          Localizar
        </button>
      </div>

      <div className="mt-2 overflow-hidden rounded-lg border border-palha">
        <div ref={mapEl} className="h-64 w-full bg-[#e7dcc7]">
          {!API_KEY && (
            <div className="flex h-full items-center justify-center px-4 text-center font-body text-[12px] text-tinta-mid">
              Configure a NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para usar o mapa.
            </div>
          )}
        </div>
      </div>

      <p className="mt-1.5 font-body text-[11px] text-tinta-mid">
        {coords
          ? `Pino em ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)} — arraste para ajustar.`
          : 'Clique no mapa ou busque um endereço para marcar o ponto.'}
      </p>
    </div>
  )
}
