import React, { useState } from 'react';

// IMPORTANDO OS NOSSOS COMPONENTES ISOLADOS
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import Agenda from './pages/Agenda';
import Financeiro from './pages/Financeiro';
import Estoque from './pages/Estoque';

export default function App() {
  // Estado que controla qual página está visível
  const [menuAtivo, setMenuAtivo] = useState('agenda');

  // Dados globais partilhados entre as páginas
  const pacientes = [
    { id: 1, nome: 'Ana Silva', whatsapp: '(11) 98765-4321', ultimaVisita: '15/02/2026', status: 'Ativo' },
    { id: 2, nome: 'Beatriz Costa', whatsapp: '(11) 91234-5678', ultimaVisita: '10/01/2026', status: 'Inativo' },
    { id: 3, nome: 'Carla Mendes', whatsapp: '(11) 99999-1111', ultimaVisita: '05/02/2026', status: 'Ativo' },
    { id: 4, nome: 'Daniela Souza', whatsapp: '(11) 98888-2222', ultimaVisita: '20/01/2026', status: 'Ativo' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">

      {/* O MENU LATERAL */}
      <Sidebar menuAtivo={menuAtivo} setMenuAtivo={setMenuAtivo} />

      {/* ÁREA DE CONTEÚDO PRINCIPAL (ROTEAMENTO) */}
      <main className="flex-1 overflow-y-auto z-0">
        {menuAtivo === 'dashboard' && <Dashboard />}
        {menuAtivo === 'agenda' && <Agenda pacientes={pacientes} />}
        {menuAtivo === 'clientes' && <Pacientes pacientes={pacientes} />}
        {menuAtivo === 'financeiro' && <Financeiro />}
        {menuAtivo === 'estoque' && <Estoque />}
      </main>

    </div>
  );
}