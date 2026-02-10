"use client";

import React, { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction"; // for dateClick
import { EventInput } from "@fullcalendar/core";
import "./Calendar.css"; // We might need a small CSS for specific overrides if Tailwind isn't enough

interface CalendarProps {
    events?: EventInput[];
    onDateClick?: (arg: any) => void;
    selectable?: boolean;
    selectMirror?: boolean;
    onSelect?: (arg: any) => void;
    selectedDates?: string[];
    onEventMouseEnter?: (arg: any) => void;
    onEventMouseLeave?: (arg: any) => void;
    onDayMouseEnter?: (arg: { date: Date; el: HTMLElement; jsEvent: MouseEvent }) => void;
    onDayMouseLeave?: (arg: { date: Date; el: HTMLElement; jsEvent: MouseEvent }) => void;
}

export default function Calendar({
    events = [],
    onDateClick,
    selectable = false,
    onSelect,
    selectedDates = [],
    onEventMouseEnter,
    onEventMouseLeave,
    onDayMouseEnter,
    onDayMouseLeave
}: CalendarProps) {
    const calendarRef = useRef<FullCalendar>(null);

    // Refs to keep handlers fresh without re-attaching listeners in dayCellDidMount
    const mouseEnterRef = useRef(onDayMouseEnter);
    const mouseLeaveRef = useRef(onDayMouseLeave);

    useEffect(() => {
        mouseEnterRef.current = onDayMouseEnter;
        mouseLeaveRef.current = onDayMouseLeave;
    }, [onDayMouseEnter, onDayMouseLeave]);

    // Compute final events directly to avoid state synchronization loops
    const finalEvents = React.useMemo(() => {
        const selectedEvents = selectedDates.map(date => ({
            title: 'Selected',
            start: date,
            display: 'background',
            backgroundColor: '#3b82f6',
            classNames: ['selected-date-bg']
        }));
        return [...events, ...selectedEvents];
    }, [events, selectedDates]);

    const handleEventContent = (arg: any) => {
        // Use event's backgroundColor if set, otherwise fallback
        const color = arg.event.backgroundColor || (arg.event.classNames.includes('event-setup') ? '#007bff' : '#28a745');

        return (
            <div
                className="flex justify-center items-center w-full h-full cursor-pointer hover:scale-125 transition-transform"
            >
                <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                ></div>
            </div>
        );
    };

    return (
        <div className="w-full h-full bg-white rounded-[20px] shadow-lg overflow-hidden p-4 calendar-custom">
            <style jsx global>{`
                /* Remove default event bar styling to show only dots */
                .calendar-custom .fc-event {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    margin: 0px 1px !important; /* tight spacing */
                }
                /* Flex container for events to wrap nicely instead of stack strictly */
                .calendar-custom .fc-daygrid-day-events {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    justify-content: center !important;
                    align-items: center !important;
                    gap: 2px !important;
                    min-height: 1.5em; /* Ensure space */
                }
                .calendar-custom .fc-daygrid-event-harness {
                    margin: 0 !important;
                }
                
                /* Mobile Toolbar Fixes */
                /* Mobile Toolbar Fixes */
                @media (max-width: 640px) {
                    .calendar-custom .fc-header-toolbar {
                        display: flex !important;
                        flex-direction: row !important;
                        justify-content: space-between !important;
                        align-items: center !important;
                        gap: 4px !important;
                        margin-bottom: 12px !important;
                    }
                    .calendar-custom .fc-toolbar-chunk {
                        display: flex !important;
                        align-items: center !important;
                    }
                    /* Title Section */
                    .calendar-custom .fc-toolbar-title {
                        font-size: 0.9rem !important;
                        font-weight: 700 !important;
                    }
                    /* Buttons */
                    .calendar-custom .fc-button {
                        padding: 4px 8px !important;
                        font-size: 0.7rem !important;
                        height: 28px !important;
                        line-height: 1 !important;
                        border-radius: 6px !important;
                    }
                    /* Hide Today button on very small screens if needed, or just make it small */
                    .calendar-custom .fc-today-button {
                        text-transform: capitalize !important;
                    }
                }
            `}</style>
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: "prev,next",
                    center: "title",
                    right: "today",
                }}
                height="100%"
                events={finalEvents}
                eventContent={handleEventContent}
                dayMaxEvents={false} /* Disable +more text, show all dots */
                selectable={selectable}
                dateClick={onDateClick}
                select={onSelect}
                selectMirror={true}
                aspectRatio={1.35}
                eventMouseEnter={onEventMouseEnter}
                eventMouseLeave={onEventMouseLeave}
                dayCellDidMount={(arg) => {
                    // Use refs to call current handlers
                    arg.el.addEventListener('mouseenter', (ev) => {
                        if (mouseEnterRef.current) mouseEnterRef.current({ date: arg.date, el: arg.el, jsEvent: ev });
                    });
                    arg.el.addEventListener('mouseleave', (ev) => {
                        if (mouseLeaveRef.current) mouseLeaveRef.current({ date: arg.date, el: arg.el, jsEvent: ev });
                    });
                }}
            />
        </div>
    );
}
