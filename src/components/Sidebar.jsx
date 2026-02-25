import React from 'react';
import { LayoutDashboard, Calendar as CalendarIcon, Users, Settings, LogOut, DollarSign, Package, X, Stethoscope } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // <-- IMPORTA O HOOK

export default function Sidebar({ menuAtivo, setMenuAtivo, menuAberto, setMenuAberto }) {
  // Puxa o usuário e a função de deslogar do contexto
  const { usuario, logout } = useAuth();

  const navegarPara = (menu) => {
    setMenuAtivo(menu);
    setMenuAberto(false);
  };

  // Trava de segurança extra: se por acaso o usuário não carregou, não exibe o menu
  if (!usuario) return null;

  // Variável para encurtar a checagem das permissões
  const permissoes = usuario.permissoes || [];

  return (
    <>
      {menuAberto && (
        <div className="fixed inset-0 bg-slate-900/60 z-20 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setMenuAberto(false)} />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 flex flex-col z-30 transform transition-transform duration-300 ease-in-out ${menuAberto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-wide">Clínica CRM</span>
          </div>
          <button onClick={() => setMenuAberto(false)} className="md:hidden text-slate-400 hover:text-white p-1">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {/* CHECAGENS DE PERMISSÃO EM CADA BOTÃO */}
          
          {permissoes.includes('dashboard') && (
            <button onClick={() => navegarPara('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${menuAtivo === 'dashboard' ? 'bg-rose-500/10 text-rose-400' : 'hover:bg-slate-800 hover:text-white'}`}>
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard</span>
            </button>
          )}

          {permissoes.includes('equipe') && (
            <button onClick={() => navegarPara('profissionais')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${menuAtivo === 'profissionais' ? 'bg-rose-500/10 text-rose-400' : 'hover:bg-slate-800 hover:text-white'}`}>
              <Stethoscope size={20} />
              <span className="font-medium">Equipe</span>
            </button>
          )}

          {permissoes.includes('agenda') && (
            <button onClick={() => navegarPara('agenda')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${menuAtivo === 'agenda' ? 'bg-rose-500/10 text-rose-400' : 'hover:bg-slate-800 hover:text-white'}`}>
              <CalendarIcon size={20} />
              <span className="font-medium">Agenda</span>
            </button>
          )}

          {permissoes.includes('pacientes') && (
            <button onClick={() => navegarPara('clientes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${menuAtivo === 'clientes' ? 'bg-rose-500/10 text-rose-400' : 'hover:bg-slate-800 hover:text-white'}`}>
              <Users size={20} />
              <span className="font-medium">Pacientes</span>
            </button>
          )}

          {permissoes.includes('financeiro') && (
            <button onClick={() => navegarPara('financeiro')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${menuAtivo === 'financeiro' ? 'bg-rose-500/10 text-rose-400' : 'hover:bg-slate-800 hover:text-white'}`}>
              <DollarSign size={20} />
              <span className="font-medium">Financeiro</span>
            </button>
          )}

          {permissoes.includes('estoque') && (
            <button onClick={() => navegarPara('estoque')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${menuAtivo === 'estoque' ? 'bg-rose-500/10 text-rose-400' : 'hover:bg-slate-800 hover:text-white'}`}>
              <Package size={20} />
              <span className="font-medium">Estoque</span>
            </button>
          )}

          {permissoes.includes('procedimentos') && (
            <button onClick={() => navegarPara('procedimentos')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${menuAtivo === 'procedimentos' ? 'bg-rose-500/10 text-rose-400' : 'hover:bg-slate-800 hover:text-white'}`}>
              <Package size={20} />
              <span className="font-medium">Procedimentos</span>
            </button>
          )}

          {permissoes.includes('usuarios') && (
            <button onClick={() => navegarPara('usuarios')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${menuAtivo === 'usuarios' ? 'bg-rose-500/10 text-rose-400' : 'hover:bg-slate-800 hover:text-white'}`}>
              <Users size={20} />
              <span className="font-medium">Gestão de Usuários</span>
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          {/* Mostra o nome do usuário logado e o botão de Sair */}
          <div className="px-4 py-2 text-sm text-slate-400 font-medium truncate mb-2">
            Olá, {usuario.nome.split(' ')[0]}!
          </div>
          
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 hover:text-rose-400 transition-colors text-sm">
            <LogOut size={18} /> Sair do Sistema
          </button>
        </div>
      </aside>
    </>
  );
}