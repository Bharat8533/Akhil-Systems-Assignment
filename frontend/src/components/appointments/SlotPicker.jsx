import React from 'react';
import {
  Clock,
  AlertTriangle,
  Coffee,
  CalendarOff,
  Sun,
  Sunset,
  Moon
} from 'lucide-react';
import { formatTime } from '../../utils/dateUtils';

export const SlotPicker = ({
  availability,
  selectedSlot,
  onSelectSlot,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="py-8 text-center border border-slate-200 rounded-xl bg-slate-50/50">
        <div className="inline-block w-5 h-5 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mb-1.5"></div>
        <p className="text-xs font-semibold text-slate-600">Calculating doctor availability...</p>
      </div>
    );
  }

  if (!availability) {
    return (
      <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-500 text-xs">
        Select a physician and date to load appointment slots.
      </div>
    );
  }

  if (availability.status === 'on_leave') {
    return (
      <div className="p-5 rounded-xl border border-rose-200 bg-rose-50/60 text-center">
        <CalendarOff className="w-6 h-6 text-rose-600 mx-auto mb-1.5" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">Physician on Leave</h4>
        <p className="text-xs text-rose-700 mt-0.5 max-w-md mx-auto">
          {availability.message || 'The selected doctor is on approved leave on this date. Please pick another date or doctor.'}
        </p>
      </div>
    );
  }

  if (availability.status === 'off_duty') {
    return (
      <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/60 text-center">
        <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto mb-1.5" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">Clinic Closed on This Day</h4>
        <p className="text-xs text-amber-800 mt-0.5 max-w-md mx-auto">
          {availability.message || 'The physician does not hold OPD clinics on this weekday.'}
        </p>
      </div>
    );
  }

  if (availability.status === 'inactive') {
    return (
      <div className="p-5 rounded-xl border border-slate-300 bg-slate-100 text-center">
        <AlertTriangle className="w-6 h-6 text-slate-500 mx-auto mb-1.5" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Inactive Physician Profile</h4>
        <p className="text-xs text-slate-600 mt-0.5 max-w-md mx-auto">
          This doctor profile is currently flagged as inactive in the roster.
        </p>
      </div>
    );
  }

  const slots = availability.slots || [];
  const morningSlots = slots.filter(s => s.period === 'morning');
  const afternoonSlots = slots.filter(s => s.period === 'afternoon');
  const eveningSlots = slots.filter(s => s.period === 'evening');

  const renderSlotGroup = (title, icon, groupSlots) => {
    if (groupSlots.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
          {icon}
          <span>{title}</span>
          <span className="text-[11px] font-normal text-slate-400">({groupSlots.length})</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {groupSlots.map(slot => {
            const isSelected = selectedSlot === slot.time;
            const isAvailable = slot.state === 'available';
            const isBooked = slot.state === 'booked';
            const isBreak = slot.state === 'break';
            const isPast = slot.state === 'past';

            let btnClass = 'border text-slate-400 bg-slate-50 cursor-not-allowed';
            if (isSelected) {
              btnClass = 'bg-teal-700 text-white border-teal-800 ring-2 ring-teal-500/40 shadow-xs font-bold cursor-pointer';
            } else if (isAvailable) {
              btnClass = 'bg-white hover:bg-teal-50 hover:border-teal-500 text-slate-800 border-slate-300 font-semibold cursor-pointer shadow-2xs';
            } else if (isBreak) {
              btnClass = 'bg-amber-50 text-amber-700 border-amber-200 cursor-not-allowed text-[11px]';
            } else if (isBooked) {
              btnClass = 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through opacity-70';
            } else if (isPast) {
              btnClass = 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed opacity-60';
            }

            return (
              <button
                key={slot.time}
                type="button"
                disabled={!isAvailable}
                onClick={() => onSelectSlot(slot.time)}
                title={
                  isBreak ? `Physician Break: ${slot.reason}` :
                  isBooked ? 'Slot already reserved' :
                  isPast ? 'Slot has passed' :
                  `Available (${slot.duration} mins)`
                }
                className={`py-2 px-1.5 rounded-lg text-xs flex flex-col items-center justify-center transition-all ${btnClass}`}
              >
                <span>{formatTime(slot.time)}</span>
                {isBreak && <span className="text-[9px] mt-0.5 text-amber-700 font-medium">Break</span>}
                {isBooked && <span className="text-[9px] mt-0.5 text-slate-400">Booked</span>}
                {isPast && <span className="text-[9px] mt-0.5 text-slate-400">Past</span>}
                {isSelected && <span className="text-[9px] mt-0.5 text-teal-100 font-medium">Selected</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-white border border-slate-300"></span>
            <span className="text-slate-700 font-medium">Available ({availability.summary?.available || 0})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-teal-700"></span>
            <span className="text-slate-800 font-bold">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></span>
            <span className="text-slate-400">Booked ({availability.summary?.booked || 0})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-50 border border-amber-200"></span>
            <span className="text-amber-700">Doctor Break</span>
          </div>
        </div>

        <span className="text-slate-500 font-medium text-[11px]">
          Duration: {slots[0]?.duration || 15} min
        </span>
      </div>

      <div className="space-y-4 pt-1">
        {renderSlotGroup('Morning Hours', <Sun className="w-3.5 h-3.5 text-amber-500" />, morningSlots)}
        {renderSlotGroup('Afternoon Hours', <Sunset className="w-3.5 h-3.5 text-orange-500" />, afternoonSlots)}
        {renderSlotGroup('Evening Hours', <Moon className="w-3.5 h-3.5 text-indigo-500" />, eveningSlots)}
      </div>
    </div>
  );
};
