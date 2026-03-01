import React, { useState, useEffect, useRef } from 'react';
import { useSalary } from '../context/SalaryContext';
import { GripVertical } from 'lucide-react';
import { AddEventModal } from './AddEventModal';
import { EventCategory, PlannedEvent } from '../utils/calculations';
import { motion, AnimatePresence } from 'framer-motion';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import { DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core';

const DRAGGABLE_EVENTS: { title: string; category: EventCategory }[] = [
    { title: 'Standard Shift', category: 'info' },
    { title: 'Overtime Shift', category: 'primary' },
    { title: 'Planned Leave', category: 'danger' },
    { title: 'Meeting', category: 'warning' },
    { title: 'Completed', category: 'success' },
];

const categoryStyles: Record<EventCategory, string> = {
    primary: '!text-[#bc13fe] !border-[#bc13fe]/30',
    success: '!text-[#00ffd1] !border-[#00ffd1]/30',
    danger: '!text-[#ff2a2a] !border-[#ff2a2a]/30',
    info: '!text-[#00f3ff] !border-[#00f3ff]/30',
    warning: '!text-[#ffd700] !border-[#ffd700]/30',
};

const bgColors: Record<EventCategory, string> = {
    primary: 'bg-[#bc13fe]/20 text-[#bc13fe] border-[#bc13fe]/30',
    success: 'bg-[#00ffd1]/20 text-[#00ffd1] border-[#00ffd1]/30',
    danger: 'bg-[#ff2a2a]/20 text-[#ff2a2a] border-[#ff2a2a]/30',
    info: 'bg-[#00f3ff]/20 text-[#00f3ff] border-[#00f3ff]/30',
    warning: 'bg-[#ffd700]/20 text-[#ffd700] border-[#ffd700]/30',
};

export function FutureCalendar() {
    const { plannedEvents, savePlannedEvent, deletePlannedEvent } = useSalary();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [editingEvent, setEditingEvent] = useState<PlannedEvent | undefined>();

    const calendarRef = useRef<FullCalendar>(null);
    const externalEventsRef = useRef<HTMLDivElement>(null);

    // Initialize External Draggable Elements for FullCalendar
    useEffect(() => {
        if (externalEventsRef.current) {
            new Draggable(externalEventsRef.current, {
                itemSelector: '.external-event',
                eventData: (eventEl) => {
                    return {
                        title: eventEl.innerText,
                        classNames: [eventEl.getAttribute('data-category') || 'info'],
                        // Custom data to tell our App what's dropping
                        extendedProps: { category: eventEl.getAttribute('data-category') }
                    };
                },
            });
        }
    }, []);

    // Flatten our SalaryContext plannedEvents into FullCalendar format
    const calendarEvents = Object.values(plannedEvents).flat().map(event => ({
        id: event.id,
        title: event.title,
        date: event.date,
        allDay: true,
        classNames: [categoryStyles[event.category]],
        extendedProps: { category: event.category }
    }));

    // Handle full calendar dragging/dropping an external event onto the grid
    const handleEventReceive = (info: any) => {
        // info.event has the data from the Draggable initialization
        const droppedDate = info.event.startStr; // YYYY-MM-DD
        const category = info.event.extendedProps.category as EventCategory || 'info';

        savePlannedEvent({
            id: Date.now().toString(),
            date: droppedDate,
            title: info.event.title,
            category: category
        });

        // Remove the temporary event FullCalendar renders, because SalaryContext will trigger a re-render with the real event
        info.event.remove();
    };

    // Handle moving an existing event inside the calendar grid
    const handleEventDrop = (info: EventDropArg) => {
        const eventId = info.event.id;
        const oldDate = info.oldEvent.startStr;
        const newDate = info.event.startStr;
        const category = info.event.extendedProps.category as EventCategory;

        // Remove from old date
        deletePlannedEvent(eventId, oldDate);

        // Add to new date
        savePlannedEvent({
            id: eventId,
            date: newDate,
            title: info.event.title,
            category: category
        });
    };

    const handleDateSelect = (arg: DateSelectArg) => {
        setEditingEvent(undefined);
        setSelectedDate(arg.startStr);
        arg.view.calendar.unselect();
    };

    const handleEventClick = (arg: EventClickArg) => {
        const eventId = arg.event.id;
        const dateStr = arg.event.startStr;
        const category = arg.event.extendedProps.category as EventCategory;

        setEditingEvent({
            id: eventId,
            date: dateStr,
            title: arg.event.title,
            category: category
        });
        setSelectedDate(dateStr);
    };

    return (
        <div className="flex flex-col xl:flex-row gap-6 h-full items-start">
            {/* Main Calendar Area - Replaced with FullCalendar */}
            <div className="flex-1 stitch-card p-6 w-full overflow-hidden bg-[#050505]">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
                    }}
                    editable={true} // Allow internal drag and drop
                    droppable={true} // Allow external dropping
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    events={calendarEvents}
                    select={handleDateSelect}
                    eventClick={handleEventClick}
                    eventReceive={handleEventReceive}
                    eventDrop={handleEventDrop}
                    height="auto"
                />
            </div>

            {/* Sidebar for Draggable Events */}
            <div className="w-full xl:w-80 shrink-0 space-y-6">
                <div className="stitch-card p-6" id="external-events" ref={externalEventsRef}>
                    <h3 className="text-sm font-bold tracking-widest uppercase text-white mb-4 flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-[#00f3ff]" />
                        Draggable Events
                    </h3>
                    <p className="text-xs text-gray-500 mb-6 font-mono leading-relaxed">
                        Drag and drop your events onto the calendar dates to schedule them quickly.
                    </p>

                    <div className="space-y-3">
                        {DRAGGABLE_EVENTS.map((evt, i) => (
                            <motion.div
                                key={i}
                                data-category={evt.category}
                                whileHover={{ scale: 1.02, x: 5 }}
                                className={`external-event p-3 border rounded-sm flex items-center gap-3 cursor-grab active:cursor-grabbing ${bgColors[evt.category]}`}
                            >
                                <div className="w-2 h-2 rounded-sm bg-current shrink-0 shadow-[0_0_8px_currentColor]"></div>
                                <span className="text-xs font-bold uppercase tracking-widest">{evt.title}</span>
                                <GripVertical className="w-4 h-4 ml-auto opacity-50" />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Additional instructions/stats card */}
                <div className="stitch-card p-6 border-dashed">
                    <h3 className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-3">
                        Quick Tips
                    </h3>
                    <ul className="text-xs text-gray-400 font-mono space-y-3">
                        <li className="flex gap-2">
                            <span className="text-[#00f3ff]">-</span>
                            Click any empty date cell to manually add a precise event.
                        </li>
                        <li className="flex gap-2">
                            <span className="text-[#bc13fe]">-</span>
                            Click an existing event pill to edit or purge it.
                        </li>
                        <li className="flex gap-2">
                            <span className="text-[#00ffd1]">-</span>
                            You can drag events between days directly on the grid.
                        </li>
                    </ul>
                </div>
            </div>

            <AnimatePresence>
                {selectedDate && (
                    <AddEventModal
                        date={selectedDate}
                        onClose={() => {
                            setSelectedDate(null);
                            setEditingEvent(undefined);
                        }}
                        existingEvent={editingEvent}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
