import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Users, Clock, Calendar } from "lucide-react";
import { LoadingOverlay } from "./LoadingSpinner";

interface Reservation {
  id?: number;
  amenityId?: number;
  userId?: number;
  startTime: string;
  endTime: string;
  status?: string;
  createdAt?: string;
  user?: { id: number; name: string }; // <--- user object from backend
}
interface AvailabilityViewerProps {
  amenityId: number;
  amenityName: string;
  capacity: number;
  fetchReservations: (amenityId: number) => Promise<Reservation[]>;
  isLoading?: boolean;
}

// Config: rango visible (ajustable)
const VISIBLE_START_HOUR = 8; // 08:00
const VISIBLE_END_HOUR = 20; // 20:00
const TOTAL_MINUTES = (VISIBLE_END_HOUR - VISIBLE_START_HOUR) * 60;

function getDayKey(d: Date) {
  // Usar toLocaleDateString para evitar problemas de zona horaria
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function getColorByRatio(ratio: number) {
  // ratio: 0..1 (ocupación actual vs capacidad máxima)
  if (ratio >= 1) return "bg-red-500 text-white border-red-600";
  if (ratio >= 0.8) return "bg-orange-500 text-white border-orange-600";
  if (ratio >= 0.5) return "bg-yellow-400 text-black border-yellow-500";
  return "bg-green-400 text-black border-green-500";
}

export default function AvailabilityTimelineViewer({
  amenityId,
  amenityName,
  capacity,
  fetchReservations,
  isLoading = false,
}: AvailabilityViewerProps) {
  const [open, setOpen] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 1 = next week, etc.
  const [selectedSlot, setSelectedSlot] = useState<{
    reservations: Reservation[];
    timeSlot: string;
    day: string;
  } | null>(null);

  // Generate days for current week + weekOffset
  const days = useMemo(() => {
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
    
    // Add week offset
    currentWeekStart.setDate(currentWeekStart.getDate() + (weekOffset * 7));
    
    const result = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      result.push({
        date: day,
        label: day.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" }),
        key: getDayKey(day),
      });
    }
    return result;
  }, [weekOffset]);

  // Load reservations when modal opens or week changes
  useEffect(() => {
    if (open && !isLoading) {
      setIsLoadingReservations(true);
      
      // Get date range for current week
      const endOfWeek = new Date(days[6].date);
      endOfWeek.setHours(23, 59, 59, 999);
      
      fetchReservations(amenityId)
        .then((data) => {
          setReservations(data);
        })
        .catch(console.error)
        .finally(() => setIsLoadingReservations(false));
    }
  }, [open, amenityId, fetchReservations, isLoading, weekOffset, days]);

  // Clear reservations when amenity changes to prevent showing old data
  useEffect(() => {
    setReservations([]);
    setSelectedSlot(null);
  }, [amenityId]);

  const reservationsByDay = useMemo(() => {
    const result: Record<string, Reservation[]> = {};
    days.forEach((d) => {
      result[d.key] = [];
    });

    reservations.forEach((res) => {
      const startDate = new Date(res.startTime);
      const dayKey = getDayKey(startDate);
      
      if (result[dayKey]) {
        result[dayKey].push(res);
      }
    });

    return result;
  }, [reservations, days]);

  const timeSlotData = useMemo(() => {
    const result: Record<string, Array<{ res: Reservation; topPct: number; heightPct: number; overlapCount: number; colIndex: number; colCount: number }>> = {};

    days.forEach(({ key: day }) => {
      const dayReservations = reservationsByDay[day] || [];

      // Convert each reservation to minute ranges
      const intervals = dayReservations.map((res) => {
        const startDate = new Date(res.startTime);
        const endDate = new Date(res.endTime);
        const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
        const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();

        // Clamp to visible range
        const clampedStart = clamp(startMinutes, VISIBLE_START_HOUR * 60, VISIBLE_END_HOUR * 60);
        const clampedEnd = clamp(endMinutes, VISIBLE_START_HOUR * 60, VISIBLE_END_HOUR * 60);

        return {
          res,
          start: clampedStart - VISIBLE_START_HOUR * 60, // Relative to visible start
          end: clampedEnd - VISIBLE_START_HOUR * 60,
          colIndex: 0, // Will be calculated below
        };
      });

      // Sort by start time
      intervals.sort((a, b) => a.start - b.start);

      // Calculate overlap columns
      const columns: Array<{ end: number }> = [];
      intervals.forEach((interval) => {
        // Find the first column that doesn't overlap
        let colIndex = 0;
        while (colIndex < columns.length && columns[colIndex].end > interval.start) {
          colIndex++;
        }
        
        interval.colIndex = colIndex;
        
        // Update or add column
        if (colIndex >= columns.length) {
          columns.push({ end: interval.end });
        } else {
          columns[colIndex].end = interval.end;
        }
      });

      // Calculate rendering data
      const colCount = columns.length;
      const dayRendered = intervals.map((it) => {
        // Count concurrent reservations at this time
        const concurrent = intervals.filter((other) =>
          other.start < it.end && other.end > it.start
        ).length;

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
        className="group relative px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-300 flex items-center gap-3 font-medium transform hover:scale-105 cursor-pointer"
      >
        <div className="relative">
          <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <span className="text-sm tracking-wide">Ver disponibilidad (Timeline)</span>
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-7xl w-full max-h-[90vh] mx-4 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Disponibilidad Timeline - {amenityName}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setWeekOffset(weekOffset - 1)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Semana anterior
              </button>
              
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold text-gray-700">
                  {weekOffset === 0 ? "Esta semana" : 
                   weekOffset === 1 ? "Próxima semana" :
                   weekOffset > 0 ? `En ${weekOffset} semanas` :
                   `Hace ${Math.abs(weekOffset)} semana${Math.abs(weekOffset) > 1 ? 's' : ''}`}
                </h3>
                <p className="text-sm text-gray-500">
                  {days[0]?.label} - {days[6]?.label}
                </p>
              </div>

              <button
                onClick={() => setWeekOffset(weekOffset + 1)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Semana siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-8 gap-2 min-h-[700px]"> {/* Increased from 600px to 700px */}
                {/* Time labels */}
                <div className="flex flex-col">
                  <div className="h-16 flex items-center justify-center font-bold text-gray-700 border-b border-gray-200">
                    Hora
                  </div>
                  <div className="flex-1 relative">
                    {Array.from({ length: VISIBLE_END_HOUR - VISIBLE_START_HOUR + 1 }, (_, i) => {
                      const hour = VISIBLE_START_HOUR + i;
                      const topPct = (i * 60 / TOTAL_MINUTES) * 100;
                      return (
                        <div
                          key={hour}
                          className="absolute w-full text-xs text-gray-500 font-medium border-t border-gray-100 pl-2 pt-1"
                          style={{ top: `${topPct}%` }}
                        >
                          {hour.toString().padStart(2, '0')}:00
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Day columns */}
                {days.map((dayObj) => (
                  <div key={dayObj.key} className="flex flex-col">
                    <div className="h-16 flex flex-col items-center justify-center border-b border-gray-200">
                      <div className="font-bold text-gray-700">{dayObj.label}</div>
                      <div className="text-xs text-gray-500">{dayObj.date.getDate()}/{dayObj.date.getMonth() + 1}</div>
                    </div>
                    <div className="flex-1 relative bg-gray-50 border-r border-gray-200">
                      {/* Hour grid lines */}
                      {Array.from({ length: VISIBLE_END_HOUR - VISIBLE_START_HOUR }, (_, i) => {
                        const topPct = ((i + 1) * 60 / TOTAL_MINUTES) * 100;
                        return (
                          <div
                            key={i}
                            className="absolute w-full border-t border-gray-200"
                            style={{ top: `${topPct}%` }}
                          />
                        );
                      })}

                      {/* Reservations for this day */}
                      <div className="absolute inset-0">
                        {(() => {
                          // Group overlapping reservations to avoid duplicates
                          const renderedGroups = new Set<string>();
                          const slots = timeSlotData[dayObj.key] || [];
                          
                          return slots.map((entry, idx) => {
                            const startStr = new Date(entry.res.startTime).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            });
                            const endStr = new Date(entry.res.endTime).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            });

                            // Calculate overlapping reservations for capacity ratio
                            const overlappingReservations = slots.filter(other => {
                              const otherStart = new Date(other.res.startTime);
                              const otherEnd = new Date(other.res.endTime);
                              const currentStart = new Date(entry.res.startTime);
                              const currentEnd = new Date(entry.res.endTime);
                              
                              // Check if time periods overlap
                              return otherStart < currentEnd && otherEnd > currentStart;
                            });

                            // Create a unique key for this overlapping group
                            const groupKey = overlappingReservations
                              .map(r => r.res.id)
                              .sort()
                              .join('-');

                            // Only render the first occurrence of each group
                            if (renderedGroups.has(groupKey)) {
                              return null;
                            }
                            renderedGroups.add(groupKey);

                            const ratio = overlappingReservations.length / capacity;
                            const colorClass = getColorByRatio(ratio);
                            
                            // Instead of dividing width, use full width with slight offset for overlapping cards
                            const widthPct = 90; // Use 90% width to leave some margin
                            const offsetStep = 3; // 3% offset for each overlapping card
                            const leftPct = Math.min(entry.colIndex * offsetStep, 15); // Max 15% offset to avoid going off-screen

                            return (
                              <div
                                key={`group-${groupKey}-${idx}`}
                                className={`absolute rounded-lg p-1 border-2 shadow-lg cursor-pointer hover:shadow-xl hover:z-10 transition-all ${colorClass}`}
                                style={{
                                  top: `${entry.topPct}%`,
                                  height: `${Math.max(entry.heightPct, 8)}%`, // Minimum 8% height for readability
                                  left: `${leftPct}%`,
                                  width: `${widthPct}%`,
                                  minHeight: "40px", // Increased from 24px to 40px
                                  zIndex: entry.colIndex + 1 // Higher z-index for cards that are more to the right
                                }}
                                onClick={() => {
                                  setSelectedSlot({
                                    reservations: overlappingReservations.map(e => e.res),
                                    timeSlot: `${startStr} - ${endStr}`,
                                    day: dayObj.label
                                  });
                                }}
                              >
                                <div className="font-semibold text-xs truncate flex items-center gap-1">
                                  {overlappingReservations.length > 1 ? (
                                    <>
                                      <Users className="w-3 h-3 flex-shrink-0" />
                                      <span>{overlappingReservations.length}</span>
                                    </>
                                  ) : (
                                    <span className="truncate">
                                      {entry.res.user?.name ? entry.res.user.name : `User ${entry.res.user?.id ?? ""}`}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] opacity-90 truncate flex items-center gap-1 mt-0.5">
                                  <Clock className="w-2 h-2 flex-shrink-0" />
                                  <span className="truncate">{startStr} - {endStr}</span>
                                </div>
                              </div>
                            );
                          }).filter(Boolean); // Remove null entries
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* legend */}
            <div className="mt-4 flex gap-3 items-center text-sm flex-wrap">
              <div className="px-3 py-1 rounded bg-green-400 text-black border border-green-500 font-medium">
                Libre (&lt;50%)
              </div>
              <div className="px-3 py-1 rounded bg-yellow-400 text-black border border-yellow-500 font-medium">
                Moderado (50-80%)
              </div>
              <div className="px-3 py-1 rounded bg-orange-500 text-white border border-orange-600 font-medium">
                Alto (80-100%)
              </div>
              <div className="px-3 py-1 rounded bg-red-500 text-white border border-red-600 font-medium">
                Lleno (100%+)
              </div>
              <div className="flex items-center gap-1 text-gray-600 ml-4">
                <Users className="w-4 h-4" />
                <span>Click para ver detalles</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal for Multiple Reservations */}
      {selectedSlot && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Reservas - {selectedSlot.day}
              </h3>
              <button
                onClick={() => setSelectedSlot(null)}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{selectedSlot.timeSlot}</span>
              </div>
            </div>

            <div className="space-y-3">
              {selectedSlot.reservations.map((reservation, idx) => (
                <div 
                  key={`${reservation.id}-${idx}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {reservation.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {reservation.user?.name || `Usuario ${reservation.user?.id || 'Desconocido'}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-sm text-gray-600 text-center">
              {selectedSlot.reservations.length} persona(s) en este horario
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      <LoadingOverlay isVisible={isLoading || isLoadingReservations} text="Cargando disponibilidad..." />
    </>
  );
}