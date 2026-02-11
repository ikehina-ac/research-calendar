import React from 'react';
import CalendarMonth from './CalendarMonth.js';
import GoalManager from './GoalManager.js';
import CalendarWeek from './CalendarWeek.js';

const Layout = () => {
    return React.createElement('div', { className: "grid grid-cols-3 grid-rows-3 h-screen w-screen p-4 gap-4 overflow-hidden" },
        // Top Left: Monthly Calendar (2 cols x 2 rows)
        React.createElement('div', { className: "col-span-2 row-span-2 glass-panel rounded-2xl p-6 overflow-hidden flex flex-col" },
            React.createElement(CalendarMonth)
        ),

        // Top Right: Goal & Task Manager (1 col x 2 rows)
        React.createElement('div', { className: "col-span-1 row-span-2 glass-panel rounded-2xl p-6 overflow-hidden flex flex-col" },
            React.createElement(GoalManager)
        ),

        // Bottom: Weekly Detail View (3 cols x 1 row)
        React.createElement('div', { className: "col-span-3 row-span-1 glass-panel rounded-2xl p-4 overflow-hidden flex flex-col" },
            React.createElement(CalendarWeek)
        )
    );
};

export default Layout;
