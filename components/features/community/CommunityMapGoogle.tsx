'use client'

import { useEffect, useRef } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { Icon } from '@/components/icons/Icon'
import { cn } from '@/lib/utils'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export interface MapCommunity {
  id?: string
  name: string
  lat: number | null
  lng: number | null
}

interface CommunityMapGoogleProps {
  /** Nome da comunidade do usuário (destacada, se bater com a lista). */
  current?: string | null
  /** Comunidades cadastradas (com coordenadas). */
  communities: MapCommunity[]
  heightClass?: string
}

const MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#ece2d0' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b5d4f' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5efe6' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#e0d4bf' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#bcd0cf' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#dcd2bb' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c9a97a' }] },
]

function pinIcon(color: string, scale: number): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#f5efe6',
    strokeWeight: scale > 8 ? 3 : 2,
  }
}

/**
 * Mapa real (Google Maps) das comunidades cadastradas.
 * Usa as coordenadas já armazenadas (geocodificadas no admin) — sem geocodificar
 * no cliente. Sem coordenadas, cai na geolocalização do aparelho.
 */
export function CommunityMapGoogle({
  current,
  communities,
  heightClass = 'h-44',
}: CommunityMapGoogleProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const placed = communities.filter((c) => c.lat != null && c.lng != null)

  useEffect(() => {
    const el = containerRef.current
    if (!el || !API_KEY) return

    let map: google.maps.Map | null = null
    let cancelled = false

    async function init() {
      if (cancelled || map || !el || el.offsetWidth === 0) return

      const loader = new Loader({ apiKey: API_KEY!, version: 'weekly' })
      const { Map } = await loader.importLibrary('maps')
      if (cancelled || !el) return

      map = new Map(el, {
        center: { lat: -14.235, lng: -51.925 },
        zoom: 4,
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
        styles: MAP_STYLE,
      })

      if (placed.length > 0) {
        const bounds = new google.maps.LatLngBounds()
        for (const c of placed) {
          const pos = { lat: c.lat as number, lng: c.lng as number }
          const isCurrent = !!current && c.name === current
          new google.maps.Marker({
            position: pos,
            map,
            title: c.name,
            icon: pinIcon(isCurrent ? '#b8342a' : '#4a6741', isCurrent ? 10 : 6),
            zIndex: isCurrent ? 10 : 1,
          })
          bounds.extend(pos)
        }
        if (placed.length === 1) {
          map.setCenter(bounds.getCenter())
          map.setZoom(14)
        } else {
          map.fitBounds(bounds, 48)
        }
      } else if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (p) => {
            if (cancelled || !map) return
            map.setCenter({ lat: p.coords.latitude, lng: p.coords.longitude })
            map.setZoom(13)
          },
          () => {},
          { timeout: 8000, maximumAge: 600000 }
        )
      }
    }

    init()
    const ro = new ResizeObserver(() => {
      if (!map && el.offsetWidth > 0) init()
    })
    ro.observe(el)

    return () => {
      cancelled = true
      ro.disconnect()
      map = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, JSON.stringify(placed.map((c) => [c.name, c.lat, c.lng]))])

  return (
    <div className="overflow-hidden rounded-xl border border-palha bg-creme-dark">
      <div ref={containerRef} className={cn('w-full bg-[#e7dcc7]', heightClass)}>
        {!API_KEY && (
          <div className="flex h-full items-center justify-center px-4 text-center font-body text-[12px] text-tinta-mid">
            Configure a NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para ver o mapa.
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 p-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-terra-light text-terra">
          <Icon name="map-pin" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-strong text-[13px] font-bold text-tinta">
            {current || 'Defina seu bairro no perfil'}
          </p>
          <p className="font-body text-[11px] text-tinta-mid">
            {placed.length > 0
              ? `${placed.length} comunidade${placed.length === 1 ? '' : 's'} no mapa`
              : 'Nenhuma comunidade no mapa ainda'}
          </p>
        </div>
      </div>
    </div>
  )
}
