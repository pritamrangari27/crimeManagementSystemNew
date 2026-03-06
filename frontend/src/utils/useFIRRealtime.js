import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../api/supabaseClient';

/**
 * Hook that subscribes to INSERT events on the "firs" table via Supabase Realtime.
 *
 * @param {object}   opts
 * @param {string}   opts.stationId  - Only react to FIRs for this station (optional filter).
 * @param {function} opts.onNewFIR   - Called with the new row when an INSERT arrives.
 * @param {boolean}  [opts.enabled=true] - Whether the subscription is active.
 */
export default function useFIRRealtime({ stationId, onNewFIR, enabled = true }) {
  const channelRef = useRef(null);
  const callbackRef = useRef(onNewFIR);
  callbackRef.current = onNewFIR;

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      supabase?.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled || !supabase) return;

    cleanup();

    const filter = stationId
      ? `station_id=eq.${stationId}`
      : undefined;

    const channel = supabase
      .channel('firs-inserts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'firs',
          ...(filter && { filter }),
        },
        (payload) => {
          callbackRef.current?.(payload.new);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Subscribed to FIR inserts');
        }
      });

    channelRef.current = channel;

    return cleanup;
  }, [stationId, enabled, cleanup]);
}
