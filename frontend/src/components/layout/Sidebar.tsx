
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  CheckCircle,
  BarChart3,
  ShieldCheck,
  Settings,
  History,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const sidebarGroups = [
  {
    title: "Main",
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
      { icon: FileText, label: 'Documents', to: '/documents' },
    ]
  },
  {
    title: "Analysis",
    items: [
      { icon: CheckCircle, label: 'Validations', to: '/validations' },
      { icon: BarChart3, label: 'Analytics', to: '/analytics' },
      { icon: ShieldCheck, label: 'Compliance', to: '/compliance' },
    ]
  },
  {
    title: "System",
    items: [
      { icon: History, label: 'Versions', to: '/versions' },
      { icon: Settings, label: 'Settings', to: '/settings' },
    ]
  }
];

export const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-black/40 backdrop-blur-xl border-r border-white/5 hidden md:flex flex-col fixed left-0 top-0 z-40">
      <div className="p-8">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <ShieldCheck className="text-black h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Sheet<span className="text-gray-400">Sense</span>
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto">
        {sidebarGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            <p className="px-4 text-[10px] font-semibold uppercase tracking-widest text-white/30">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group",
                      isActive
                        ? "bg-white/10 text-white shadow-lg border border-white/10"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center font-medium text-sm">
                        <item.icon className={cn("mr-3 h-[18px] w-[18px] transition-colors", isActive ? "text-white" : "text-white/40 group-hover:text-white")} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <motion.div layoutId="activeNav" className="w-1 h-1 bg-white rounded-full" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-white/5">
        <button className="flex items-center w-full px-4 py-3 rounded-2xl text-white/50 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 font-medium text-sm group">
          <LogOut className="mr-3 h-[18px] w-[18px] group-hover:rotate-12 transition-transform" />
          <span>Exit System</span>
        </button>
      </div>
    </aside>
  );
};

