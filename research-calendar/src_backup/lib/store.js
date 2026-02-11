import React, { createContext, useContext, useState, useEffect } from 'react';

// Default Patterns based on User Input
const PATTERNS = {
    NORMAL: {
        id: 'normal',
        name: '通常週 (Normal)',
        color: 'bg-blue-100 text-blue-800',
        schedule: {
            1: { type: 'work', label: 'Work (Priority)', hours: 0 }, // Mon
            2: { type: 'work', label: 'Work (Priority)', hours: 0 }, // Tue
            3: { type: 'research', label: 'Work -> Research', hours: 4 }, // Wed
            4: { type: 'research', label: 'Work -> Research', hours: 4 }, // Thu
            5: { type: 'research', label: 'Report Day', hours: 5 }, // Fri (Review)
            6: { type: 'research', label: 'Research (All Day)', hours: 8 }, // Sat
            0: { type: 'mixed', label: 'Research -> Work', hours: 5 }, // Sun
        }
    },
    CLUB: {
        id: 'club',
        name: 'ご褒美 (Club)',
        color: 'bg-yellow-100 text-yellow-800',
        schedule: {
            1: { type: 'work', label: 'Work', hours: 0 },
            2: { type: 'work', label: 'Work', hours: 0 },
            3: { type: 'research', label: 'Research', hours: 4 },
            4: { type: 'research', label: 'Research', hours: 4 },
            5: { type: 'research', label: 'Report', hours: 5 },
            6: { type: 'mixed', label: 'Research -> Club', hours: 4 }, // Sat (PM off)
            0: { type: 'off', label: 'Free', hours: 0 }, // Sun (Free)
        }
    },
    NOMIKAI: {
        id: 'nomikai',
        name: 'ご褒美 (Nomikai)',
        color: 'bg-orange-100 text-orange-800',
        schedule: {
            1: { type: 'work', label: 'Work', hours: 0 },
            2: { type: 'work', label: 'Work', hours: 0 },
            3: { type: 'research', label: 'Research', hours: 4 },
            4: { type: 'research', label: 'Light Report', hours: 2 },
            5: { type: 'off', label: 'Nomikai -> Home', hours: 0 },
            6: { type: 'off', label: 'Recovery', hours: 0 },
            0: { type: 'off', label: 'Family/Friends', hours: 0 },
        }
    }
};

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
    // State
    const [weeks, setWeeks] = useState({}); // { "2024-W06": { pattern: 'normal', goals: [], tasks: [] } }
    const [monthlyGoals, setMonthlyGoals] = useState({}); // { "2024-02": [{ id: 1, text: "Finish draft", completed: false }] }
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem('research-calendar-data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                setWeeks(data.weeks || {});
                setMonthlyGoals(data.monthlyGoals || {});
            } catch (e) {
                console.error("Failed to load data", e);
            }
        }
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        localStorage.setItem('research-calendar-data', JSON.stringify({ weeks, monthlyGoals }));
    }, [weeks, monthlyGoals]);

    // Actions
    const setWeekPattern = (weekId, patternId) => {
        setWeeks(prev => ({
            ...prev,
            [weekId]: {
                ...prev[weekId],
                pattern: patternId
            }
        }));
    };

    const getWeekData = (weekId) => {
        return weeks[weekId] || { pattern: 'normal', goals: [], tasks: [] };
    };

    const addMonthlyGoal = (monthId, goal) => {
        setMonthlyGoals(prev => {
            const current = prev[monthId] || [];
            return { ...prev, [monthId]: [...current, { id: Date.now(), text: goal, completed: false }] };
        });
    };

    const toggleMonthlyGoal = (monthId, goalId) => {
        setMonthlyGoals(prev => {
            const current = prev[monthId] || [];
            return { ...prev, [monthId]: current.map(g => g.id === goalId ? { ...g, completed: !g.completed } : g) };
        });
    };

    const addWeekGoal = (weekId, goal) => {
        setWeeks(prev => {
            const week = prev[weekId] || { pattern: 'normal', goals: [], tasks: [] };
            return {
                ...prev,
                [weekId]: {
                    ...week,
                    goals: [...week.goals, { id: Date.now(), text: goal, completed: false }]
                }
            };
        });
    };


    const addTask = (weekId, taskName, hours) => {
        setWeeks(prev => {
            const week = prev[weekId] || { pattern: 'normal', goals: [], tasks: [] };
            return {
                ...prev,
                [weekId]: {
                    ...week,
                    tasks: [...week.tasks, { id: Date.now(), text: taskName, hours: parseFloat(hours), completed: false }]
                }
            };
        });
    };

    const toggleTask = (weekId, taskId) => {
        setWeeks(prev => {
            const week = prev[weekId];
            if (!week) return prev;
            return {
                ...prev,
                [weekId]: {
                    ...week,
                    tasks: week.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
                }
            };
        });
    };

    const value = {
        weeks,
        monthlyGoals,
        selectedDate,
        setSelectedDate,
        setWeekPattern,
        getWeekData,
        addWeekGoal,
        addMonthlyGoal,
        toggleMonthlyGoal,
        addTask,
        toggleTask,
        PATTERNS
    };

    return React.createElement(StoreContext.Provider, { value }, children);
};

export const useStore = () => useContext(StoreContext);
