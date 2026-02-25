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
import Login from './pages/Login'; 
import Procedimentos from './pages/Procedimentos';
import Usuarios from './pages/Usuarios';

// Importa o Contexto de Autenticação
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Criamos um componente interno que "consome" o contexto
function MainApp() {
  const { logado, carregando } = useAuth();
  const [menuAtivo, setMenuAtivo] = useState('dashboard');
  const [menuAberto, setMenuAberto] = useState(false);

  // Evita a tela piscar enquanto lê o localStorage
  if (carregando) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Carregando sistema...</div>;
  }

  // TRAVA DE SEGURANÇA REAL BASEADA NO TOKEN JWT
  if (!logado) {
    return <Login />; // O AuthContext cuida de fazer o login e mudar o estado 'logado'
  }

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

        {/* HEADER MOBILE */}
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
          {menuAtivo === 'agenda' && <Agenda />}
          {menuAtivo === 'clientes' && <Pacientes />}
          {menuAtivo === 'financeiro' && <Financeiro />}
          {menuAtivo === 'estoque' && <Estoque />}
          {menuAtivo === 'procedimentos' && <Procedimentos />}
          {menuAtivo === 'usuarios' && <Usuarios />}
        </main>
      </div>
    </div>
  );
}

// Envelopa o App no provedor para liberar o uso do useAuth lá dentro
export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}