import React, { useMemo } from 'react';
import { useSalary } from '../context/SalaryContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { startOfMonth, endOfMonth, eachWeekOfInterval, isSameMonth, parseISO, isWithinInterval } from 'date-fns';
import { IndianRupee, Clock, CalendarIcon, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export function DashboardStats({ currentMonth }: { currentMonth: Date }) {
    const { entries, getMonthlyStats } = useSalary();
    const stats = useMemo(() => getMonthlyStats(currentMonth), [entries, currentMonth, getMonthlyStats]);

    const weeklyData = useMemo(() => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });

        return weeks.map((weekStart, i) => {
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);

            let workedHours = 0;
            let overTime = 0;

            Object.values(entries).forEach(entry => {
                const entryDate = parseISO(entry.date);
                if (isWithinInterval(entryDate, { start: weekStart, end: weekEnd }) && isSameMonth(entryDate, currentMonth)) {
                    workedHours += entry.actualHours;
                    overTime += entry.overtimeHours;
                }
            });

            return {
                name: `W${i + 1}`,
                worked: workedHours,
                overtime: overTime,
            };
        });
    }, [entries, currentMonth]);

    const expectedSalary = stats.totalBaseSalary + stats.totalOvertimePay;
    const targetSalary = 50000; // Example target, could be from user settings
    const progressPercent = Math.min((expectedSalary / targetSalary) * 100, 100);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Final Salary"
                    value={`₹${stats.finalTotalSalary.toLocaleString()}`}
                    icon={<div className="text-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.4)] bg-neon-cyan/10 p-2 rounded-sm border border-neon-cyan/20"><IndianRupee className="w-5 h-5" /></div>}
                    delay={0.1}
                />
                <StatCard
                    title="Total Worked"
                    value={`${stats.totalActualHours}h`}
                    subtitle={`${stats.totalWorkingDays} days`}
                    icon={<div className="text-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.4)] bg-neon-cyan/10 p-2 rounded-sm border border-neon-cyan/20"><Clock className="w-5 h-5" /></div>}
                    delay={0.2}
                />
                <StatCard
                    title="Overtime"
                    value={`${stats.totalOvertimeHours}h`}
                    subtitle={`₹${stats.totalOvertimePay.toLocaleString()}`}
                    icon={<div className="text-neon-purple shadow-[0_0_15px_rgba(188,19,254,0.4)] bg-neon-purple/10 p-2 rounded-sm border border-neon-purple/20"><Activity className="w-5 h-5" /></div>}
                    delay={0.3}
                />
                <StatCard
                    title="Leave Days"
                    value={`${stats.totalLeaveDays}d`}
                    icon={<div className="text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] bg-red-500/10 p-2 rounded-sm border border-red-500/20"><CalendarIcon className="w-5 h-5" /></div>}
                    delay={0.4}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="lg:col-span-2 stitch-card p-6"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold font-sans tracking-widest uppercase text-gray-300">Trend Matrix</h3>
                        <div className="px-2 py-0.5 border border-white/10 rounded-sm bg-white/5 text-[9px] text-gray-400 uppercase tracking-widest">
                            Live
                        </div>
                    </div>

                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData}>
                                <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    contentStyle={{ backgroundColor: '#141414', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Bar dataKey="worked" fill="#00f3ff" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="overtime" fill="#bc13fe" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="stitch-card p-6 flex flex-col justify-between"
                >
                    <div>
                        <h3 className="text-sm font-bold font-sans tracking-widest uppercase text-gray-300 mb-2">Cycle Projection</h3>
                        <p className="text-xs text-gray-500 mb-8 border-b border-dashed border-white/10 pb-4">Target: ₹{targetSalary.toLocaleString()}</p>

                        <div className="relative pt-1">
                            <div className="flex mb-3 items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold inline-block py-1 px-2 uppercase rounded-sm text-neon-cyan border border-neon-cyan/30 bg-neon-cyan/10 shadow-[0_0_8px_rgba(0,243,255,0.2)]">
                                        {progressPercent.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-sm bg-white/5 border border-white/10">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 1, delay: 0.8 }}
                                    className="shadow-[0_0_10px_rgba(0,243,255,0.6)] flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-cyan-purple"
                                ></motion.div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 text-[10px] text-gray-500 uppercase tracking-widest border border-dashed border-white/10 p-2 text-center rounded-sm">
                        Based on synced logs
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function StatCard({ title, value, subtitle, icon, delay }: { title: string, value: string, subtitle?: string, icon: React.ReactNode, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay }}
            className="stitch-card p-5 flex items-center justify-between hover:border-white/20 transition-colors group"
        >
            <div>
                <p className="text-[10px] tracking-widest uppercase font-bold text-gray-500 mb-1">{title}</p>
                <p className="text-xl font-bold font-sans text-white group-hover:text-neon-cyan transition-colors">{value}</p>
                {subtitle && <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">{subtitle}</p>}
            </div>
            <div className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                {icon}
            </div>
        </motion.div>
    )
}
