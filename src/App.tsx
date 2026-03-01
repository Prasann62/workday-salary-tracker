import React, { useState } from 'react';
import { Calendar } from './components/Calendar';
import { DashboardStats } from './components/DashboardStats';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { addMonths, subMonths, format } from 'date-fns';
import { FutureCalendar } from './components/FutureCalendar';

function App() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [activeTab, setActiveTab] = useState<'dashboard' | 'planning'>('dashboard');

    const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
    const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

    return (
        <div className="relative min-h-screen bg-void text-white overflow-hidden font-mono z-0 pb-16">

            {/* Ambient Stitch UI Glow Blobs */}
            <div className="bg-glow-purple absolute -top-40 -left-40 w-96 h-96 rounded-full pointer-events-none -z-10"></div>
            <div className="bg-glow-cyan absolute top-40 -right-20 w-[30rem] h-[30rem] rounded-full pointer-events-none -z-10 opacity-60"></div>

            <header className="sticky top-0 z-40 bg-void/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-sm bg-surface-solid border border-neon-cyan flex items-center justify-center shadow-[0_0_10px_rgba(0,243,255,0.4)]">
                            <span className="text-neon-cyan font-bold text-lg font-sans">₹</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-widest uppercase font-sans text-gradient">WorkDay</h1>
                    </div>

                    <div className="hidden md:flex bg-white/5 p-1 rounded-sm border border-white/10 absolute left-1/2 -translate-x-1/2">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-6 py-1.5 text-xs font-bold tracking-widest uppercase transition-colors rounded-sm ${activeTab === 'dashboard' ? 'bg-[#00f3ff] text-[#050505] shadow-[0_0_10px_rgba(0,243,255,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('planning')}
                            className={`px-6 py-1.5 text-xs font-bold tracking-widest uppercase transition-colors rounded-sm ${activeTab === 'planning' ? 'bg-[#bc13fe] text-white shadow-[0_0_10px_rgba(188,19,254,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Planning
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-white rounded hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className={`mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 mt-4 ${activeTab === 'planning' ? 'w-full max-w-[1600px] h-[calc(100vh-8rem)]' : 'max-w-6xl'}`}>

                {activeTab === 'dashboard' ? (
                    <>
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between stitch-card p-4">
                            <button
                                onClick={handlePrevMonth}
                                className="p-2 flex items-center gap-2 hover:bg-white/5 rounded-sm transition-colors text-gray-300 font-bold tracking-widest uppercase text-xs"
                            >
                                <ChevronLeft className="w-4 h-4 text-neon-cyan" />
                                <span className="hidden sm:inline">Prev Month</span>
                            </button>
                            <h2 className="text-xl font-bold font-sans text-white tracking-widest uppercase drop-shadow-md">
                                {format(currentMonth, 'MMMM yyyy')}
                            </h2>
                            <button
                                onClick={handleNextMonth}
                                className="p-2 flex items-center gap-2 hover:bg-white/5 rounded-sm transition-colors text-gray-300 font-bold tracking-widest uppercase text-xs"
                            >
                                <span className="hidden sm:inline">Next Month</span>
                                <ChevronRight className="w-4 h-4 text-neon-cyan" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                            <div className="xl:col-span-1 stitch-card p-4">
                                <Calendar currentMonth={currentMonth} />

                                <div className="mt-6 flex gap-4 text-[10px] uppercase font-bold tracking-widest justify-center text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-sm bg-neon-cyan shadow-[0_0_8px_rgba(0,243,255,0.8)]"></div>
                                        <span>Worked</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-sm bg-neon-purple shadow-[0_0_8px_rgba(188,19,254,0.8)]"></div>
                                        <span>Overtime</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-sm bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                                        <span>Leave</span>
                                    </div>
                                </div>
                            </div>

                            <div className="xl:col-span-2">
                                <DashboardStats currentMonth={currentMonth} />
                            </div>
                        </div>
                    </>
                ) : (
                    <FutureCalendar />
                )}

            </main>
        </div>
    );
}

export default App;
