import { supabase } from '../lib/supabaseClient';

// Test Supabase connection
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('monitoring_regions').select('count', { count: 'exact' });
    if (error) {
      console.warn('Supabase query error (tables may need SQL migration):', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase connection warning:', err);
    return false;
  }
};

// Insert CAP Alert to Supabase
export const insertCapAlertToSupabase = async (alertPayload) => {
  try {
    const { data, error } = await supabase.from('cap_alerts').insert([alertPayload]);
    if (error) console.error('Error saving CAP alert to Supabase:', error.message);
    return { data, error };
  } catch (err) {
    console.error('Supabase CAP alert error:', err);
    return { error: err };
  }
};

// Insert Crowd Telemetry Barometer Reading to Supabase
export const insertCrowdTelemetryToSupabase = async (reading) => {
  try {
    const { data, error } = await supabase.from('crowd_barometer_telemetry').insert([reading]);
    if (error) console.error('Error saving telemetry to Supabase:', error.message);
    return { data, error };
  } catch (err) {
    console.error('Supabase telemetry error:', err);
    return { error: err };
  }
};

// Subscribe to Realtime Storm Cell Updates
export const subscribeToStormCells = (onStormCellUpdate) => {
  const channel = supabase
    .channel('realtime-storm-cells')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'storm_cells' },
      (payload) => {
        onStormCellUpdate(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
