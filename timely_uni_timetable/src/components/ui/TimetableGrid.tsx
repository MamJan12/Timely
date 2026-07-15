import type { ReactNode } from 'react';
import type { TimetableSlot, Day } from '../../lib/types';

export const GRID_DAYS: Day[] = ['TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export const DAY_LABELS: Record<Day, string> = {
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
};

export const TIME_SLOTS = [
  { label: '7:00 – 9:00',   start: '07:00', end: '09:00' },
  { label: '9:00 – 11:00',  start: '09:00', end: '11:00' },
  { label: '11:00 – 13:00', start: '11:00', end: '13:00' },
  { label: '13:00 – 15:00', start: '13:00', end: '15:00' },
  { label: '15:00 – 17:00', start: '15:00', end: '17:00' },
  { label: '17:00 – 19:00', start: '17:00', end: '19:00' },
];

// Maps each period start to its default single-period end (start + 2h)
export const SLOT_END_MAP: Record<string, string> = {
  '07:00': '09:00',
  '09:00': '11:00',
  '11:00': '13:00',
  '13:00': '15:00',
  '15:00': '17:00',
  '17:00': '19:00',
};

// Valid end times for each start (single period then double period where possible)
export const SLOT_END_OPTIONS: Record<string, string[]> = {
  '07:00': ['09:00', '11:00'],
  '09:00': ['11:00', '13:00'],
  '11:00': ['13:00', '15:00'],
  '13:00': ['15:00', '17:00'],
  '15:00': ['17:00', '19:00'],
  '17:00': ['19:00'],
};

export function getRowSpan(startTime: string, endTime: string): number {
  const sh = parseInt(startTime.split(':')[0], 10);
  const eh = parseInt(endTime.split(':')[0], 10);
  return Math.max(1, (eh - sh) / 2);
}

interface TimetableGridProps {
  slots: TimetableSlot[];
  renderSlotCard: (slot: TimetableSlot, isDouble: boolean) => ReactNode;
  renderEmpty?: (day: Day, startTime: string) => ReactNode;
}

const TimetableGrid = ({ slots, renderSlotCard, renderEmpty }: TimetableGridProps) => {
  // Build a map for O(1) lookup; keyed by "DAY-startTime"
  const slotMap = new Map<string, TimetableSlot>(
    slots.map(s => [`${s.day}-${s.startTime}`, s]),
  );

  const getSlot = (day: Day, start: string) => slotMap.get(`${day}-${start}`);

  // True when a double-period slot starting at an earlier row already covers this row
  const isCoveredByDouble = (day: Day, start: string) =>
    slots.some(s => s.day === day && s.startTime < start && s.endTime > start);

  return (
    <div className="rounded-2xl border border-[var(--gray-150)] bg-white shadow-sm w-full overflow-hidden">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'clamp(64px, 14%, 120px) repeat(5, 1fr)',
          // Row 1 = header; rows 2–7 = one per 2-hour period
          gridTemplateRows: 'auto repeat(6, minmax(60px, auto))',
        }}
      >
        {/* Corner */}
        <div
          style={{ gridRow: 1, gridColumn: 1 }}
          className="border-b border-[var(--gray-150)]"
        />

        {/* Day headers */}
        {GRID_DAYS.map((day, i) => (
          <div
            key={day}
            style={{ gridRow: 1, gridColumn: i + 2 }}
            className="py-3 text-center text-[10px] sm:text-xs font-semibold text-[var(--gray-600)] uppercase tracking-widest border-b border-[var(--gray-150)]"
          >
            {DAY_LABELS[day]}
          </div>
        ))}

        {/* Time labels */}
        {TIME_SLOTS.map(({ label, start }, i) => (
          <div
            key={`tl-${start}`}
            style={{ gridRow: i + 2, gridColumn: 1 }}
            className="pl-2 pt-3 flex items-start border-b border-[var(--gray-100)]"
          >
            <span className="text-[9px] sm:text-[11px] text-[var(--gray-500)] font-medium leading-tight">
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{start}</span>
            </span>
          </div>
        ))}

        {/* Slot / empty cells */}
        {GRID_DAYS.map((day, colIdx) =>
          TIME_SLOTS.map(({ start }, rowIdx) => {
            // Skip cells that are visually covered by a spanning double-period above
            if (isCoveredByDouble(day, start)) return null;

            const slot = getSlot(day, start);
            const rowSpan = slot ? getRowSpan(slot.startTime, slot.endTime) : 1;
            const isDouble = rowSpan >= 2;

            return (
              <div
                key={`${day}-${start}`}
                style={{
                  gridRow: `${rowIdx + 2} / span ${rowSpan}`,
                  gridColumn: colIdx + 2,
                }}
                className="p-0.5 border-b border-[var(--gray-100)] flex items-stretch"
              >
                {slot
                  ? renderSlotCard(slot, isDouble)
                  : renderEmpty
                  ? renderEmpty(day, start)
                  : (
                    <div className="w-full rounded-xl border border-dashed border-[var(--gray-150)]" />
                  )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
};

export default TimetableGrid;
