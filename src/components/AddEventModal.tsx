import React, { useState } from 'react';
import { useSalary } from '../context/SalaryContext';
import { X, Trash2, Save } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { EventCategory, PlannedEvent } from '../utils/calculations';

interface AddEventModalProps {
    date: string;
    onClose: () => void;
    existingEvent?: PlannedEvent;
}

export function AddEventModal({ date, onClose, existingEvent }: AddEventModalProps) {
    const { savePlannedEvent, deletePlannedEvent } = useSalary();

    const [formData, setFormData] = useState({
        title: existingEvent?.title || '',
        category: existingEvent?.category || 'primary' as EventCategory,
    });

    const categoryColors = {
        primary: 'bg-[#bc13fe]/20 text-[#bc13fe] border-[#bc13fe]/30',
        success: 'bg-[#00ffd1]/20 text-[#00ffd1] border-[#00ffd1]/30',
        danger: 'bg-[#ff2a2a]/20 text-[#ff2a2a] border-[#ff2a2a]/30',
        info: 'bg-[#00f3ff]/20 text-[#00f3ff] border-[#00f3ff]/30',
        warning: 'bg-[#ffd700]/20 text-[#ffd700] border-[#ffd700]/30',
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        savePlannedEvent({
            id: existingEvent?.id || Date.now().toString(),
            date,
            title: formData.title,
            category: formData.category,
        });

        onClose();
    };

    const handleDelete = () => {
        if (existingEvent) {
            deletePlannedEvent(existingEvent.id, date);
        }
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-cyan-purple"></div>

                <div className="px-6 py-4 border-b border-dashed border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-sm font-bold tracking-widest uppercase font-sans text-white">
                        {existingEvent ? 'Edit Event' : 'Add Event'} <span className="text-[#00f3ff] ml-2">{format(parseISO(date), 'MMM dd, yyyy')}</span>
                    </h2>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-sm hover:bg-white/10 transition-colors border border-transparent hover:border-white/20">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00f3ff]/5 rounded-full blur-[60px] pointer-events-none"></div>

                    <div className="relative z-10 space-y-4">
                        <div>
                            <label className={labelClassName}>Event Name</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="Meeting, Shift, Leave..."
                                className={inputClassName}
                            />
                        </div>
                        <div>
                            <label className={labelClassName}>Category</label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {(Object.keys(categoryColors) as EventCategory[]).map(cat => (
                                    <label
                                        key={cat}
                                        className={`flex items-center gap-2 p-2 rounded-sm border cursor-pointer transition-all uppercase tracking-widest text-[10px] font-bold ${formData.category === cat
                                                ? categoryColors[cat]
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="category"
                                            value={cat}
                                            checked={formData.category === cat}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <div className={`w-2 h-2 rounded-sm ${formData.category === cat ? 'bg-current shadow-[0_0_8px_currentColor]' : 'bg-gray-600'}`}></div>
                                        {cat}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3 relative z-10 border-t border-dashed border-white/10 mt-6 pt-6">
                        {existingEvent && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2 flex items-center justify-center gap-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-sm text-xs font-bold tracking-widest uppercase transition-colors"
                            >
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                        )}
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 flex items-center justify-center gap-2 bg-white text-[#050505] hover:bg-[#00f3ff] hover:shadow-[0_0_15px_rgba(0,243,255,0.4)] rounded-sm text-xs font-bold tracking-widest uppercase transition-all"
                        >
                            <Save className="w-4 h-4" /> Save Event
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
