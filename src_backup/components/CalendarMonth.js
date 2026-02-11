import React from 'react';
import { useStore } from '../lib/store.js';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, getWeek, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { tailwindMerge } from 'tailwind-merge';

const CalendarMonth = () => {
    const { selectedDate, setSelectedDate, weeks, getWeekData } = useStore();

    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const nextMonth = () => setSelectedDate(addMonths(selectedDate, 1));
    const prevMonth = () => setSelectedDate(subMonths(selectedDate, 1));

    const onDateClick = (day) => {
        setSelectedDate(day);
    };

    return React.createElement('div', { className: "h-full flex flex-col" },
        // Header
        React.createElement('div', { className: "flex justify-between items-center mb-6" },
            React.createElement('h2', { className: "text-2xl font-bold text-gray-800" }, format(selectedDate, 'MMMM yyyy')),
            React.createElement('div', { className: "flex space-x-2" },
                React.createElement('button', { onClick: prevMonth, className: "p-2 hover:bg-gray-100 rounded-full" }, React.createElement(ChevronLeft, { size: 20 })),
                React.createElement('button', { onClick: nextMonth, className: "p-2 hover:bg-gray-100 rounded-full" }, React.createElement(ChevronRight, { size: 20 }))
            )
        ),

        // Days Header
        React.createElement('div', { className: "grid grid-cols-7 mb-2" },
            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day =>
                React.createElement('div', { key: day, className: "text-center text-sm font-medium text-gray-500 uppercase tracking-wider" }, day)
            )
        ),

        // Calendar Grid
        React.createElement('div', { className: "grid grid-cols-7 grid-rows-6 gap-2 flex-1" },
            calendarDays.map((day, idx) => {
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isSelected = isSameDay(day, selectedDate);
                const weekId = format(day, "yyyy-'W'II"); // Week Iso string
                const weekData = getWeekData(weekId);
                let patternColor = 'bg-gray-50'; // Default

                // Color coding for weeks based on pattern
                // Note: Ideally we color the whole week row or have a marker.
                // Here let's subtle tint the day based on the week pattern?
                // Or maybe just a badge.

                return React.createElement('div', {
                    key: day.toString(),
                    onClick: () => onDateClick(day),
                    className: clsx(
                        "p-2 rounded-lg cursor-pointer transition-all border flex flex-col justify-between hover:shadow-md",
                        isSelected ? "ring-2 ring-brand-research border-transparent" : "border-gray-100",
                        !isCurrentMonth && "opacity-40 bg-gray-50",
                        isCurrentMonth && "bg-white"
                    )
                },
                    React.createElement('div', { className: "flex justify-between items-start" },
                        React.createElement('span', {
                            className: clsx("text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                                isSameDay(day, new Date()) ? "bg-brand-research text-white" : "text-gray-700")
                        }, format(day, 'd'))
                    ),

                    // Show Pattern Dot if Monday
                    day.getDay() === 1 && React.createElement('div', { className: "mt-auto" },
                        React.createElement('span', { className: "inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800" },
                            weekData.pattern === 'normal' ? 'Normal' : weekData.pattern === 'club' ? 'Club' : 'Nomikai'
                        )
                    )
                );
            })
        )
    );
};

export default CalendarMonth;
