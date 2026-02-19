// src/pages/Agenda.jsx
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Select from 'react-select';

// Configuração de tradução do calendário
const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function Agenda({ pacientes }) {
  // --- ESTADOS DA AGENDA E MODAL ---
  const [dataCalendario, setDataCalendario] = useState(new Date(2026, 1, 16)); 
  const [viewCalendario, setViewCalendario] = useState('week');
  const [modalAgendamentoAberto, setModalAgendamentoAberto] = useState(false);
  const [novaDataSelecionada, setNovaDataSelecionada] = useState(new Date());

  // --- DADOS DA AGENDA ---
  const [eventos, setEventos] = useState([
    {
      title: 'Limpeza de Pele - Ana Silva',
      start: new Date(2026, 1, 16, 14, 0),
      end: new Date(2026, 1, 16, 15, 30),
      status: 'confirmado', 
    },
    {
      title: 'Avaliação - Beatriz Costa',
      start: new Date(2026, 1, 17, 10, 0),
      end: new Date(2026, 1, 17, 10, 30),
      status: 'agendado', 
    }
  ]);

  // Formata os pacientes para o React Select
  const opcoesPacientes = pacientes.map(p => ({
    value: p.id,
    label: `${p.nome} - ${p.whatsapp}`
  }));

  // --- FUNÇÕES DE CONTROLE ---
  const eventStyleGetter = (event) => {
    let backgroundColor = '#f59e0b'; // Amarelo (Agendado)
    if (event.status === 'confirmado') {
      backgroundColor = '#10b981'; // Verde
    } else if (event.status === 'faltou') {
      backgroundColor = '#e11d48'; // Vermelho
    } else if (event.status === 'concluido') {
      backgroundColor = '#64748b'; // Cinzento
    }
    return {
      style: { backgroundColor, borderRadius: '6px', opacity: 0.9, color: 'white', border: '0px', display: 'block', padding: '2px 5px', fontSize: '0.85rem' }
    };
  };

  const abrirModalAgendamento = (dataInicio = new Date()) => {
    setNovaDataSelecionada(dataInicio);
    setModalAgendamentoAberto(true);
  };

  const fecharModalAgendamento = () => {
    setModalAgendamentoAberto(false);
  };

  const salvarAgendamento = (e) => {
    e.preventDefault();
    alert("Evento salvo com sucesso!");
    fecharModalAgendamento();
  };

  const selectCustomStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: '#f9fafb',
      borderColor: state.isFocused ? '#fb7185' : '#e5e7eb',
      boxShadow: state.isFocused ? '0 0 0 2px #ffe4e6' : 'none',
      borderRadius: '0.5rem',
      padding: '2px',
      '&:hover': { borderColor: state.isFocused ? '#fb7185' : '#d1d5db' }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#e11d48' : state.isFocused ? '#ffe4e6' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      cursor: 'pointer',
      '&:hover': { backgroundColor: '#ffe4e6', color: '#e11d48' }
    })
  };

  return (
    <>
      {/* TELA DA AGENDA */}
      <div className="p-8 max-w-7xl mx-auto w-full h-full flex flex-col animate-in fade-in duration-300 relative">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-light text-gray-800">Agenda de Atendimentos</h1>
          <button 
            onClick={() => abrirModalAgendamento(new Date())}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg shadow transition-colors"
          >
            <Plus size={20} /> Novo Agendamento
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-[600px]">
          {/* Legenda de Status */}
          <div className="flex items-center gap-6 mb-4 px-2 pb-4 border-b border-gray-100 flex-wrap">
            <span className="text-sm font-medium text-gray-500">Status:</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-sm text-gray-700">Agendado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-sm text-gray-700">Confirmado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-500"></span>
              <span className="text-sm text-gray-700">Concluído</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-600"></span>
              <span className="text-sm text-gray-700">Faltou</span>
            </div>
          </div>

          <Calendar
            localizer={localizer}
            events={eventos}
            startAccessor="start"
            endAccessor="end"
            style={{ flex: 1 }}
            culture="pt-BR"
            date={dataCalendario}
            view={viewCalendario}
            onNavigate={(novaData) => setDataCalendario(novaData)}
            onView={(novaView) => setViewCalendario(novaView)}
            messages={{
              next: "Próximo", previous: "Anterior", today: "Hoje", month: "Mês", week: "Semana", day: "Dia"
            }}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => alert(`Editar: ${event.title}`)}
            onSelectSlot={(slotInfo) => abrirModalAgendamento(slotInfo.start)}
            selectable={true}
            min={new Date(2026, 1, 1, 8, 0)} 
            max={new Date(2026, 1, 1, 20, 0)} 
          />
        </div>
      </div>

      {/* MODAL DE AGENDAMENTO */}
      {modalAgendamentoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 m-4 animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-800">Detalhes do Agendamento</h2>
              <button onClick={fecharModalAgendamento} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={salvarAgendamento} className="space-y-5">
              
              <div style={{ position: 'relative', zIndex: 100 }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
                <Select 
                  options={opcoesPacientes}
                  styles={selectCustomStyles}
                  placeholder="Digite para procurar paciente..."
                  noOptionsMessage={() => "Nenhum paciente encontrado"}
                  isClearable
                  isSearchable
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Procedimento</label>
                    <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all">
                      <option>Limpeza de Pele</option>
                      <option>Toxina Botulínica</option>
                      <option>Microagulhamento</option>
                      <option>Avaliação</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profissional</label>
                    <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all">
                      <option>Dra. Fernanda Rocha</option>
                      <option>Dra. Marina</option>
                    </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                    <input type="date" defaultValue={format(novaDataSelecionada, 'yyyy-MM-dd')} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horário de Início</label>
                    <input type="time" defaultValue={format(novaDataSelecionada, 'HH:mm')} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Inicial</label>
                <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all">
                    <option value="agendado">Agendado (Aguardar Confirmação)</option>
                    <option value="confirmado">Confirmado (Paciente já confirmou)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button type="button" onClick={fecharModalAgendamento} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-rose-600 text-white hover:bg-rose-700 rounded-lg shadow-sm transition-colors font-medium">Salvar Agendamento</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}