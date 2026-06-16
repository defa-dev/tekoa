import { cn } from '@/lib/utils'

export interface AvatarProps {
  name?: string | null
  src?: string | null
  size?: number
  className?: string
}

/**
 * Avatar com fallback de iniciais sobre fundo ouro.
 * Usa <img> nativo (não next/image) por ser fonte variada e local no protótipo.
 */
export function Avatar({ name, src, size = 40, className }: AvatarProps) {
  const initials = (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center overflow-hidden rounded-full bg-ouro text-tinta font-strong font-bold',
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden={!name}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name || ''}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </span>
  )
}
