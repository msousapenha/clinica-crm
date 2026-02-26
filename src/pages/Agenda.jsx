import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, CalendarDays, List, Download, FileText, Stethoscope, Package, Save, CheckCircle, AlertTriangle, FileSpreadsheet, Briefcase, User, Edit3 } from 'lucide-react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isSameDay, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Select from 'react-select';
import { useAuth } from '../contexts/AuthContext';
import DefaultEditor from 'react-simple-wysiwyg'; 

// Importações para exportação
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function Agenda() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = useAuth();
  
  // --- ESTADOS DE DADOS ---
  const [agendamentos, setAgendamentos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [produtos, setProdutos] = useState([]); 
  const [listaProcedimentos, setListaProcedimentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // --- ESTADOS DE UI ---
  const [abaAtiva, setAbaAtiva] = useState('calendario');
  const [dataCalendario, setDataCalendario] = useState(new Date());
  const [viewCalendario, setViewCalendario] = useState('week');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalRelatorioAberto, setModalRelatorioAberto] = useState(false);

  // --- ESTADOS DO MODAL (FORMULÁRIO) ---
  const [abaModal, setAbaModal] = useState('dados'); // 'dados', 'anamnese' ou 'atendimento'
  const [idEditando, setIdEditando] = useState(null);
  
  // Dados Básicos da Agenda
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [profissionalId, setProfissionalId] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [status, setStatus] = useState('Agendado');

  // Dados do Atendimento (Evolução + Insumos + Procedimentos)
  const [textoEvolucao, setTextoEvolucao] = useState('');
  const [insumosUsados, setInsumosUsados] = useState([]); 
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [qtdInsumo, setQtdInsumo] = useState(1);
  const [procedimentosSelecionados, setProcedimentosSelecionados] = useState([]);

  // Dados da Anamnese
  const [editandoAnamnese, setEditandoAnamnese] = useState(false);
  const [alergias, setAlergias] = useState('');
  const [roacutan, setRoacutan] = useState('Não');
  const [gestanteLactante, setGestanteLactante] = useState('Não');

  // Estados do Relatório
  const [relatorioInicio, setRelatorioInicio] = useState('');
  const [relatorioFim, setRelatorioFim] = useState('');

  // Verifica se o agendamento já foi finalizado
  const isFinalizado = status === 'Concluído' || status === 'Concluido';

  useEffect(() => {
    carregarTudo();
  }, []);

  const carregarTudo = async () => {
    try {
      setCarregando(true);
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [resAg, resPac, resProf, resProd, resProc] = await Promise.all([
        fetch(`${API_URL}/agendamentos`, { headers }),
        fetch(`${API_URL}/pacientes`, { headers }),
        fetch(`${API_URL}/profissionais`, { headers }),
        fetch(`${API_URL}/estoque/produtos`, { headers }),
        fetch(`${API_URL}/procedimentos`, { headers })
      ]);

      if(resAg.ok) setAgendamentos(await resAg.json());
      if(resPac.ok) setPacientes(await resPac.json());
      if(resProf.ok) setProfissionais(await resProf.json());
      if(resProd.ok) setProdutos(await resProd.json());
      
      if(resProc.ok) {
        const dadosProc = await resProc.json();
        setListaProcedimentos(dadosProc.map(p => ({ 
          value: p.id, 
          label: `${p.nome} (R$ ${p.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})` 
        })));
      }
    } catch (erro) { console.error(erro); } finally { setCarregando(false); }
  };

  // --- HANDLERS DO MODAL ---
  const abrirNovo = (start) => {
    setIdEditando(null);
    setPacienteSelecionado(null);
    setProfissionalId('');
    setStatus('Agendado');
    setData(format(start, 'yyyy-MM-dd'));
    setHora(format(start, 'HH:mm'));
    
    // Reset aba atendimento e anamnese
    setTextoEvolucao('');
    setInsumosUsados([]);
    setProcedimentosSelecionados([]);
    setAlergias('');
    setRoacutan('Não');
    setGestanteLactante('Não');
    setEditandoAnamnese(false);
    
    setAbaModal('dados');
    setModalAberto(true);
  };

  const abrirEdicao = async (evento) => {
    const ag = evento.resource || evento;
    setIdEditando(ag.id);
    const pacienteInfo = opcoesPacientes.find(p => p.value === ag.pacienteId);
    setPacienteSelecionado(pacienteInfo);
    setProfissionalId(ag.profissionalId || '');
    setStatus(ag.status);
    const d = new Date(ag.dataHorario);
    setData(format(d, 'yyyy-MM-dd'));
    setHora(format(d, 'HH:mm'));

    // BUSCA A ANAMNESE DO PACIENTE
    if (pacienteInfo) {
      try {
        const resAnamnese = await fetch(`${API_URL}/pacientes/${pacienteInfo.value}/anamnese`, { 
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resAnamnese.ok) {
          const dataAnamnese = await resAnamnese.json();
          setAlergias(dataAnamnese?.alergias || '');
          setRoacutan(dataAnamnese?.roacutan || 'Não');
          setGestanteLactante(dataAnamnese?.gestanteLactante || 'Não');
        }
      } catch (e) { console.error("Erro ao buscar anamnese:", e); }
    }

    // Reset aba atendimento
    setTextoEvolucao(''); 
    setInsumosUsados([]);
    setProcedimentosSelecionados([]);
    setEditandoAnamnese(false); 
    setAbaModal('dados'); 
    setModalAberto(true);
  };

  // --- LÓGICA DE ANAMNESE ---
  const salvarAnamneseDaAgenda = async () => {
    if (!pacienteSelecionado?.value) return alert("Nenhum paciente selecionado.");
    try {
      const resposta = await fetch(`${API_URL}/pacientes/${pacienteSelecionado.value}/anamnese`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ alergias, roacutan, gestanteLactante })
      });
      if (resposta.ok) {
        setEditandoAnamnese(false);
      }
    } catch (erro) { console.error("Erro ao salvar anamnese:", erro); }
  };

  // --- LÓGICA DE INSUMOS ---
  const adicionarInsumo = () => {
    if (!produtoSelecionado || qtdInsumo <= 0) return;
    setInsumosUsados([...insumosUsados, {
      produtoId: produtoSelecionado.value,
      nome: produtoSelecionado.label,
      qtd: parseInt(qtdInsumo)
    }]);
    setProdutoSelecionado(null);
    setQtdInsumo(1);
  };

  const removerInsumo = (index) => {
    const novaLista = [...insumosUsados];
    novaLista.splice(index, 1);
    setInsumosUsados(novaLista);
  };

  // --- SALVAR (SIMPLES OU FINALIZAR) ---
  const salvarAgendamento = async (e) => {
    e.preventDefault();
    
    const dataHorario = new Date(`${data}T${hora}:00`).toISOString();
    const bodyBase = { 
      pacienteId: pacienteSelecionado?.value, 
      profissionalId, 
      dataHorario, 
      status 
    };

    // CASO 1: FINALIZAR ATENDIMENTO (Aba Prontuário + Agendamento Existente)
    if (abaModal === 'atendimento' && idEditando) {
      if (isFinalizado) return;

      if(!window.confirm("Deseja finalizar o atendimento? Isso dará baixa no estoque, salvará a evolução e os procedimentos.")) return;
      
      try {
        const res = await fetch(`${API_URL}/agendamentos/${idEditando}/finalizar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            textoEvolucao,
            insumos: insumosUsados.map(i => ({ produtoId: i.produtoId, qtd: i.qtd })),
            procedimentosIds: procedimentosSelecionados.map(p => p.value)
          })
        });

        if (!res.ok) {
          const erro = await res.json();
          throw new Error(erro.erro || "Erro ao finalizar");
        }

        alert("Atendimento finalizado com sucesso!");
        setModalAberto(false);
        carregarTudo();
        return;
      } catch (err) {
        alert(err.message);
        return;
      }
    }

    // CASO 2: SALVAMENTO COMUM (Editar hora, status ou criar novo)
    try {
      const url = idEditando ? `${API_URL}/agendamentos/${idEditando}` : `${API_URL}/agendamentos`;
      const metodo = idEditando ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(bodyBase)
      });
      
      if (!res.ok) throw new Error("Erro ao salvar agendamento");

      setModalAberto(false);
      carregarTudo();
    } catch (err) { 
      console.error(err);
      alert("Erro ao salvar. Verifique os dados.");
    }
  };

  const deletarAgendamento = async () => {
    if(window.confirm("Remover este agendamento?")) {
      await fetch(`${API_URL}/agendamentos/${idEditando}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setModalAberto(false);
      carregarTudo();
    }
  };

  // --- RELATÓRIOS ---
  const gerarDadosRelatorio = () => {
    if (!relatorioInicio || !relatorioFim) {
      alert("Preencha as datas de início e fim.");
      return null;
    }
    const inicio = startOfDay(new Date(`${relatorioInicio}T00:00:00`));
    const fim = endOfDay(new Date(`${relatorioFim}T00:00:00`));
    
    const eventosCalendario = agendamentos.map(a => ({
      start: new Date(a.dataHorario),
      resource: a,
      status: a.status
    }));

    const filtrados = eventosCalendario.filter(e => isWithinInterval(e.start, { start: inicio, end: fim }));
    
    return filtrados.map(e => ({
      Data: format(e.start, 'dd/MM/yyyy'),
      Hora: format(e.start, 'HH:mm'),
      Paciente: e.resource.paciente?.nome || 'Removido',
      WhatsApp: e.resource.paciente?.whatsapp || '-',
      Profissional: e.resource.profissional?.nome || '-',
      Status: e.status
    }));
  };

  const baixarExcel = () => {
    const dados = gerarDadosRelatorio();
    if (!dados) return;
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Agendamentos");
    XLSX.writeFile(workbook, `Relatorio_Agendamentos.xlsx`);
    setModalRelatorioAberto(false);
  };

  const baixarPDF = () => {
    const dados = gerarDadosRelatorio();
    if (!dados) return;
    const doc = new jsPDF();
    doc.text(`Relatório de Agendamentos`, 14, 15);
    const tableColumn = ["Data", "Hora", "Paciente", "Telefone", "Profissional", "Status"];
    const tableRows = dados.map(d => [d.Data, d.Hora, d.Paciente, d.WhatsApp, d.Profissional, d.Status]);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save(`Relatorio_Agendamentos.pdf`);
    setModalRelatorioAberto(false);
  };

  // Helpers
  const opcoesPacientes = pacientes.map(p => ({ value: p.id, label: p.nome }));
  const opcoesProdutos = produtos.map(p => ({ value: p.id, label: `${p.nome} (Estoque: ${p.qtd})` }));
  
  const eventosCalendario = agendamentos.map(a => ({
    title: `${a.paciente?.nome || 'Excluído'}`,
    start: new Date(a.dataHorario),
    end: new Date(new Date(a.dataHorario).getTime() + 60*60*1000),
    status: a.status,
    resource: a
  }));

  const agendamentosHoje = eventosCalendario
    .filter(evento => isSameDay(evento.start, new Date()))
    .sort((a, b) => a.start - b.start);

  const eventStyleGetter = (event) => {
    let bg = '#f59e0b'; 
    if (event.status === 'Confirmado') bg = '#10b981'; 
    if (event.status === 'Concluído' || event.status === 'Concluido') bg = '#64748b'; 
    if (event.status === 'Cancelado') bg = '#e11d48'; 
    return { style: { backgroundColor: bg, borderRadius: '4px' } };
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full h-full flex flex-col animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-light text-gray-800">Agenda</h1>
          <p className="text-sm text-gray-500">Gestão de atendimentos</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModalRelatorioAberto(true)} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 flex items-center gap-2">
            <Download size={18}/> Relatório
          </button>
          <button onClick={() => abrirNovo(new Date())} className="bg-rose-600 text-white px-4 py-2 rounded-lg flex gap-2 items-center hover:bg-rose-700">
            <Plus size={20}/> Novo
          </button>
        </div>
      </div>

      {/* Abas Superiores */}
      <div className="flex gap-4 mb-4 border-b border-gray-200">
        <button onClick={() => setAbaAtiva('calendario')} className={`pb-3 px-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${abaAtiva === 'calendario' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <CalendarDays size={18} /> Calendário
        </button>
        <button onClick={() => setAbaAtiva('hoje')} className={`pb-3 px-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${abaAtiva === 'hoje' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <List size={18} /> Hoje {agendamentosHoje.length > 0 && <span className="bg-rose-100 text-rose-700 py-0.5 px-2 rounded-full text-xs ml-1">{agendamentosHoje.length}</span>}
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1">
        {abaAtiva === 'calendario' ? (
          <Calendar
            localizer={localizer}
            events={eventosCalendario}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%', minHeight: '500px' }}
            culture="pt-BR"
            date={dataCalendario}
            view={viewCalendario}
            onNavigate={setDataCalendario}
            onView={setViewCalendario}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={abrirEdicao}
            onSelectSlot={(slot) => abrirNovo(slot.start)}
            selectable
            messages={{ next: "Próx", previous: "Ant", today: "Hoje", month: "Mês", week: "Semana", day: "Dia" }}
          />
        ) : (
          <div className="flex-1 overflow-y-auto pr-2">
            {agendamentosHoje.length === 0 ? <p className="text-center py-10 text-gray-400">Sem agendamentos para hoje.</p> : (
              <div className="space-y-3">
                {agendamentosHoje.map((evento, idx) => (
                  <div key={idx} onClick={() => abrirEdicao(evento)} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-rose-200 cursor-pointer transition-all bg-white group">
                    <div className="flex items-center gap-4">
                      <div className="font-bold text-slate-700 bg-slate-50 p-2 rounded-lg">{format(evento.start, 'HH:mm')}</div>
                      <div>
                        <div className="font-bold text-slate-800">{evento.resource.paciente?.nome || 'Paciente Removido'}</div>
                        <div className="text-xs text-slate-500">{evento.resource.profissional?.nome || '-'}</div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      evento.status === 'Confirmado' ? 'bg-emerald-100 text-emerald-700' : 
                      evento.status === 'Cancelado' ? 'bg-rose-100 text-rose-700' : 
                      evento.status === 'Concluído' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {evento.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- SUPER MODAL DE ATENDIMENTO --- */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col animate-in zoom-in-95">
            
            {/* Header Modal */}
            <div className="p-6 border-b flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {idEditando ? (abaModal === 'atendimento' ? 'Realizando Atendimento' : 'Editar Agendamento') : 'Novo Agendamento'}
                </h2>
                <p className="text-xs text-gray-500">{idEditando ? 'ID: ' + idEditando.split('-')[0] : 'Nova Consulta'}</p>
              </div>
              <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-gray-700"><X size={24}/></button>
            </div>

            {/* Abas */}
            {idEditando && (
              <div className="flex border-b px-6 overflow-x-auto">
                <button 
                  onClick={() => setAbaModal('dados')}
                  className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${abaModal === 'dados' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  <CalendarDays size={16}/> Dados da Agenda
                </button>
                <button 
                  onClick={() => setAbaModal('anamnese')}
                  className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${abaModal === 'anamnese' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  <User size={16}/> Anamnese
                </button>
                <button 
                  onClick={() => setAbaModal('atendimento')}
                  className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${abaModal === 'atendimento' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  <Stethoscope size={16}/> Prontuário & Insumos
                </button>
              </div>
            )}

            {/* Conteúdo Scrollável */}
            <div className="flex-1 overflow-y-auto p-6">
              <form id="formAgendamento" onSubmit={salvarAgendamento}>
                
                {/* ABA 1: DADOS DA AGENDA */}
                {abaModal === 'dados' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Paciente</label>
                      <Select options={opcoesPacientes} value={pacienteSelecionado} onChange={setPacienteSelecionado} placeholder="Selecione..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Profissional</label>
                        <select value={profissionalId} onChange={e => setProfissionalId(e.target.value)} className="w-full p-2.5 bg-gray-50 border rounded-lg">
                          <option value="">Selecione...</option>
                          {profissionais.filter(p => p.status === 'ativo' || p.id === profissionalId).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value)} className="w-full p-2.5 bg-gray-50 border rounded-lg" disabled={isFinalizado}>
                          <option value="Agendado">Agendado</option>
                          <option value="Confirmado">Confirmado</option>
                          <option value="Concluído">Concluído</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="date" value={data} onChange={e => setData(e.target.value)} className="w-full p-2.5 bg-gray-50 border rounded-lg" required />
                      <input type="time" value={hora} onChange={e => setHora(e.target.value)} className="w-full p-2.5 bg-gray-50 border rounded-lg" required />
                    </div>
                  </div>
                )}

                {/* ABA 2: ANAMNESE */}
                {abaModal === 'anamnese' && (
                  <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <User size={20} className="text-blue-600"/> Histórico do Paciente
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">Dados fixos de saúde do paciente atual.</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setEditandoAnamnese(!editandoAnamnese)} 
                          className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          {editandoAnamnese ? 'Cancelar Edição' : <><Edit3 size={16} /> Preencher/Editar</>}
                        </button>
                      </div>

                      {editandoAnamnese ? (
                        <div className="space-y-4 bg-white p-5 rounded-lg border border-gray-200 shadow-sm animate-in fade-in duration-200">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alergias conhecidas</label>
                            <input type="text" value={alergias} onChange={e => setAlergias(e.target.value)} placeholder="Ex: Dipirona, iodo..." className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-400" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Faz uso de Roacutan?</label>
                              <select value={roacutan} onChange={e => setRoacutan(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-400">
                                <option value="Não">Não</option>
                                <option value="Sim (Atual)">Sim (Atual)</option>
                                <option value="Sim (Finalizado)">Sim (Já finalizou há -6 meses)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Gestante ou Lactante?</label>
                              <select value={gestanteLactante} onChange={e => setGestanteLactante(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-400">
                                <option value="Não">Não</option>
                                <option value="Gestante">Gestante</option>
                                <option value="Lactante">Lactante</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex justify-end pt-3">
                            <button type="button" onClick={salvarAnamneseDaAgenda} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors shadow-sm">
                              Salvar Anamnese
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                          <div>
                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Alergias</span>
                            <p className="text-gray-800 font-medium">{alergias || 'Nenhuma declarada.'}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                            <div>
                              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Roacutan</span>
                              <p className="text-gray-800 font-medium">{roacutan}</p>
                            </div>
                            <div>
                              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Gestante/Lactante</span>
                              <p className="text-gray-800 font-medium">{gestanteLactante}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ABA 3: ATENDIMENTO MÉDICO (Evolução + Insumos + Procedimentos) */}
                {abaModal === 'atendimento' && (
                  <div className="space-y-6 animate-in slide-in-from-right-4">
                    
                    {/* --- BLOQUEIO SE JÁ ESTIVER FINALIZADO --- */}
                    {isFinalizado ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center flex flex-col items-center justify-center h-64">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-emerald-800">Atendimento Concluído</h3>
                        <p className="text-emerald-600 mt-2 max-w-sm">
                          Este agendamento já foi finalizado. O estoque foi atualizado e a evolução salva no prontuário do paciente.
                        </p>
                      </div>
                    ) : (
                      /* --- FORMULÁRIO DE ATENDIMENTO (ATIVO) --- */
                      <>
                        {/* 1. Procedimentos */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><Briefcase size={18}/> Procedimentos Realizados</h3>
                          <p className="text-xs text-gray-500 mb-2">Selecione o que foi feito nesta sessão.</p>
                          <Select 
                            isMulti 
                            options={listaProcedimentos} 
                            value={procedimentosSelecionados} 
                            onChange={setProcedimentosSelecionados}
                            placeholder="Selecione os procedimentos..."
                            menuPortalTarget={document.body}
                          />
                        </div>

                        {/* 2. Evolução */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><FileText size={18}/> Evolução do Paciente</h3>
                          <div className="bg-white rounded-lg border overflow-hidden">
                            <DefaultEditor value={textoEvolucao} onChange={e => setTextoEvolucao(e.target.value)} containerProps={{ style: { height: '150px', border: 'none' } }} />
                          </div>
                        </div>

                        {/* 3. Insumos */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><Package size={18}/> Insumos Gastos na Sessão</h3>
                          
                          <div className="flex gap-2 mb-3">
                            <div className="flex-1">
                              <Select options={opcoesProdutos} value={produtoSelecionado} onChange={setProdutoSelecionado} placeholder="Produto usado..." menuPortalTarget={document.body} />
                            </div>
                            <input type="number" value={qtdInsumo} onChange={e => setQtdInsumo(e.target.value)} className="w-20 p-2 border rounded-lg" min="1" />
                            <button type="button" onClick={adicionarInsumo} className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700"><Plus size={20}/></button>
                          </div>

                          {insumosUsados.length > 0 ? (
                            <ul className="space-y-2">
                              {insumosUsados.map((item, idx) => (
                                <li key={idx} className="flex justify-between items-center bg-white p-2 rounded border text-sm">
                                  <span>{item.nome} <strong className="text-emerald-600">x{item.qtd}</strong></span>
                                  <button type="button" onClick={() => removerInsumo(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-gray-400 italic">Nenhum produto adicionado.</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

              </form>
            </div>

            {/* Footer com Ações */}
            <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-between items-center">
              <div>
                {idEditando && <button type="button" onClick={deletarAgendamento} className="text-rose-500 text-sm hover:underline">Excluir Agendamento</button>}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModalAberto(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">Cancelar</button>
                
                {/* BOTÃO INTELIGENTE: Bloqueado se finalizado (exceto para aba Anamnese que não tem "Finalizar") */}
                {!isFinalizado && abaModal !== 'anamnese' && (
                  <button 
                    type="submit" 
                    form="formAgendamento"
                    className={`px-6 py-2 rounded-lg text-white font-bold shadow-md transition-colors flex items-center gap-2 ${
                      abaModal === 'atendimento' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {abaModal === 'atendimento' ? <><CheckCircle size={18}/> Finalizar Atendimento</> : <><Save size={18}/> Salvar Agenda</>}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL RELATÓRIO */}
      {modalRelatorioAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Relatório</h2>
              <button onClick={() => setModalRelatorioAberto(false)}><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <input type="date" value={relatorioInicio} onChange={e => setRelatorioInicio(e.target.value)} className="w-full p-2.5 bg-gray-50 border rounded-lg" />
              <input type="date" value={relatorioFim} onChange={e => setRelatorioFim(e.target.value)} className="w-full p-2.5 bg-gray-50 border rounded-lg" />
              <button onClick={baixarPDF} className="w-full py-2.5 bg-rose-600 text-white rounded-lg flex justify-center gap-2"><FileText size={18}/> PDF</button>
              <button onClick={baixarExcel} className="w-full py-2.5 bg-emerald-600 text-white rounded-lg flex justify-center gap-2"><FileSpreadsheet size={18}/> Excel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}