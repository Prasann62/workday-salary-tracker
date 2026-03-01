import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { DailyEntry, MonthlyStats, calculateMonthlyStats, PlannedEvent } from '../utils/calculations';
import { getDaysInMonth, parseISO } from 'date-fns';

interface SalaryContextType {
    entries: Record<string, DailyEntry>;
    saveEntry: (entry: DailyEntry) => void;
    deleteEntry: (date: string) => void;
    getEntry: (date: string) => DailyEntry | undefined;
    getMonthlyStats: (currentMonth: Date) => MonthlyStats;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    userSettings: {
        defaultWage: number;
        defaultShiftHours: number;
    };
    updateUserSettings: (settings: { defaultWage: number; defaultShiftHours: number }) => void;
    plannedEvents: Record<string, PlannedEvent[]>;
    savePlannedEvent: (event: PlannedEvent) => void;
    deletePlannedEvent: (eventId: string, date: string) => void;
}

const SalaryContext = createContext<SalaryContextType | undefined>(undefined);

export function SalaryProvider({ children }: { children: ReactNode }) {
    const [entries, setEntries] = useState<Record<string, DailyEntry>>(() => {
        const saved = localStorage.getItem('salary_entries');
        return saved ? JSON.parse(saved) : {};
    });

    const [plannedEvents, setPlannedEvents] = useState<Record<string, PlannedEvent[]>>(() => {
        const saved = localStorage.getItem('salary_planned_events');
        return saved ? JSON.parse(saved) : {};
    });

    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark' || saved === 'light') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    const [userSettings, setUserSettings] = useState(() => {
        const saved = localStorage.getItem('user_settings');
        return saved ? JSON.parse(saved) : { defaultWage: 0, defaultShiftHours: 9 };
    });

    useEffect(() => {
        localStorage.setItem('salary_entries', JSON.stringify(entries));
    }, [entries]);

    useEffect(() => {
        localStorage.setItem('salary_planned_events', JSON.stringify(plannedEvents));
    }, [plannedEvents]);

    useEffect(() => {
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('user_settings', JSON.stringify(userSettings));
    }, [userSettings]);

    const saveEntry = (entry: DailyEntry) => {
        setEntries(prev => ({ ...prev, [entry.date]: entry }));
    };

    const savePlannedEvent = (event: PlannedEvent) => {
        setPlannedEvents(prev => {
            const dateEvents = prev[event.date] || [];
            const existingIndex = dateEvents.findIndex(e => e.id === event.id);
            if (existingIndex >= 0) {
                const updated = [...dateEvents];
                updated[existingIndex] = event;
                return { ...prev, [event.date]: updated };
            }
            return { ...prev, [event.date]: [...dateEvents, event] };
        });
    };

    const deletePlannedEvent = (eventId: string, date: string) => {
        setPlannedEvents(prev => {
            if (!prev[date]) return prev;
            return {
                ...prev,
                [date]: prev[date].filter(e => e.id !== eventId)
            };
        });
    };

    const deleteEntry = (date: string) => {
        setEntries(prev => {
            const newEntries = { ...prev };
            delete newEntries[date];
            return newEntries;
        });
    };

    const getEntry = (date: string) => entries[date];

    const getMonthlyStats = (currentMonth: Date) => {
        const monthPrefix = currentMonth.toISOString().substring(0, 7); // YYYY-MM
        const daysInMonth = getDaysInMonth(currentMonth);

        const monthlyEntries = Object.values(entries).filter(entry =>
            entry.date.startsWith(monthPrefix)
        );

        return calculateMonthlyStats(monthlyEntries, daysInMonth);
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const updateUserSettings = (settings: { defaultWage: number; defaultShiftHours: number }) => {
        setUserSettings(settings);
    };

    const value = {
        entries,
        saveEntry,
        deleteEntry,
        getEntry,
        getMonthlyStats,
        theme,
        toggleTheme,
        userSettings,
        updateUserSettings,
        plannedEvents,
        savePlannedEvent,
        deletePlannedEvent
    };

    return <SalaryContext.Provider value={value}>{children}</SalaryContext.Provider>;
}

export function useSalary() {
    const context = useContext(SalaryContext);
    if (context === undefined) {
        throw new Error('useSalary must be used within a SalaryProvider');
    }
    return context;
}
