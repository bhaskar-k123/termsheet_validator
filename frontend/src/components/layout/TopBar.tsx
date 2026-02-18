
import { Bell, Search } from 'lucide-react';

export const TopBar = () => {
    return (
        <header className="h-20 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30">
            <div className="flex items-center w-full max-w-lg group">
                <div className="relative w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition-colors group-focus-within:text-white" />
                    <input
                        type="text"
                        placeholder="Search repository index..."
                        className="w-full bg-white/5 border border-white/10 h-12 pl-12 pr-6 text-sm rounded-2xl focus:border-white/20 focus:outline-none focus:bg-white/10 transition-all duration-300 placeholder:text-white/20 text-white"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative p-3 rounded-2xl hover:bg-white/5 transition-all duration-300 group">
                    <Bell className="h-5 w-5 text-white/60 group-hover:text-white transition-colors" />
                    <span className="absolute top-3 right-3 h-2 w-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></span>
                </button>

                <div className="h-8 w-px bg-white/10 mx-2"></div>

                <div className="flex items-center gap-4 p-1.5 pr-4 rounded-3xl hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="h-10 w-10 bg-gradient-to-br from-white to-gray-400 rounded-2xl flex items-center justify-center text-black font-bold text-xs shadow-lg transition-transform duration-300 group-hover:scale-105">
                        AU
                    </div>
                    <div className="hidden lg:flex flex-col items-start leading-tight">
                        <span className="text-sm font-semibold text-white">Admin User</span>
                        <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Risk Analyst</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

