import React, { useState } from 'react';
import { useSalary } from '../context/SalaryContext';
import { X, Trash2, Save } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

export function EntryModal({ date, onClose }: { date: string, onClose: () => void }) {
    const { getEntry, saveEntry, deleteEntry, userSettings } = useSalary();
    const existingEntry = getEntry(date);

    const [formData, setFormData] = useState({
        dailyWage: existingEntry?.dailyWage ?? userSettings.defaultWage,
        shiftHours: existingEntry?.shiftHours ?? userSettings.defaultShiftHours,
        actualHours: existingEntry?.actualHours ?? userSettings.defaultShiftHours,
        overtimeMultiplier: existingEntry?.overtimeMultiplier ?? 1.5,
        notes: existingEntry?.notes ?? '',
    });

    // Calculate dynamic overtime if actual hours exceed shift hours
    const overtimeHours = formData.actualHours > formData.shiftHours
        ? formData.actualHours - formData.shiftHours
        : 0;

    // Calculate live overtime pay
    const hourlyRate = formData.dailyWage / formData.shiftHours;
    // Defaulting to 1.5x multiplier in the background since we removed the select, or we can just use 1.0x if they literally just want the raw amount. Let's use 1.5x as standard if not specified, but the context stores it.
    const overtimePay = overtimeHours * hourlyRate * formData.overtimeMultiplier;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        saveEntry({
            date,
            dailyWage: Number(formData.dailyWage),
            shiftHours: Number(formData.shiftHours),
            actualHours: Number(formData.actualHours),
            overtimeHours,
            overtimeMultiplier: Number(formData.overtimeMultiplier),
            notes: formData.notes
        });

        onClose();
    };

    const handleDelete = () => {
        deleteEntry(date);
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const inputClassName = "w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-sm focus:border-[#00f3ff] focus:shadow-[0_0_10px_rgba(0,243,255,0.2)] outline-none transition-all text-white font-mono text-sm [color-scheme:dark] !text-white";
    const labelClassName = "text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1 block";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="stitch-card w-full max-w-md overflow-hidden relative"
            >
                {/* Decorative top border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-cyan-purple"></div>

                <div className="px-6 py-4 border-b border-dashed border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-sm font-bold tracking-widest uppercase font-sans text-white">
                        Log Entry <span className="text-[#00f3ff] ml-2">{format(parseISO(date), 'MMM dd, yyyy')}</span>
                    </h2>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-sm hover:bg-white/10 transition-colors border border-transparent hover:border-white/20">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 relative">
                    {/* Background decorative blob inside modal */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00f3ff]/5 rounded-full blur-[60px] pointer-events-none"></div>

                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        <div>
                            <label className={labelClassName}>Daily Wage (₹)</label>
                            <input
                                type="number"
                                name="dailyWage"
                                value={formData.dailyWage}
                                onChange={handleChange}
                                required
                                min="0"
                                className={inputClassName}
                            />
                        </div>
                        <div>
                            <label className={labelClassName}>Shift Hours</label>
                            <input
                                type="number"
                                name="shiftHours"
                                value={formData.shiftHours}
                                onChange={handleChange}
                                required
                                min="1"
                                step="0.5"
                                className={inputClassName}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        <div>
                            <label className={labelClassName}>Actual Hours</label>
                            <input
                                type="number"
                                name="actualHours"
                                value={formData.actualHours}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.5"
                                className={`${inputClassName} ${overtimeHours > 0 ? '!border-[#bc13fe] focus:!shadow-[0_0_10px_rgba(188,19,254,0.2)]' : ''}`}
                            />
                        </div>
                        <div>
                            <label className={labelClassName}>Calculated Overtime (₹)</label>
                            <div className={`${inputClassName} bg-[#0A0A0A] border-dashed border-white/5 text-gray-500 cursor-not-allowed flex items-center`}>
                                {overtimePay > 0 ? `+ ₹${overtimePay.toFixed(2)}` : '₹0.00'}
                            </div>
                        </div>
                    </div>

                    {overtimeHours > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-[#bc13fe]/10 border border-[#bc13fe]/30 text-[#bc13fe] p-3 rounded-sm text-xs font-mono flex items-center justify-between"
                        >
                            <span>Overtime Detected</span>
                            <span className="font-bold">+{overtimeHours} HRS</span>
                        </motion.div>
                    )}

                    <div className="relative z-10">
                        <label className={labelClassName}>Protocol Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={2}
                            placeholder="// optional context..."
                            className={`${inputClassName} resize-none placeholder-gray-600`}
                        />
                    </div>

                    <div className="pt-4 flex gap-3 relative z-10 border-t border-dashed border-white/10 mt-6 pt-6">
                        {existingEntry && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2 flex items-center justify-center gap-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-sm text-xs font-bold tracking-widest uppercase transition-colors"
                            >
                                <Trash2 className="w-4 h-4" /> Purge
                            </button>
                        )}
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 flex items-center justify-center gap-2 bg-white text-[#050505] hover:bg-[#00f3ff] hover:shadow-[0_0_15px_rgba(0,243,255,0.4)] rounded-sm text-xs font-bold tracking-widest uppercase transition-all"
                        >
                            <Save className="w-4 h-4" /> Initialize
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
