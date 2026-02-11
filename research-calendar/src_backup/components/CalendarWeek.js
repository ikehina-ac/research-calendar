import React, { useMemo } from 'react';
import { useStore } from '../lib/store.js';
import { format, startOfWeek, addDays, eachDayOfInterval } from 'date-fns';
import clsx from 'clsx';

const HOURS = Array.from({ length: 24 }, (_, i) => i + 4); // 4:00 to 27:00 (3:00 next day)

const CalendarWeek = () => {
    const { selectedDate, getWeekData, PATTERNS } = useStore();
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekId = format(weekStart, "yyyy-'W'II");
    const weekData = getWeekData(weekId);
    const days = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });

    // Helper to generate blocks for the day based on pattern
    const getBlocksForDay = (date, patternId) => {
        const dayIdx = date.getDay(); // 0-6 (Sun-Sat)
        const pattern = PATTERNS[patternId.toUpperCase()] || PATTERNS.NORMAL;
        const blocks = [];

        // Basic Schedule Logic based on User Description
        // This is "Hardcoded" visualization logic based on the prompt's description of patterns.

        // Work Default: 9:00 - 18:00 (Flex)
        // Research Default: 18:00 - 23:00

        const isWeekend = dayIdx === 0 || dayIdx === 6;
        const isFri = dayIdx === 5;

        // Common Work Block (Mon-Fri)
        if (!isWeekend) {
            blocks.push({ start: 9, end: 18, type: 'work', label: 'Work (Flex)' });
        }

        // Pattern Specifics
        if (pattern.id === 'normal') {
            if (!isWeekend) {
                if (dayIdx === 1 || dayIdx === 2) { // Mon/Tue
                    // "Mon/Tue prioritise work, research minimal"
                    // Maybe late night research? Or none? User said "Research is minimal".
                    // Let's put a small block or none.
                } else if (dayIdx === 3 || dayIdx === 4) { // Wed/Thu
                    blocks.push({ start: 18, end: 22, type: 'research', label: 'Research' });
                } else if (dayIdx === 5) { // Fri
                    blocks.push({ start: 18, end: 23, type: 'research', label: 'Report Prep' });
                }
            } else {
                if (dayIdx === 6) blocks.push({ start: 8, end: 23, type: 'research', label: 'Research' }); // Sat
                if (dayIdx === 0) blocks.push({ start: 8, end: 18, type: 'research', label: 'Research' }); // Sun
                if (dayIdx === 0) blocks.push({ start: 18, end: 22, type: 'work', label: 'Work Prep' }); // Sun PM
            }
        }
        else if (pattern.id === 'club') {
            if (!isWeekend) {
                if (dayIdx === 3 || dayIdx === 4) blocks.push({ start: 18, end: 22, type: 'research', label: 'Research' });
                if (dayIdx === 5) blocks.push({ start: 18, end: 23, type: 'research', label: 'Report' });
            } else {
                if (dayIdx === 6) blocks.push({ start: 8, end: 18, type: 'research', label: 'Research' }); // Sat
                if (dayIdx === 6) blocks.push({ start: 20, end: 28, type: 'club', label: 'CLUB REWARD' }); // Sat Night
                if (dayIdx === 0) blocks.push({ start: 10, end: 20, type: 'off', label: 'Free' }); // Sun
            }
        }
        else if (pattern.id === 'nomikai') {
            if (!isWeekend) {
                if (dayIdx === 3) blocks.push({ start: 18, end: 22, type: 'research', label: 'Research' });
                if (dayIdx === 4) blocks.push({ start: 18, end: 20, type: 'research', label: 'Light Report' });
                if (dayIdx === 5) blocks.push({ start: 18, end: 24, type: 'nomikai', label: 'NOMIKAI' }); // Fri Night
            } else {
                if (dayIdx === 6) blocks.push({ start: 10, end: 18, type: 'off', label: 'Recovery' }); // Sat
                if (dayIdx === 0) blocks.push({ start: 10, end: 20, type: 'off', label: 'Family/Friends' }); // Sun
            }
        }

        return blocks;
    };

    return React.createElement('div', { className: "h-full w-full flex flex-col overflow-hidden" },
        // Header
        React.createElement('div', { className: "flex-none h-8 flex border-b border-gray-100" },
            React.createElement('div', { className: "w-20 flex-shrink-0 bg-white z-10 sticky left-0" }), // Corner
            React.createElement('div', { className: "flex-1 flex overflow-hidden relative" },
                HOURS.map(h =>
                    React.createElement('div', { key: h, className: "flex-1 text-xs text-gray-400 border-l border-gray-100 pl-1" },
                        `${h > 24 ? h - 24 : h}:00`
                    )
                )
            )
        ),

        // Body
        React.createElement('div', { className: "flex-1 overflow-y-auto" },
            days.map(day => {
                const blocks = getBlocksForDay(day, weekData.pattern);

                return React.createElement('div', { key: day.toString(), className: "flex h-16 border-b border-gray-50 relative group hover:bg-gray-50/50" },
                    // Label
                    React.createElement('div', { className: "w-20 flex-shrink-0 flex flex-col justify-center items-center border-r border-gray-100 bg-white z-10 sticky left-0" },
                        React.createElement('span', { className: "text-xs font-bold text-gray-700 uppercase" }, format(day, 'EEE')),
                        React.createElement('span', { className: "text-xs text-gray-400" }, format(day, 'd'))
                    ),

                    // Timeline
                    React.createElement('div', { className: "flex-1 relative" },
                        // Grid Lines
                        HOURS.map((_, i) =>
                            React.createElement('div', {
                                key: i,
                                className: "absolute top-0 bottom-0 border-l border-gray-100",
                                style: { left: `${(i / HOURS.length) * 100}%` }
                            })
                        ),

                        // Blocks
                        blocks.map((block, i) => {
                            const startPercent = ((block.start - 4) / HOURS.length) * 100;
                            const widthPercent = ((block.end - block.start) / HOURS.length) * 100;

                            let colorClass = "bg-gray-200 text-gray-600";
                            if (block.type === 'work') colorClass = "bg-brand-work text-white";
                            if (block.type === 'research') colorClass = "bg-brand-research text-white";
                            if (block.type === 'club') colorClass = "bg-brand-club text-white";
                            if (block.type === 'nomikai') colorClass = "bg-brand-nomikai text-white";
                            if (block.type === 'off') colorClass = "bg-green-100 text-green-700";

                            return React.createElement('div', {
                                key: i,
                                className: clsx("absolute top-2 bottom-2 rounded-md shadow-sm flex items-center justify-center text-xs font-bold overflow-hidden px-1 whitespace-nowrap z-0 transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer", colorClass),
                                style: { left: `${startPercent}%`, width: `${widthPercent}%` },
                                title: `${block.label} (${block.start}:00 - ${block.end}:00)`
                            }, block.label);
                        })
                    )
                );
            })
        )
    );
};

export default CalendarWeek;
