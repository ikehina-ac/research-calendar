import React, { useState } from 'react';
import { useStore } from '../lib/store.js';
import { format, startOfWeek } from 'date-fns';
import { CheckCircle, Circle, Plus, AlertTriangle, PartyPopper, Beer, Briefcase } from 'lucide-react';
import clsx from 'clsx';

const GoalManager = () => {
    const {
        selectedDate, weeks, monthlyGoals,
        addMonthlyGoal, toggleMonthlyGoal,
        addWeekGoal, getWeekData,
        addTask, toggleTask, setWeekPattern,
        PATTERNS
    } = useStore();

    const monthId = format(selectedDate, 'yyyy-MM');
    // Correct weekId calculation to match ISO week used elsewhere or simple format?
    // Using date-fns format 'yyyy-WII' is standard.
    // NOTE: startOfWeek(selectedDate, { weekStartsOn: 1 }) ensures we get the Monday.
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekId = format(weekStart, "yyyy-'W'II");

    const weekData = getWeekData(weekId);
    const monthGoalsList = monthlyGoals[monthId] || [];

    // Local State for inputs
    const [newMonthGoal, setNewMonthGoal] = useState('');
    const [newWeekGoal, setNewWeekGoal] = useState('');
    const [newTask, setNewTask] = useState('');
    const [newTaskHours, setNewTaskHours] = useState('1');

    // Calculations
    const currentPattern = PATTERNS[weekData.pattern.toUpperCase()] || PATTERNS.NORMAL;

    // Calculate Total Research Hours Available in this Pattern
    const totalResearchHours = Object.values(currentPattern.schedule).reduce((acc, day) => {
        // Simple heuristic: if type contains 'research' or 'mixed', use the hours.
        // The PATTERNS object I defined has 'hours' explicitly.
        return acc + (day.hours || 0);
    }, 0);

    const plannedTaskHours = (weekData.tasks || []).reduce((acc, t) => acc + (t.completed ? 0 : t.hours), 0);
    const isOverloaded = plannedTaskHours > totalResearchHours;

    // Handlers
    const handleAddMonthGoal = (e) => {
        e.preventDefault();
        if (!newMonthGoal.trim()) return;
        addMonthlyGoal(monthId, newMonthGoal);
        setNewMonthGoal('');
    };

    const handleAddWeekGoal = (e) => {
        e.preventDefault();
        if (!newWeekGoal.trim()) return;
        addWeekGoal(weekId, newWeekGoal);
        setNewWeekGoal('');
    };

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        addTask(weekId, newTask, newTaskHours);
        setNewTask('');
        setNewTaskHours('1');
    };

    return React.createElement('div', { className: "h-full flex flex-col space-y-6" },
        // 1. Pattern Switcher
        React.createElement('div', { className: "bg-gray-50 p-4 rounded-xl border border-gray-200" },
            React.createElement('h3', { className: "text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3" }, "Weekly Pattern"),
            React.createElement('div', { className: "grid grid-cols-3 gap-2" },
                Object.values(PATTERNS).map(pattern =>
                    React.createElement('button', {
                        key: pattern.id,
                        onClick: () => setWeekPattern(weekId, pattern.id),
                        className: clsx(
                            "flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium transition-all border-2",
                            weekData.pattern === pattern.id
                                ? "border-brand-research bg-white shadow-sm text-brand-research"
                                : "border-transparent hover:bg-gray-100 text-gray-500"
                        )
                    },
                        pattern.id === 'normal' && React.createElement(Briefcase, { size: 16, className: "mb-1" }),
                        pattern.id === 'club' && React.createElement(PartyPopper, { size: 16, className: "mb-1" }),
                        pattern.id === 'nomikai' && React.createElement(Beer, { size: 16, className: "mb-1" }),
                        pattern.name.split('(')[1].replace(')', '') // Show short name
                    )
                )
            )
        ),

        // 2. Research Balance & Stats
        React.createElement('div', { className: "space-y-2" },
            React.createElement('div', { className: "flex justify-between items-end" },
                React.createElement('h3', { className: "text-xs font-semibold text-gray-500 uppercase tracking-widest" }, "Research Balance"),
                React.createElement('span', { className: clsx("text-sm font-bold", isOverloaded ? "text-red-500" : "text-green-600") },
                    `${plannedTaskHours}h / ${totalResearchHours}h`
                )
            ),
            React.createElement('div', { className: "h-2 w-full bg-gray-100 rounded-full overflow-hidden" },
                React.createElement('div', {
                    className: clsx("h-full transition-all duration-500", isOverloaded ? "bg-red-500" : "bg-brand-research"),
                    style: { width: `${Math.min(100, (plannedTaskHours / totalResearchHours) * 100)}%` }
                })
            ),
            isOverloaded && React.createElement('div', { className: "flex items-center text-red-500 text-xs mt-1" },
                React.createElement(AlertTriangle, { size: 12, className: "mr-1" }),
                "Hard Schedule! Consider reducing tasks."
            )
        ),

        // 3. Goals Section (Scrollable)
        React.createElement('div', { className: "flex-1 overflow-y-auto space-y-6 pr-2" },

            // Monthly Goals
            React.createElement('div', { className: "space-y-3" },
                React.createElement('h3', { className: "text-lg font-bold text-gray-800" }, format(selectedDate, 'MMMM') + " Goals"),
                React.createElement('div', { className: "space-y-2" },
                    monthGoalsList.map(g =>
                        React.createElement('div', {
                            key: g.id,
                            onClick: () => toggleMonthlyGoal(monthId, g.id),
                            className: "flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer group"
                        },
                            g.completed
                                ? React.createElement(CheckCircle, { size: 18, className: "text-green-500 mr-3 flex-shrink-0" })
                                : React.createElement(Circle, { size: 18, className: "text-gray-300 group-hover:text-gray-400 mr-3 flex-shrink-0" }),
                            React.createElement('span', { className: clsx("text-sm", g.completed && "line-through text-gray-400") }, g.text)
                        )
                    )
                ),
                React.createElement('form', { onSubmit: handleAddMonthGoal, className: "flex items-center mt-2 group" },
                    React.createElement(Plus, { size: 16, className: "text-gray-400 mr-2" }),
                    React.createElement('input', {
                        type: "text",
                        placeholder: "Add monthly goal...",
                        className: "flex-1 bg-transparent text-sm focus:outline-none placeholder-gray-400",
                        value: newMonthGoal,
                        onChange: e => setNewMonthGoal(e.target.value)
                    })
                )
            ),

            // Weekly Goals & Tasks
            React.createElement('div', { className: "space-y-3 pt-4 border-t border-gray-100" },
                React.createElement('h3', { className: "text-lg font-bold text-gray-800" }, "Week of " + format(weekStart, 'd MMM')),

                // Weekly Goals
                React.createElement('div', { className: "space-y-2" },
                    (weekData.goals || []).map(g =>
                        React.createElement('div', { key: g.id, className: "flex items-center p-2 rounded bg-blue-50/50" },
                            React.createElement(CheckCircle, { size: 16, className: "text-brand-projects mr-2 opacity-0" }), // Placeholder for alignment
                            React.createElement('span', { className: "text-sm font-medium text-brand-projects" }, g.text)
                        )
                    )
                ),
                React.createElement('form', { onSubmit: handleAddWeekGoal, className: "flex items-center mt-2" },
                    React.createElement('input', {
                        type: "text",
                        placeholder: "Set main goal for this week...",
                        className: "w-full p-2 bg-gray-50 rounded text-sm focus:ring-2 focus:ring-blue-100 outline-none",
                        value: newWeekGoal,
                        onChange: e => setNewWeekGoal(e.target.value)
                    })
                ),

                // Tasks
                React.createElement('div', { className: "mt-4 space-y-2" },
                    React.createElement('h4', { className: "text-xs font-semibold text-gray-400 uppercase" }, "Tasks & Estimates"),
                    (weekData.tasks || []).map(t =>
                        React.createElement('div', {
                            key: t.id,
                            onClick: () => toggleTask(weekId, t.id),
                            className: "flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-gray-300 cursor-pointer transition-colors bg-white shadow-sm"
                        },
                            React.createElement('div', { className: "flex items-center" },
                                t.completed
                                    ? React.createElement(CheckCircle, { size: 18, className: "text-green-500 mr-3" })
                                    : React.createElement(Circle, { size: 18, className: "text-gray-300 mr-3" }),
                                React.createElement('span', { className: clsx("text-sm text-gray-700", t.completed && "line-through text-gray-400") }, t.text)
                            ),
                            React.createElement('span', { className: "text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded" }, t.hours + "h")
                        )
                    )
                ),

                React.createElement('form', { onSubmit: handleAddTask, className: "flex items-center space-x-2 mt-2" },
                    React.createElement('input', {
                        type: "text",
                        placeholder: "New task...",
                        className: "flex-1 p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-research",
                        value: newTask,
                        onChange: e => setNewTask(e.target.value)
                    }),
                    React.createElement('input', {
                        type: "number",
                        min: "0.5", step: "0.5",
                        className: "w-16 p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-research",
                        value: newTaskHours,
                        onChange: e => setNewTaskHours(e.target.value)
                    }),
                    React.createElement('button', { type: "submit", className: "p-2 bg-brand-research text-white rounded hover:bg-violet-600 transition-colors" },
                        React.createElement(Plus, { size: 16 })
                    )
                )
            )
        )
    );
};

export default GoalManager;
