import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { LayoutDashboard, Calendar as CalendarIcon, Users, Settings, LogOut, DollarSign, Package, X, Stethoscope, Lock, Key, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar({ menuAtivo, setMenuAtivo, menuAberto, setMenuAberto }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const { usuario, token, logout } = useAuth();

  // --- ESTADOS DO MODAL DE SENHA ---
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [enviando, setEnviando] = useState(false);

  const navegarPara = (menu) => {
    setMenuAtivo(menu);
    setMenuAberto(false);
  };

  const handleTrocarSenha = async (e) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) return alert("As senhas não conferem!");
    if (novaSenha.length < 4) return alert("A senha deve ter pelo menos 4 caracteres.");
    
    setEnviando(true);
    try {
      const res = await fetch(`${API_URL}/usuarios/${usuario.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
            nome: usuario.nome,
            username: usuario.username,
            senha: novaSenha 
        })
      });

      if (res.ok) {
        alert("Senha alterada com sucesso!");
        setModalSenhaAberto(false);
        setNovaSenha('');
        setConfirmarSenha('');
      } else {
        alert("Erro ao alterar senha.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  if (!usuario) return null;
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
          {permissoes.includes('dashboard') && (
            <button onClick={() => navegarPara('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${menuAtivo === 'dashboard' ? 'bg-rose-500/10 text-rose-400' : 'hover:bg-slate-800 hover:text-white'}`}>
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard</span>
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

        <div className="p-4 border-t border-slate-800 space-y-1">
          <div className="px-4 py-2 text-sm text-slate-400 font-medium truncate">
            Olá, {usuario.nome.split(' ')[0]}!
          </div>
          
          {/* BOTÃO TROCAR SENHA */}
          <button 
            onClick={() => setModalSenhaAberto(true)}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors text-xs"
          >
            <Lock size={14} /> Trocar Senha
          </button>

          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 hover:text-rose-400 transition-colors text-sm">
            <LogOut size={18} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* MODAL DE TROCA DE SENHA VIA PORTAL */}
      {modalSenhaAberto && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Key size={20} className="text-rose-600"/> Alterar Senha
              </h2>
              <button onClick={() => setModalSenhaAberto(false)} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
            </div>

            <form onSubmit={handleTrocarSenha} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nova Senha</label>
                <input 
                  type="password" 
                  value={novaSenha} 
                  onChange={e => setNovaSenha(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400"
                  placeholder="Mínimo 4 caracteres"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Confirmar Nova Senha</label>
                <input 
                  type="password" 
                  value={confirmarSenha} 
                  onChange={e => setConfirmarSenha(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400"
                  placeholder="Repita a senha"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalSenhaAberto(false)} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition-colors">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={enviando}
                  className="flex-1 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black shadow-md flex items-center justify-center gap-2 text-sm transition-all"
                >
                  {enviando ? 'Salvando...' : <><Save size={16}/> Atualizar</>}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}