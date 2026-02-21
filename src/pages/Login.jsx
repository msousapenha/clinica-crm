import React, { useState } from 'react';
import { Lock, User, ArrowRight } from 'lucide-react'; // Alterado de Mail para User

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState(''); // Estado alterado para usuario
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulação para a apresentação: libertar o acesso se ambos os campos estiverem preenchidos
    if (usuario && senha) {
      onLogin();
    } else {
      setErro(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      {/* Contentor Principal */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-in fade-in zoom-in duration-500">
        
        {/* Cabeçalho do Login */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-rose-500/30">
            <span className="text-white font-bold text-3xl">C</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Clínica CRM</h1>
          <p className="text-slate-500 text-sm mt-1">Instituto Fernanda Rocha</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome de Utilizador</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="text"
                value={usuario}
                onChange={(e) => { setUsuario(e.target.value); setErro(false); }}
                placeholder="Ex: recepcao"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Palavra-passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="password"
                value={senha}
                onChange={(e) => { setSenha(e.target.value); setErro(false); }}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all text-sm"
              />
            </div>
          </div>

          {erro && (
            <p className="text-rose-500 text-sm text-center animate-in slide-in-from-top-1">
              Por favor, preencha o utilizador e a palavra-passe para aceder.
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg mt-4"
          >
            Aceder ao Sistema
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Rodapé de Segurança */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            Acesso restrito. Ambiente protegido.
          </p>
        </div>
      </div>
    </div>
  );
}