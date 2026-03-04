export type EventCategory = 'primary' | 'success' | 'danger' | 'info' | 'warning';

export interface PlannedEvent {
    id: string;
    date: string;
    title: string;
    category: EventCategory;
}

export interface DailyEntry {
    date: string; // YYYY-MM-DD format
    dailyWage: number;
    shiftHours: number;
    actualHours: number;
    overtimeHours: number;
    overtimeMultiplier: number;
    notes: string;
    tags?: string[];
}

export const PREDEFINED_TAGS = [
    'WFH',
    'Office',
    'Sick Leave',
    'Holiday',
    'Overtime',
    'Important'
];

export interface MonthlyStats {
    totalWorkingDays: number;
    totalLeaveDays: number;
    totalShiftHours: number;
    totalActualHours: number;
    totalOvertimeHours: number;
    totalBaseSalary: number;
    totalOvertimePay: number;
    finalTotalSalary: number;
}

export function calculateDailySalary(entry: DailyEntry): { base: number; overtime: number; total: number } {
    const hourlyRate = entry.dailyWage / entry.shiftHours;
    const basePay = (entry.dailyWage / entry.shiftHours) * Math.min(entry.actualHours, entry.shiftHours);
    const overtimePay = entry.overtimeHours * hourlyRate * entry.overtimeMultiplier;

    return {
        base: basePay,
        overtime: overtimePay,
        total: basePay + overtimePay
    };
}

export function calculateMonthlyStats(entries: DailyEntry[], daysInMonth: number): MonthlyStats {
    const stats: MonthlyStats = {
        totalWorkingDays: 0,
        totalLeaveDays: daysInMonth - entries.length,
        totalShiftHours: 0,
        totalActualHours: 0,
        totalOvertimeHours: 0,
        totalBaseSalary: 0,
        totalOvertimePay: 0,
        finalTotalSalary: 0,
    };

    entries.forEach(entry => {
        stats.totalWorkingDays += 1;
        stats.totalShiftHours += entry.shiftHours;
        stats.totalActualHours += entry.actualHours;
        stats.totalOvertimeHours += entry.overtimeHours;

        const { base, overtime, total } = calculateDailySalary(entry);
        stats.totalBaseSalary += base;
        stats.totalOvertimePay += overtime;
        stats.finalTotalSalary += total;
    });

    return stats;
}

export function calculateYearlyStats(entries: DailyEntry[], year: number): MonthlyStats {
    const stats: MonthlyStats = {
        totalWorkingDays: 0,
        totalLeaveDays: 0, // Hard to define for a full year without a schedule
        totalShiftHours: 0,
        totalActualHours: 0,
        totalOvertimeHours: 0,
        totalBaseSalary: 0,
        totalOvertimePay: 0,
        finalTotalSalary: 0,
    };

    entries.forEach(entry => {
        if (entry.date.startsWith(`${year}-`)) {
            stats.totalWorkingDays += 1;
            stats.totalShiftHours += entry.shiftHours;
            stats.totalActualHours += entry.actualHours;
            stats.totalOvertimeHours += entry.overtimeHours;

            const { base, overtime, total } = calculateDailySalary(entry);
            stats.totalBaseSalary += base;
            stats.totalOvertimePay += overtime;
            stats.finalTotalSalary += total;
        }
    });

    return stats;
}
