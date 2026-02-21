import React, { useState } from 'react';
import { Menu } from 'lucide-react';

// Importações dos componentes
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import Agenda from './pages/Agenda';
import Financeiro from './pages/Financeiro';
import Estoque from './pages/Estoque';
import Profissionais from './pages/Profissionais';
import Login from './pages/Login'; // <-- 1. IMPORTAÇÃO AQUI

export default function App() {
  const [autenticado, setAutenticado] = useState(false); // <-- 2. NOVO ESTADO AQUI
  const [menuAtivo, setMenuAtivo] = useState('dashboard');
  const [menuAberto, setMenuAberto] = useState(false);

  const pacientes = [
    { id: 1, nome: 'Ana Silva', whatsapp: '(11) 98765-4321', ultimaVisita: '15/02/2026', status: 'Ativo' },
    { id: 2, nome: 'Beatriz Costa', whatsapp: '(11) 91234-5678', ultimaVisita: '10/01/2026', status: 'Inativo' },
  ];

  // <-- 3. A TRAVA DE SEGURANÇA FICA AQUI
  if (!autenticado) {
    return <Login onLogin={() => setAutenticado(true)} />;
  }

  // A partir daqui, o código continua exatamente igual ao que você já tem...
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative font-sans">
      <Sidebar 
        menuAtivo={menuAtivo} 
        setMenuAtivo={setMenuAtivo} 
        menuAberto={menuAberto} 
        setMenuAberto={setMenuAberto} 
      />
      
      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden z-0">

        {/* HEADER MOBILE (Só aparece em telas pequenas) */}
        <header className="md:hidden bg-white h-16 border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-slate-800 text-lg">Clínica CRM</span>
          </div>
          <button
            onClick={() => setMenuAberto(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* ROTEAMENTO DAS PÁGINAS */}
        <main className="flex-1 overflow-y-auto w-full">
          {menuAtivo === 'dashboard' && <Dashboard />}
          {menuAtivo === 'profissionais' && <Profissionais />}
          {menuAtivo === 'agenda' && <Agenda pacientes={pacientes} />}
          {menuAtivo === 'clientes' && <Pacientes pacientes={pacientes} />}
          {menuAtivo === 'financeiro' && <Financeiro />}
          {menuAtivo === 'estoque' && <Estoque />}
        </main>

      </div>
    </div>
  );
}