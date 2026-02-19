// src/components/Sidebar.jsx
import React from 'react';
import { LayoutDashboard, Calendar as CalendarIcon, Users, Settings, LogOut, DollarSign, Package } from 'lucide-react';

export default function Sidebar({ menuAtivo, setMenuAtivo }) {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col transition-all z-10 h-full">
      <div className="h-20 flex items-center px-6 border-b border-slate-800">
        <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold text-lg">C</span>
        </div>
        <span className="text-white font-semibold text-lg tracking-wide">Clínica CRM</span>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        <button
          onClick={() => setMenuAtivo('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${menuAtivo === 'dashboard' ? 'bg-rose-500/10 text-rose-400' : 'hover:bg-slate-800 hover:text-white'}`}
        >
          <LayoutDashboard size={20} />
          <span className="font-medium">Dashboard</span>
        </button>

        <button
          onClick={() => setMenuAtivo('agenda')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${menuAtivo === 'agenda' ? 'bg-rose-500/10 text-rose-400' : 'hover:bg-slate-800 hover:text-white'}`}
        >
          <CalendarIcon size={20} />
          <span className="font-medium">Agenda</span>
        </button>

        <button
          onClick={() => setMenuAtivo('clientes')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${menuAtivo === 'clientes' ? 'bg-rose-500/10 text-rose-400' : 'hover:bg-slate-800 hover:text-white'}`}
        >
          <Users size={20} />
          <span className="font-medium">Pacientes</span>
        </button>

        <button
          onClick={() => setMenuAtivo('financeiro')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${menuAtivo === 'financeiro' ? 'bg-rose-500/10 text-rose-400' : 'hover:bg-slate-800 hover:text-white'}`}
        >
          <DollarSign size={20} />
          <span className="font-medium">Financeiro</span>
        </button>

        <button
          onClick={() => setMenuAtivo('estoque')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${menuAtivo === 'estoque' ? 'bg-rose-500/10 text-rose-400' : 'hover:bg-slate-800 hover:text-white'}`}
        >
          <Package size={20} />
          <span className="font-medium">Estoque</span>
        </button>
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm">
          <Settings size={18} />
          Ajustes
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 hover:text-rose-400 transition-colors text-sm">
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}