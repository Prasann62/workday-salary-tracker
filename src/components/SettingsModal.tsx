import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Upload, FileText, Table } from 'lucide-react';

export function SettingsModal({ onClose }: { onClose: () => void }) {
    const [exportStartDate, setExportStartDate] = useState(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    );
    const [exportEndDate, setExportEndDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    const getFilteredEntries = () => {
        const entries = JSON.parse(localStorage.getItem('salary_entries') || '{}');
        if (!exportStartDate || !exportEndDate) return entries;

        const filtered: any = {};
        Object.keys(entries).forEach(date => {
            if (date >= exportStartDate && date <= exportEndDate) {
                filtered[date] = entries[date];
            }
        });
        return filtered;
    };

    const handleExportExcel = () => {
        const entries = getFilteredEntries();
        let tableHtml = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8" />
                <style>
                    table { border-collapse: collapse; }
                    th, td { border: 1px solid #dddddd; padding: 6px; }
                    th { font-weight: bold; background-color: #f2f2f2; text-align: left; }
                </style>
            </head>
            <body>
            <table>
                <thead>
                    <tr>
                        <th style="width: 120px;">Date</th>
                        <th style="width: 100px;">Daily Wage</th>
                        <th style="width: 100px;">Shift Hours</th>
                        <th style="width: 100px;">Actual Hours</th>
                        <th style="width: 100px;">Overtime</th>
                        <th style="width: 150px;">Overtime Multiplier</th>
                        <th style="width: 250px;">Notes</th>
                        <th style="width: 150px;">Tags</th>
                    </tr>
                </thead>
                <tbody>
        `;

        Object.values(entries).forEach((entry: any) => {
            tableHtml += `
                <tr>
                    <td>${entry.date}</td>
                    <td>${entry.dailyWage}</td>
                    <td>${entry.shiftHours}</td>
                    <td>${entry.actualHours}</td>
                    <td>${entry.overtimeHours}</td>
                    <td>${entry.overtimeMultiplier}</td>
                    <td>${(entry.notes || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
                    <td>${(entry.tags || []).join(', ').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
                </tr>
            `;
        });

        tableHtml += `
                </tbody>
            </table>
            </body>
            </html>
        `;

        const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workday_backup_${new Date().toISOString().split('T')[0]}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportTXT = () => {
        const entries = getFilteredEntries();
        let textContent = `WorkDay Salary Tracker Backup\nDate: ${new Date().toISOString().split('T')[0]} \n\n`;

        Object.values(entries).forEach((entry: any) => {
            textContent += `-- - ${entry.date} ---\n`;
            textContent += `Worked: ${entry.actualHours} h / ${entry.shiftHours} h\n`;
            textContent += `Overtime: ${entry.overtimeHours} h\n`;
            if (entry.notes) textContent += `Notes: ${entry.notes} \n`;
            if (entry.tags && entry.tags.length > 0) textContent += `Tags: ${entry.tags.join(', ')} \n`;
            textContent += `\n`;
        });

        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workday_backup_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExport = () => {
        const data = {
            entries: getFilteredEntries(),
            plannedEvents: JSON.parse(localStorage.getItem('salary_planned_events') || '{}'),
            userSettings: JSON.parse(localStorage.getItem('user_settings') || '{}')
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workday_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (data.entries) localStorage.setItem('salary_entries', JSON.stringify(data.entries));
                if (data.plannedEvents) localStorage.setItem('salary_planned_events', JSON.stringify(data.plannedEvents));
                if (data.userSettings) localStorage.setItem('user_settings', JSON.stringify(data.userSettings));

                alert('Data successfully imported! The application will now reload.');
                window.location.reload();
            } catch (error) {
                alert('Invalid backup file.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="stitch-card w-full max-w-sm overflow-hidden relative"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-cyan-purple"></div>

                <div className="px-6 py-4 border-b border-dashed border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-sm font-bold tracking-widest uppercase font-sans text-white">
                        Settings & Data
                    </h2>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-sm hover:bg-white/10 transition-colors border border-transparent hover:border-white/20">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-3">Backup Data</h3>
                        <p className="text-xs text-gray-400 mb-4">Export your salary and schedule data as a JSON file to keep it safe or move between devices.</p>

                        <div className="flex gap-2 mb-4">
                            <div className="flex-1">
                                <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Start Date</label>
                                <input
                                    type="date"
                                    value={exportStartDate}
                                    onChange={(e) => setExportStartDate(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-sm px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00f3ff]/50 focus:ring-1 focus:ring-[#00f3ff]/50 transition-all font-mono"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">End Date</label>
                                <input
                                    type="date"
                                    value={exportEndDate}
                                    onChange={(e) => setExportEndDate(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-sm px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00f3ff]/50 focus:ring-1 focus:ring-[#00f3ff]/50 transition-all font-mono"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleExport}
                                className="w-full px-4 py-2 flex items-center justify-center gap-2 bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/30 hover:bg-[#00f3ff]/20 hover:shadow-[0_0_15px_rgba(0,243,255,0.2)] rounded-sm text-xs font-bold tracking-widest uppercase transition-all"
                            >
                                <Download className="w-4 h-4" /> Export Backup (JSON)
                            </button>
                            <button
                                onClick={handleExportExcel}
                                className="w-full px-4 py-2 flex items-center justify-center gap-2 bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/30 hover:bg-[#00f3ff]/20 hover:shadow-[0_0_15px_rgba(0,243,255,0.2)] rounded-sm text-xs font-bold tracking-widest uppercase transition-all"
                            >
                                <Table className="w-4 h-4" /> Export Excel (.XLS)
                            </button>
                            <button
                                onClick={handleExportTXT}
                                className="w-full px-4 py-2 flex items-center justify-center gap-2 bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/30 hover:bg-[#00f3ff]/20 hover:shadow-[0_0_15px_rgba(0,243,255,0.2)] rounded-sm text-xs font-bold tracking-widest uppercase transition-all"
                            >
                                <FileText className="w-4 h-4" /> Export Note (.TXT)
                            </button>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-dashed border-white/10">
                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-3">Restore Data</h3>
                        <p className="text-xs text-gray-400 mb-4">Import a previously saved WorkDay JSON backup file. This will overwrite your current data.</p>
                        <label className="w-full px-4 py-2 flex items-center justify-center gap-2 bg-[#bc13fe]/10 text-[#bc13fe] border border-[#bc13fe]/30 hover:bg-[#bc13fe]/20 hover:shadow-[0_0_15px_rgba(188,19,254,0.2)] rounded-sm text-xs font-bold tracking-widest uppercase transition-all cursor-pointer">
                            <Upload className="w-4 h-4" /> Import Backup
                            <input
                                type="file"
                                accept=".json"
                                className="hidden"
                                onChange={handleImport}
                            />
                        </label>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
