import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from '../lib/axios'

interface TenantBranding {
  primaryColor: string    // brand-dark
  secondaryColor: string  // brand-mid
  accentColor: string     // brand-light
  restaurantName: string
  logoUrl?: string | null
  backgroundImageUrl?: string | null
  fontFamily?: string
}

export function useTenantBranding() {
  return useQuery({
    queryKey: ['branding'],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get('/branding')
        return data as TenantBranding
      } catch {
        // Si falla (sin token o error), devolver valores por defecto
        return null
      }
    },
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

export function TenantThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: branding } = useTenantBranding()

  useEffect(() => {
    if (!branding) return

    const root = document.documentElement

    const brandDark = branding?.primaryColor ?? '#1a5c3a'
    const brandMid = branding?.secondaryColor ?? '#2d8a5e'
    const brandLight = branding?.accentColor ?? '#e8f5ee'

    root.style.setProperty('--brand-dark', brandDark)
    root.style.setProperty('--brand-mid', brandMid)
    root.style.setProperty('--brand-light', brandLight)
    root.style.setProperty('--brand-dark-10', brandDark + '1a')
    root.style.setProperty('--brand-mid-20', brandMid + '33')

    // Overlay del fondo usa brand-light con opacidad
    const r = parseInt(brandLight.slice(1, 3), 16)
    const g = parseInt(brandLight.slice(3, 5), 16)
    const b = parseInt(brandLight.slice(5, 7), 16)
    root.style.setProperty('--bg-overlay', `rgba(${r}, ${g}, ${b}, 0.82)`)

    // Sidebar usa brand-light
    root.style.setProperty('--sidebar-bg', brandLight)
    root.style.setProperty('--sidebar-text', brandDark)
    root.style.setProperty('--sidebar-text-muted', brandMid)
    root.style.setProperty('--sidebar-hover', brandMid + '22')
    root.style.setProperty('--sidebar-border', brandMid + '33')

    // Imagen de fondo configurable
    if (branding?.backgroundImageUrl) {
    document.body.style.backgroundImage = `url('${branding.backgroundImageUrl}')`
    } else {
    document.body.style.backgroundImage = `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80')`
    }

  }, [branding])

  return <>{children}</>
}