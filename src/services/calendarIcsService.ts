// Calendar .ics generator with native alarm and cancellation support for iOS / Apple Calendar in TypeScript
import { EventItem } from '../types';

export const getEventUid = (eventId: string): string => {
  return `${eventId}@miagenda.app`;
};

export const generateIcsEvent = (event: EventItem): string => {
  const formatIcsDate = (dateStr: string, timeStr?: string) => {
    const [year, month, day] = dateStr.split('-');
    const [hour, minute] = (timeStr || '09:00').split(':');
    return `${year}${month}${day}T${hour}${minute}00`;
  };

  const dtStart = formatIcsDate(event.date, event.startTime);
  const dtEnd = formatIcsDate(event.date, event.endTime || event.startTime);
  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = getEventUid(event.id);

  const title = event.title || 'Evento';
  const description = `${event.description || ''}\n\nCreado en Mi Agenda (${event.privacy === 'shared' ? 'Agenda Compartida' : 'Mi Agenda Privada'})`;
  const location = event.location || 'Mi Agenda';

  // Build RRULE for repeating routines on Apple & Google Calendar
  let rruleLine = '';
  if (event.recurrence === 'daily') {
    rruleLine = 'RRULE:FREQ=DAILY';
  } else if (event.recurrence === 'weekly') {
    rruleLine = 'RRULE:FREQ=WEEKLY';
  } else if (event.recurrence === 'weekdays') {
    rruleLine = 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR';
  } else if (event.recurrence === 'custom' && Array.isArray(event.repeatDays) && event.repeatDays.length > 0) {
    const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const byDays = event.repeatDays.map(Number).filter(d => d >= 0 && d <= 6).map(d => dayMap[d]).join(',');
    if (byDays) {
      rruleLine = `RRULE:FREQ=WEEKLY;BYDAY=${byDays}`;
    }
  }

  // Build ICS content with VALARM for critical audible alert on iOS
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mi Agenda//Agenda Compartida//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Mi Agenda',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    ...(rruleLine ? [rruleLine] : []),
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    // High Priority Alarm for iOS (suena en modo enfoque)
    'BEGIN:VALARM',
    'TRIGGER:-PT0M',
    'ACTION:AUDIO',
    'ATTACH;VALUE=URI:Chord',
    `DESCRIPTION:Alarma: ${title}`,
    'END:VALARM',
    // 15 min reminder
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Recordatorio: ${title} en 15 minutos`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
};

export const generateCancelIcsEvent = (event: EventItem): string => {
  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = getEventUid(event.id);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mi Agenda//Agenda Compartida//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:CANCEL',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `SUMMARY:${event.title || 'Evento'} (Cancelado)`,
    'STATUS:CANCELLED',
    'SEQUENCE:1',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
};

export const downloadIcsFile = (event: EventItem): void => {
  const icsData = generateIcsEvent(event);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}_alarma.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadCancelIcsFile = (event: EventItem): void => {
  const icsData = generateCancelIcsEvent(event);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}_cancelar_alarma.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ==========================================
// MEDICATIONS IPHONE ALARM & CRITICAL ALERTS
// ==========================================
export const generateMedicationIcs = (med: any): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  
  const timeStr = med.times?.[0] || '08:00';
  const [hour, minute] = timeStr.split(':');
  
  const dtStart = `${year}${month}${day}T${hour}${minute}00`;
  const dtEnd = `${year}${month}${day}T${hour}${minute}00`;
  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = `med-${med.id || Date.now()}@miagenda.app`;

  const title = `💊 Tomar ${med.name} (${med.dosage || '1 dosis'})`;
  const description = `Pastillero Mi Agenda: ${med.name}\nDosis: ${med.dosage || '1 dosis'}\nIndicaciones: ${med.instructions || 'Tomar según prescripción'}\n\n⚠️ Configurado con Alerta Sonora de Alta Prioridad para iPhone.`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mi Agenda//Pastillero y Salud//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Pastillero Mi Agenda',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `RRULE:FREQ=DAILY;INTERVAL=1`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    'LOCATION:Mi Agenda - Pastillero',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    // 1. Alarma Sonora Inmediata a la hora exacta
    'BEGIN:VALARM',
    'TRIGGER:-PT0M',
    'ACTION:AUDIO',
    'ATTACH;VALUE=URI:Chord',
    `DESCRIPTION:Hora de tomar ${med.name}`,
    'END:VALARM',
    // 2. Alerta de Seguimiento a los 30 min (Follow-up Reminder de iOS)
    'BEGIN:VALARM',
    'TRIGGER:+PT30M',
    'ACTION:DISPLAY',
    `DESCRIPTION:⚠️ Alerta de Seguimiento: ¿Ya tomaste ${med.name}?`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
};

export const downloadMedicationIcs = (med: any): void => {
  const icsData = generateMedicationIcs(med);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${(med.name || 'medicamento').replace(/\s+/g, '_')}_alarma_diaria.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


