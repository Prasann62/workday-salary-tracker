import React, { useState } from 'react';
import { useSalary } from '../context/SalaryContext';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, getDay, isSameMonth, parseISO, isToday } from 'date-fns';
import { EntryModal } from './EntryModal';
import { motion, AnimatePresence } from 'framer-motion';

export function Calendar({ currentMonth }: { currentMonth: Date }) {
    const { entries } = useSalary();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    const startDay = getDay(startOfMonth(currentMonth));

    // Create padding for days of the previous month
    const paddingDays = Array.from({ length: startDay }, (_, i) => i);

    return (
        <>
            <div className="">
                <div className="grid grid-cols-7 gap-px mb-4 border-b border-dashed border-white/10 pb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest py-1">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {paddingDays.map((i) => (
                        <div key={`padding-${i}`} className="p-2 aspect-square rounded-sm bg-white/5 border border-transparent" />
                    ))}

                    {daysInMonth.map((date, i) => {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const entry = entries[dateStr];

                        let statusColor = "bg-white/5 hover:bg-white/10 border-transparent hover:border-white/20";
                        let dotColor = null;

                        if (entry) {
                            if (entry.actualHours > entry.shiftHours) {
                                statusColor = "bg-neon-purple/10 hover:bg-neon-purple/20 border-neon-purple/30 hover:border-neon-purple/50";
                                dotColor = "bg-neon-purple shadow-[0_0_8px_rgba(188,19,254,0.8)]";
                            } else if (entry.actualHours > 0) {
                                statusColor = "bg-neon-cyan/10 hover:bg-neon-cyan/20 border-neon-cyan/30 hover:border-neon-cyan/50";
                                dotColor = "bg-neon-cyan shadow-[0_0_8px_rgba(0,243,255,0.8)]";
                            }
                        } else if (date < new Date() && !isToday(date)) {
                            statusColor = "bg-red-500/10 hover:bg-red-500/20 border-red-500/30 hover:border-red-500/50";
                            dotColor = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]";
                        }

                        const todayStyles = isToday(date) ? "ring-1 ring-white ring-offset-2 ring-offset-[#050505] shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "";

                        return (
                            <motion.button
                                key={dateStr}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2, delay: i * 0.01 }}
                                onClick={() => setSelectedDate(dateStr)}
                                className={`relative flex flex-col items-center justify-center aspect-square rounded-sm transition-all cursor-pointer border ${statusColor} ${todayStyles}`}
                            >
                                <span className={`text-[11px] font-bold ${isSameMonth(date, currentMonth) ? 'text-white' : 'text-gray-600'}`}>
                                    {format(date, 'd')}
                                </span>

                                {entry && (
                                    <div className="absolute bottom-1 text-[8px] font-bold text-gray-400">
                                        {entry.actualHours}h
                                    </div>
                                )}

                                {dotColor && (
                                    <div className={`absolute top-1.5 right-1.5 w-1 h-1 rounded-sm ${dotColor}`} />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence>
                {selectedDate && (
                    <EntryModal
                        date={selectedDate}
                        onClose={() => setSelectedDate(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
