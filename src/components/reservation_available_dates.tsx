import { useState, useEffect, useMemo } from "react";

interface Reservation {
  id?: number;
  startTime: string;
  endTime: string;
  user?: { id: number; name: string }; // <--- user object from backend
}
interface AvailabilityViewerProps {
  amenityId: number;
  amenityName: string;
  capacity: number;
  fetchReservations: (amenityId: number) => Promise<Reservation[]>;
}

// Config: rango visible (ajustable)
const VISIBLE_START_HOUR = 8; // 08:00
const VISIBLE_END_HOUR = 20; // 20:00
const TOTAL_MINUTES = (VISIBLE_END_HOUR - VISIBLE_START_HOUR) * 60;

function getDayKey(d: Date) {
  return d.toISOString().split("T")[0];
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function getColorByRatio(ratio: number) {
  // ratio: 0..1
  if (ratio >= 1) return "bg-red-600 text-white";
  if (ratio >= 0.8) return "bg-orange-600 text-white";
  if (ratio >= 0.5) return "bg-yellow-300 text-black";
  return "bg-green-400 text-black";
}

export default function AvailabilityTimelineViewer({
  amenityId,
  amenityName,
  capacity,
  fetchReservations,
}: AvailabilityViewerProps) {
  const [open, setOpen] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    if (open) {
      fetchReservations(amenityId).then(setReservations).catch(console.error);
    }
  }, [open, amenityId, fetchReservations]);

  // próximos 7 días
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return getDayKey(d);
    });
  }, []);

  // agrupar por día (por startTime)
  const reservationsByDay = useMemo(() => {
    const map: Record<string, Reservation[]> = {};
    days.forEach((d) => (map[d] = []));
    reservations.forEach((r) => {
      const s = new Date(r.startTime);
      const dayKey = getDayKey(s);
      if (map[dayKey]) map[dayKey].push(r);
    });
    return map;
  }, [reservations, days]);

  // layout por día: top%, height%, colIndex, colCount, overlapCount
  const renderedByDay = useMemo(() => {
    const result: Record<
      string,
      Array<{
        res: Reservation;
        topPct: number;
        heightPct: number;
        overlapCount: number;
        colIndex: number;
        colCount: number;
      }>
    > = {};

    days.forEach((day) => {
      const dayReservations = reservationsByDay[day] || [];

      // 1) build intervals clamped to visible range
      const intervals = dayReservations.map((r) => {
        const s = new Date(r.startTime);
        const e = new Date(r.endTime);
        const startMinutes = (s.getHours() * 60 + s.getMinutes()) - VISIBLE_START_HOUR * 60;
        const endMinutes = (e.getHours() * 60 + e.getMinutes()) - VISIBLE_START_HOUR * 60;
        return {
          res: r,
          startRaw: startMinutes,
          endRaw: endMinutes,
          start: clamp(startMinutes, 0, TOTAL_MINUTES),
          end: clamp(endMinutes, 0, TOTAL_MINUTES),
        };
      });

      // sort by start time
      intervals.sort((a, b) => a.start - b.start || a.end - b.end);

      // 2) greedy column assignment
      const columnsEnd: number[] = []; // end minute of last interval in each column
      const assigned: Array<typeof intervals[0] & { colIndex: number }> = [];

      for (const it of intervals) {
        let colIndex = columnsEnd.findIndex((end) => end <= it.start);
        if (colIndex === -1) {
          colIndex = columnsEnd.length;
          columnsEnd.push(it.end);
        } else {
          columnsEnd[colIndex] = it.end;
        }
        assigned.push({ ...it, colIndex });
      }

      const colCount = Math.max(1, columnsEnd.length);

      // 3) compute concurrency at midpoint and top/height
      const dayRendered = assigned.map((it) => {
        const mid = (it.start + it.end) / 2;
        let concurrent = 0;
        intervals.forEach((other) => {
          if (other.start <= mid && other.end > mid) concurrent++;
        });

        const duration = Math.max(1, it.end - it.start); // minutes, visible at least 1
        const topPct = (it.start / TOTAL_MINUTES) * 100;
        const heightPct = (duration / TOTAL_MINUTES) * 100;

        return {
          res: it.res,
          topPct,
          heightPct,
          overlapCount: concurrent,
          colIndex: it.colIndex,
          colCount,
        };
      });

      result[day] = dayRendered.sort((a, b) => new Date(a.res.startTime).getTime() - new Date(b.res.startTime).getTime());
    });

    return result;
  }, [reservationsByDay, days]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Ver disponibilidad (Timeline)
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-[1100px] w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Disponibilidad — {amenityName}</h2>
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-4">
              {/* Left: time labels */}
              <div className="w-16 flex flex-col items-end pr-2 text-sm text-gray-600">
                {Array.from({ length: VISIBLE_END_HOUR - VISIBLE_START_HOUR + 1 }, (_, i) => {
                  const hour = VISIBLE_START_HOUR + i;
                  // height percentage per hour
                  const heightPct = 100 / (VISIBLE_END_HOUR - VISIBLE_START_HOUR);
                  return (
                    <div key={hour} style={{ height: `${heightPct}%` }} className="relative">
                      {hour}:00
                    </div>
                  );
                })}
              </div>

              {/* Main timeline: days as columns */}
              <div className="flex-1 overflow-x-auto">
                {/* header with day labels */}
                <div className="grid" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)`, minWidth: 700 }}>
                  {days.map((day) => (
                    <div key={day} className="border-b pb-2 text-center font-medium text-sm">
                      {day}
                    </div>
                  ))}
                </div>

                <div
                  className="relative border mt-2"
                  style={{
                    minHeight: 600,
                    display: "grid",
                    gridTemplateColumns: `repeat(${days.length}, 1fr)`,
                    minWidth: 700,
                  }}
                >
                  {/* hour horizontal lines */}
                  {Array.from({ length: VISIBLE_END_HOUR - VISIBLE_START_HOUR }, (_, i) => {
                    const topPct = (i / (VISIBLE_END_HOUR - VISIBLE_START_HOUR)) * 100;
                    return (
                      <div
                        key={`line-${i}`}
                        style={{ position: "absolute", left: 0, right: 0, top: `${topPct}%`, height: 1 }}
                        className="bg-gray-200"
                      />
                    );
                  })}

                  {/* day columns */}
                  {days.map((day) => (
                    <div
                      key={day}
                      className="relative border-l"
                      style={{ minHeight: 600, padding: "6px 4px" }}
                    >
                      {/* background stripes */}
                      <div className="absolute inset-0">
                        {Array.from({ length: VISIBLE_END_HOUR - VISIBLE_START_HOUR }, (_, i) => {
                          const top = (i / (VISIBLE_END_HOUR - VISIBLE_START_HOUR)) * 100;
                          const height = (1 / (VISIBLE_END_HOUR - VISIBLE_START_HOUR)) * 100;
                          return (
                            <div
                              key={i}
                              style={{ top: `${top}%`, height: `${height}%` }}
                              className={`absolute left-0 right-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                            />
                          );
                        })}
                      </div>

                      {/* reservations blocks for this day */}
                      <div className="relative" style={{ minHeight: 600 }}>
                        {renderedByDay[day]?.map((entry, idx) => {
                          const ratio = clamp(entry.overlapCount / Math.max(1, capacity), 0, 1);
                          const colorClass = getColorByRatio(ratio);
                          const start = new Date(entry.res.startTime);
                          const end = new Date(entry.res.endTime);
                          const startStr = start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                          const endStr = end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                          const gapPx = 6;
                          const colWidthPct = 100 / entry.colCount;
                          const leftPct = entry.colIndex * colWidthPct;
                          const leftCalc = `calc(${leftPct}% + ${gapPx / 2}px)`;
                          const widthCalc = `calc(${colWidthPct}% - ${gapPx}px)`;

                          return (
                            <div
                              key={`${day}-${idx}-${entry.res.startTime}`}
                              title={`${startStr} → ${endStr} — concurrent: ${entry.overlapCount}/${capacity}`}
                              className={`absolute rounded-md px-2 py-1 text-xs shadow-sm ${colorClass}`}
                              style={{
                                top: `${entry.topPct}%`,
                                height: `${entry.heightPct}%`,
                                left: leftCalc,
                                width: widthCalc,
                                zIndex: 10 + idx,
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                              }}
                            >
                              <div className="font-semibold text-sm truncate">
                               {entry.res.user?.name ? entry.res.user.name : `User ${entry.res.user?.id ?? ""}`}
                              </div>
                              <div className="text-[11px] opacity-90 truncate">{startStr} - {endStr}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* legend */}
            <div className="mt-4 flex gap-3 items-center text-sm">
              <div className="px-3 py-1 rounded bg-green-400 text-black">Libre</div>
              <div className="px-3 py-1 rounded bg-yellow-300 text-black">Moderado</div>
              <div className="px-3 py-1 rounded bg-orange-600 text-white">Alto</div>
              <div className="px-3 py-1 rounded bg-red-600 text-white">Lleno</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
