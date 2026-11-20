/**
 * Pakistan Standard Time (PKT, UTC+05:00 / Asia/Karachi) Utilities
 * Provides consistent PKT time calculations, formatting, and live clock hooks across all UCMS portals.
 */
import { useState, useEffect } from 'react';

export const PKT_TIMEZONE = 'Asia/Karachi';

/**
 * Returns current day of week in Pakistan Standard Time (PKT)
 */
export function getPKTDayOfWeek(date: Date = new Date()): 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun' {
  const dayStr = new Intl.DateTimeFormat('en-US', {
    timeZone: PKT_TIMEZONE,
    weekday: 'short',
  }).format(date);
  return dayStr as 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
}

/**
 * Returns hour, minute, second integers in PKT (24-hour format)
 */
export function getPKTHoursAndMinutes(date: Date = new Date()): { hours: number; minutes: number; seconds: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: PKT_TIMEZONE,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(date);

  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  for (const p of parts) {
    if (p.type === 'hour') hours = parseInt(p.value, 10);
    if (p.type === 'minute') minutes = parseInt(p.value, 10);
    if (p.type === 'second') seconds = parseInt(p.value, 10);
  }
  return { hours, minutes, seconds };
}

/**
 * Format date in PKT 12-hour time with optional seconds, tagged with PKT
 */
export function formatPKTTimeString(date: Date = new Date(), includeSeconds: boolean = true): string {
  const timeStr = new Intl.DateTimeFormat('en-US', {
    timeZone: PKT_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: true,
  }).format(date);
  return `${timeStr} PKT`;
}

/**
 * Format date in PKT (e.g., "Wed, 11 Nov 2026")
 */
export function formatPKTDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: PKT_TIMEZONE,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Format full date & time in PKT
 */
export function formatPKTDateTimeString(date: Date = new Date()): string {
  return `${formatPKTDateString(date)} · ${formatPKTTimeString(date, true)}`;
}

/**
 * React hook that triggers a re-render every second and gives live PKT clock data
 */
export function usePKTClock() {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { hours, minutes, seconds } = getPKTHoursAndMinutes(now);
  const timeStr = formatPKTTimeString(now, true);
  const timeNoSec = formatPKTTimeString(now, false);
  const dateStr = formatPKTDateString(now);
  const dayOfWeek = getPKTDayOfWeek(now);

  return {
    now,
    hours,
    minutes,
    seconds,
    timeStr,
    timeNoSec,
    dateStr,
    dayOfWeek,
  };
}
