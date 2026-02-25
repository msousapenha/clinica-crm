import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar as CalendarIcon, FileText, ArrowLeft, Image as ImageIcon, Edit3, Edit2, Trash2, Clock, User } from 'lucide-react';
import DefaultEditor from 'react-simple-wysiwyg';
import { useAuth } from '../contexts/AuthContext'; // <-- Importação do contexto

export default function Pacientes() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = useAuth(); // <-- Puxa o token global

  // --- ESTADOS DA API ---
  const [pacientes, setPacientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // --- ESTADOS DE NAVEGAÇÃO E UI ---
  const [telaAtual, setTelaAtual] = useState('lista'); 
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [abaDetalhes, setAbaDetalhes] = useState('prontuario');
  const [termoBusca, setTermoBusca] = useState('');
  
  // --- ESTADOS DO FORMULÁRIO DE PACIENTE ---
  const [idEditando, setIdEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // --- ESTADOS DO PRONTUÁRIO ---
  const [editandoAnamnese, setEditandoAnamnese] = useState(false);
  const [alergias, setAlergias] = useState('');
  const [roacutan, setRoacutan] = useState('Não');
  const [gestanteLactante, setGestanteLactante] = useState('Não');

  const [evolucoes, setEvolucoes] = useState([]);
  const [textoEvolucao, setTextoEvolucao] = useState('');
  const [profissionalEvolucao, setProfissionalEvolucao] = useState('');
  
  const [consultas, setConsultas] = useState([]);

  // --- BUSCA INICIAL ---
  useEffect(() => {
    if (telaAtual === 'lista') {
      buscarPacientes();
    }
    buscarProfissionais(); 
  }, [telaAtual]);

  const buscarPacientes = async () => {
    try {
      setCarregando(true);
      const resposta = await fetch(`${API_URL}/pacientes`, {
        headers: { 'Authorization': `Bearer ${token}` } // <-- Injeção do token
      });
      if (!resposta.ok) throw new Error("Não autorizado");
      setPacientes(await resposta.json());
    } catch (erro) { 
      console.error("Erro ao buscar pacientes:", erro);
      setPacientes([]); // Fallback para não quebrar o .filter
    } finally { setCarregando(false); }
  };

  const buscarProfissionais = async () => {
    try {
      const resposta = await fetch(`${API_URL}/profissionais`, {
        headers: { 'Authorization': `Bearer ${token}` } // <-- Injeção do token
      });
      if (!resposta.ok) throw new Error("Não autorizado");
      setProfissionais(await resposta.json());
    } catch (erro) { 
      console.error("Erro ao buscar profissionais:", erro);
      setProfissionais([]);
    }
  };

  // --- CRUD DE PACIENTES ---
  const abrirFormularioNovo = () => {
    setIdEditando(null); setNome(''); setWhatsapp(''); setTelaAtual('formulario');
  };

  const abrirFormularioEdicao = (paciente) => {
    setIdEditando(paciente.id); setNome(paciente.nome); setWhatsapp(paciente.whatsapp); setTelaAtual('formulario');
  };

  const salvarPaciente = async (e) => {
    e.preventDefault();
    try {
      const url = idEditando ? `${API_URL}/pacientes/${idEditando}` : `${API_URL}/pacientes`;
      const metodo = idEditando ? 'PUT' : 'POST';
      const resposta = await fetch(url, {
        method: metodo,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // <-- Injeção do token
        },
        body: JSON.stringify({ nome, whatsapp, status: 'ativo' }),
      });
      if (resposta.ok) {
        setNome(''); setWhatsapp(''); setIdEditando(null); setTelaAtual('lista'); 
      }
    } catch (erro) { console.error("Erro ao salvar:", erro); }
  };

  const deletarPaciente = async (id) => {
    if (window.confirm("Excluir este paciente e todo o seu histórico permanentemente?")) {
      try {
        await fetch(`${API_URL}/pacientes/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` } // <-- Injeção do token
        });
        buscarPacientes();
      } catch (erro) { console.error("Erro ao deletar:", erro); }
    }
  };

  // --- LÓGICA DO PRONTUÁRIO ---
  const abrirDetalhes = async (paciente) => {
    setPacienteSelecionado(paciente);
    setAbaDetalhes('prontuario');
    setEditandoAnamnese(false);
    setTextoEvolucao('');
    setProfissionalEvolucao('');
    setTelaAtual('detalhes');

    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [resAnamnese, resEvolucoes, resConsultas] = await Promise.all([
        fetch(`${API_URL}/pacientes/${paciente.id}/anamnese`, { headers }),
        fetch(`${API_URL}/pacientes/${paciente.id}/evolucoes`, { headers }),
        fetch(`${API_URL}/pacientes/${paciente.id}/consultas`, { headers })
      ]);

      const dataAnamnese = await resAnamnese.json();
      setAlergias(dataAnamnese?.alergias || '');
      setRoacutan(dataAnamnese?.roacutan || 'Não');
      setGestanteLactante(dataAnamnese?.gestanteLactante || 'Não');

      setEvolucoes(await resEvolucoes.json());
      setConsultas(await resConsultas.json());
    } catch (erro) { console.error("Erro ao carregar prontuário:", erro); }
  };

  const salvarAnamnese = async () => {
    try {
      const resposta = await fetch(`${API_URL}/pacientes/${pacienteSelecionado.id}/anamnese`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ alergias, roacutan, gestanteLactante })
      });
      if (resposta.ok) setEditandoAnamnese(false);
    } catch (erro) { console.error("Erro ao salvar anamnese:", erro); }
  };

  const salvarEvolucao = async () => {
    if (!textoEvolucao || textoEvolucao === '<br>') return alert("Escreva algo na evolução.");
    
    try {
      const resposta = await fetch(`${API_URL}/pacientes/${pacienteSelecionado.id}/evolucoes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          texto: textoEvolucao, 
          profissionalId: profissionalEvolucao || null 
        })
      });

      if (resposta.ok) {
        const novaEvolucao = await resposta.json();
        setEvolucoes([novaEvolucao, ...evolucoes]);
        setTextoEvolucao('');
      }
    } catch (erro) { console.error("Erro ao registrar evolução:", erro); }
  };

  const pacientesFiltrados = Array.isArray(pacientes) ? pacientes.filter(p => 
    p.nome.toLowerCase().includes(termoBusca.toLowerCase()) || p.whatsapp.includes(termoBusca)
  ) : [];

  // =========================================================================
  // RENDERIZAÇÃO DAS TELAS (LISTA, FORMULÁRIO, DETALHES)
  // =========================================================================
  if (telaAtual === 'lista') {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full animate-in fade-in duration-300">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light text-gray-800">Pacientes</h1>
          <button onClick={abrirFormularioNovo} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg shadow transition-colors">
            <Plus size={20} /> Novo Paciente
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input type="text" placeholder="Buscar por nome ou WhatsApp..." value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-200 outline-none transition-all" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">Nome do Paciente</th>
                  <th className="p-4 font-medium">WhatsApp</th>
                  <th className="p-4 font-medium">Data de Cadastro</th>
                  <th className="p-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {carregando ? (
                   <tr><td colSpan="4" className="p-8 text-center text-gray-400">Carregando pacientes...</td></tr>
                ) : pacientesFiltrados.length === 0 ? (
                   <tr><td colSpan="4" className="p-12 text-center text-gray-500">Nenhum paciente encontrado.</td></tr>
                ) : (
                  pacientesFiltrados.map((p) => (
                    <tr key={p.id} className="hover:bg-rose-50/50 transition-colors group">
                      <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center font-bold">
                          {p.nome.charAt(0).toUpperCase()}
                        </div>
                        {p.nome}
                      </td>
                      <td className="p-4 text-gray-600">{p.whatsapp}</td>
                      <td className="p-4 text-gray-600">
                        {p.criadoEm ? new Date(p.criadoEm).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => abrirDetalhes(p)} className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors" title="Ver Prontuário">
                            <FileText size={18} />
                          </button>
                          <button onClick={() => abrirFormularioEdicao(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => deletarPaciente(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Deletar">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (telaAtual === 'formulario') {
    return (
      <div className="p-8 max-w-3xl mx-auto w-full animate-in fade-in duration-300">
        <button onClick={() => setTelaAtual('lista')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <ArrowLeft size={20} /> Voltar para lista
        </button>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-light text-gray-800 mb-6">{idEditando ? 'Editar Paciente' : 'Cadastrar Novo Paciente'}</h2>
          <form onSubmit={salvarPaciente} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)} required className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-rose-400 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-rose-400 transition-colors" />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 transition-colors font-medium">
                {idEditando ? 'Atualizar Dados' : 'Salvar Paciente'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (telaAtual === 'detalhes') {
    return (
      <div className="p-8 max-w-5xl mx-auto w-full animate-in fade-in duration-300">
        <button onClick={() => setTelaAtual('lista')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <ArrowLeft size={20} /> Voltar
        </button>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-6">
          <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-3xl font-bold uppercase">
            {pacienteSelecionado?.nome.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{pacienteSelecionado?.nome}</h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              {pacienteSelecionado?.whatsapp} • ID do Prontuário: {pacienteSelecionado?.id.split('-')[0]}
            </p>
          </div>
        </div>

        <div className="flex border-b border-gray-200 mb-6">
          <button onClick={() => setAbaDetalhes('prontuario')} className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${abaDetalhes === 'prontuario' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <FileText size={18} /> Prontuário & Evolução
          </button>
          <button onClick={() => setAbaDetalhes('consultas')} className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${abaDetalhes === 'consultas' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <CalendarIcon size={18} /> Histórico de Consultas
          </button>
        </div>

        {abaDetalhes === 'prontuario' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Anamnese</h3>
                  <button onClick={() => setEditandoAnamnese(!editandoAnamnese)} className="text-rose-600 text-sm font-medium hover:text-rose-800 flex items-center gap-1">
                    {editandoAnamnese ? 'Cancelar Edição' : <><Edit3 size={16} /> Preencher/Editar</>}
                  </button>
                </div>

                {editandoAnamnese ? (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alergias conhecidas</label>
                      <input type="text" value={alergias} onChange={e => setAlergias(e.target.value)} placeholder="Ex: Dipirona, iodo..." className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Faz uso de Roacutan?</label>
                        <select value={roacutan} onChange={e => setRoacutan(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400">
                          <option value="Não">Não</option>
                          <option value="Sim (Atual)">Sim (Atual)</option>
                          <option value="Sim (Finalizado)">Sim (Já finalizou há -6 meses)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gestante ou Lactante?</label>
                        <select value={gestanteLactante} onChange={e => setGestanteLactante(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400">
                          <option value="Não">Não</option>
                          <option value="Gestante">Gestante</option>
                          <option value="Lactante">Lactante</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button onClick={salvarAnamnese} className="bg-rose-600 text-white px-5 py-2 rounded-lg hover:bg-rose-700 text-sm font-medium transition-colors">
                        Salvar Anamnese
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-600"><strong className="text-gray-800">Alergias:</strong> {alergias || 'Nenhuma declarada.'}</p>
                    <p className="text-sm text-gray-600"><strong className="text-gray-800">Roacutan:</strong> {roacutan}</p>
                    <p className="text-sm text-gray-600"><strong className="text-gray-800">Gestante/Lactante:</strong> {gestanteLactante}</p>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Nova Evolução Diária</h3>
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"><User size={16}/> Profissional Responsável</label>
                  <select value={profissionalEvolucao} onChange={e => setProfissionalEvolucao(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400">
                    <option value="">Selecione quem está escrevendo...</option>
                    {profissionais.filter(p => p.status === 'ativo').map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-rose-200 focus-within:border-rose-400 transition-all">
                  <DefaultEditor value={textoEvolucao} onChange={(e) => setTextoEvolucao(e.target.value)} containerProps={{ style: { height: '200px', backgroundColor: '#f9fafb', border: 'none' } }} />
                </div>
                <div className="flex justify-end mt-4">
                  <button onClick={salvarEvolucao} className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors">
                    Registrar Evolução
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center gap-2">
                  <Clock size={20} className="text-gray-400" /> Histórico de Evoluções
                </h3>
                {Array.isArray(evolucoes) && evolucoes.length === 0 ? (
                  <p className="text-gray-500 italic">Nenhuma evolução registrada.</p>
                ) : (
                  <div className="space-y-8 relative before:absolute before:top-2 before:bottom-0 before:left-3 before:w-0.5 before:bg-gray-200">
                    {Array.isArray(evolucoes) && evolucoes.map((ev) => (
                      <div key={ev.id} className="relative pl-10">
                        <div className="absolute left-0 top-1 w-6 h-6 bg-white border-2 border-rose-400 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                {new Date(ev.data).toLocaleDateString('pt-BR')} às {new Date(ev.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                              </h4>
                              <p className="text-sm text-gray-500">Registrado por: {ev.profissional?.nome || 'Sistema'}</p>
                            </div>
                          </div>
                          <div className="text-gray-700 text-sm prose prose-sm max-w-none prose-rose" dangerouslySetInnerHTML={{ __html: ev.texto }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <ImageIcon size={20} /> Galeria Antes/Depois
              </h3>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-400 hover:bg-gray-50 cursor-pointer transition-colors">
                <ImageIcon size={32} className="mx-auto mb-2" />
                <p className="text-sm">Integração com fotos em breve</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="p-4">Data da Consulta</th>
                  <th className="p-4">Profissional</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.isArray(consultas) && consultas.length === 0 ? (
                  <tr><td colSpan="3" className="p-8 text-center text-gray-500 italic">Nenhum agendamento encontrado.</td></tr>
                ) : (
                  Array.isArray(consultas) && consultas.map(consulta => (
                    <tr key={consulta.id}>
                      <td className="p-4 font-medium">
                        {new Date(consulta.dataHorario).toLocaleDateString('pt-BR')} - {new Date(consulta.dataHorario).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="p-4 text-gray-600">{consulta.profissional?.nome || '-'}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          consulta.status === 'Concluído' ? 'bg-slate-200 text-slate-700' : 
                          consulta.status === 'Confirmado' ? 'bg-emerald-100 text-emerald-700' :
                          consulta.status === 'Cancelado' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {consulta.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return null;
}