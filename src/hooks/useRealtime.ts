import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { qk } from '@/lib/queryClient'

const TABLE_KEYS: Record<string, readonly unknown[]> = {
  athletes: qk.athletes,
  activities: qk.activities,
  needs: qk.needs,
  assignments: qk.assignments,
  profiles: qk.guides,
}

/**
 * Suscripción en tiempo real: cuando cambia una tabla en Supabase,
 * invalida la query correspondiente para que todos los usuarios vean
 * la cobertura actualizada al instante.
 *
 * Requiere habilitar Realtime para las tablas en Supabase
 * (Database → Replication). Si no está habilitado, la app sigue
 * funcionando con refetch normal.
 */
export function useRealtime(enabled: boolean) {
  const qc = useQueryClient()

  useEffect(() => {
    if (!enabled) return

    const channel = supabase.channel('fde-db-changes')
    for (const table of Object.keys(TABLE_KEYS)) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        qc.invalidateQueries({ queryKey: TABLE_KEYS[table] })
      })
    }
    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enabled, qc])
}
