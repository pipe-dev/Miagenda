/**
 * Automated Disaster Recovery & Backup Service
 * - Automatic background snapshots every 4 days to LocalStorage + Cloud
 * - Manual 1-tap JSON export and import for user-controlled physical backups
 */

import {
  getEvents,
  getAllTasks,
  getSharedGroceries,
  getDedications,
  getLoveCoupons,
  getCoupleMoods,
  getProfileConfig,
  getCoupleId,
  saveProfileConfig,
  saveCoupleId
} from './storageService';
import { syncAllLocalDataToCloud } from './firestoreSync';
import { hapticService } from './hapticService';

const KEY_LAST_AUTO_BACKUP = 'daily_delight_last_auto_backup_ts_v1';
const KEY_LOCAL_BACKUP_VAULT = 'daily_delight_auto_backup_vault_v1';
const AUTO_BACKUP_INTERVAL_MS = 4 * 24 * 60 * 60 * 1000; // 4 Days

export interface BackupDataPayload {
  version: number;
  exportedAt: string;
  coupleId: string;
  profileConfig: any;
  events: any[];
  tasks: any[];
  groceries: any[];
  dedications: any[];
  coupons: any[];
  moods: any;
}

// Generate complete snapshot payload
export const generateFullBackupPayload = (): BackupDataPayload => {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    coupleId: getCoupleId(),
    profileConfig: getProfileConfig(),
    events: getEvents(),
    tasks: getAllTasks(),
    groceries: getSharedGroceries(),
    dedications: getDedications(),
    coupons: getLoveCoupons(),
    moods: getCoupleMoods()
  };
};

/**
 * Runs silently in the background on app start.
 * If 4 or more days have elapsed since last backup, takes a snapshot.
 */
export const checkAndRunAutomatedBackup = async (): Promise<boolean> => {
  try {
    const config = getProfileConfig();
    if (!config.isSetupComplete) return false;

    const rawLast = localStorage.getItem(KEY_LAST_AUTO_BACKUP);
    const lastTimestamp = rawLast ? parseInt(rawLast, 10) : 0;
    const now = Date.now();

    if (now - lastTimestamp >= AUTO_BACKUP_INTERVAL_MS) {
      const payload = generateFullBackupPayload();
      
      // 1. Save local snapshot vault in isolated key
      localStorage.setItem(KEY_LOCAL_BACKUP_VAULT, JSON.stringify(payload));
      
      // 2. Sync consolidated snapshot to cloud
      await syncAllLocalDataToCloud(payload as any);
      
      // 3. Update timestamp
      localStorage.setItem(KEY_LAST_AUTO_BACKUP, now.toString());
      console.log('[AUTO-BACKUP] Copia de seguridad automática cada 4 días realizada con éxito.');
      return true;
    }
  } catch (e) {
    console.warn('[AUTO-BACKUP Error]:', e);
  }
  return false;
};

/**
 * Export backup as downloadable .json file
 */
export const exportBackupToJsonFile = () => {
  try {
    const payload = generateFullBackupPayload();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `MiAgenda_Backup_${getCoupleId()}_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    hapticService.playSuccess();
  } catch (e) {
    console.error('Error exporting backup JSON:', e);
    alert('No se pudo generar el archivo de copia.');
  }
};

/**
 * Import backup from a .json file and restore application state
 */
export const importBackupFromJsonFile = (
  file: File,
  onSuccess: () => void,
  onError: (msg: string) => void
) => {
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const content = e.target?.result as string;
      const parsed = JSON.parse(content) as BackupDataPayload;

      if (!parsed || !parsed.events || !parsed.tasks) {
        onError('El archivo seleccionado no tiene el formato válido de Mi Agenda.');
        return;
      }

      // Restore LocalStorage
      if (parsed.coupleId) saveCoupleId(parsed.coupleId);
      if (parsed.profileConfig) saveProfileConfig(parsed.profileConfig);
      localStorage.setItem('daily_delight_events_v2', JSON.stringify(parsed.events || []));
      localStorage.setItem('daily_delight_tasks_v2', JSON.stringify(parsed.tasks || []));
      localStorage.setItem('daily_delight_shared_groceries_v2', JSON.stringify(parsed.groceries || []));
      localStorage.setItem('daily_delight_dedications_v2', JSON.stringify(parsed.dedications || []));
      localStorage.setItem('daily_delight_love_coupons_v1', JSON.stringify(parsed.coupons || []));
      localStorage.setItem('daily_delight_couple_moods_v2', JSON.stringify(parsed.moods || {}));

      // Sync to cloud
      await syncAllLocalDataToCloud(parsed as any);

      hapticService.playSuccess();
      onSuccess();
    } catch (err) {
      console.error('Error importing backup JSON:', err);
      onError('Error al leer el archivo. Asegúrate de que sea un archivo .json válido.');
    }
  };
  reader.onerror = () => onError('Error al leer el archivo.');
  reader.readAsText(file);
};
