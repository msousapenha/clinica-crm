// src/pages/Pacientes.jsx
import React, { useState } from 'react';
import { Search, Plus, Calendar as CalendarIcon, FileText, ArrowLeft, Image as ImageIcon, Edit3, Clock } from 'lucide-react';
import DefaultEditor from 'react-simple-wysiwyg';

export default function Pacientes({ pacientes }) {
  // Estados locais isolados apenas para o módulo de Pacientes
  const [telaAtual, setTelaAtual] = useState('lista');
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [abaDetalhes, setAbaDetalhes] = useState('prontuario');
  const [termoBusca, setTermoBusca] = useState('');
  const [editandoAnamnese, setEditandoAnamnese] = useState(false);
  const [textoEvolucao, setTextoEvolucao] = useState('');

  const historicoEvolucoes = [
    {
      id: 1,
      data: '10/01/2026 - 15:30',
      profissional: 'Dra. Jordania',
      texto: '<p>Paciente compareceu para primeira sessão de <strong>Microagulhamento</strong>.</p><ul><li>Aplicado anestésico tópico por 30 min.</li><li>Agulhas de 1.5mm.</li><li><em>Sangramento puntiforme leve, dentro do esperado.</em></li></ul><p>Orientada a usar muito protetor solar e evitar exposição direta por 7 dias.</p>'
    }
  ];

  const pacientesFiltrados = pacientes.filter((paciente) => {
    const termo = termoBusca.toLowerCase();
    return (
      paciente.nome.toLowerCase().includes(termo) ||
      paciente.whatsapp.includes(termo)
    );
  });

  const abrirDetalhes = (paciente) => {
    setPacienteSelecionado(paciente);
    setAbaDetalhes('prontuario');
    setEditandoAnamnese(false);
    setTextoEvolucao('');
    setTelaAtual('detalhes');
  };

  if (telaAtual === 'lista') {
    return (
      <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in duration-300">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light text-gray-800">Pacientes</h1>
          <button
            onClick={() => setTelaAtual('formulario')}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg shadow transition-colors"
          >
            <Plus size={20} /> Novo Paciente
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome ou WhatsApp..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-200 outline-none transition-all"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Nome do Paciente</th>
                <th className="p-4 font-medium">WhatsApp</th>
                <th className="p-4 font-medium">Última Visita</th>
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pacientesFiltrados.map((p) => (
                <tr key={p.id} className="hover:bg-rose-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center font-bold">
                      {p.nome.charAt(0)}
                    </div>
                    {p.nome}
                  </td>
                  <td className="p-4 text-gray-600">{p.whatsapp}</td>
                  <td className="p-4 text-gray-600">{p.ultimaVisita}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => abrirDetalhes(p)}
                      className="text-rose-600 hover:text-rose-800 font-medium"
                    >
                      Ver Ficha
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pacientesFiltrados.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              Nenhum paciente encontrado com "{termoBusca}"
            </div>
          )}
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
          <h2 className="text-2xl font-light text-gray-800 mb-6">Cadastrar Novo Paciente</h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                <input type="text" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-rose-400 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                <input type="tel" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-rose-400 transition-colors" />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setTelaAtual('lista')}
                className="bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 transition-colors font-medium"
              >
                Salvar Paciente
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
          <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-3xl font-bold">
            {pacienteSelecionado?.nome.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{pacienteSelecionado?.nome}</h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              {pacienteSelecionado?.whatsapp} • ID: {pacienteSelecionado?.id}
            </p>
          </div>
        </div>

        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setAbaDetalhes('prontuario')}
            className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${abaDetalhes === 'prontuario' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <FileText size={18} /> Prontuário & Evolução
          </button>
          <button
            onClick={() => setAbaDetalhes('consultas')}
            className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${abaDetalhes === 'consultas' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <CalendarIcon size={18} /> Histórico de Consultas
          </button>
        </div>

        {abaDetalhes === 'prontuario' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">

              {/* Anamnese Dinâmica */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Anamnese</h3>
                  <button
                    onClick={() => setEditandoAnamnese(!editandoAnamnese)}
                    className="text-rose-600 text-sm font-medium hover:text-rose-800 flex items-center gap-1"
                  >
                    {editandoAnamnese ? 'Cancelar' : <><Edit3 size={16} /> Preencher/Editar</>}
                  </button>
                </div>

                {editandoAnamnese ? (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alergias conhecidas</label>
                      <input type="text" placeholder="Ex: Dipirona, iodo..." className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Faz uso de Roacutan?</label>
                        <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400">
                          <option>Não</option>
                          <option>Sim (Atual)</option>
                          <option>Sim (Já finalizou há -6 meses)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gestante ou Lactante?</label>
                        <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400">
                          <option>Não</option>
                          <option>Gestante</option>
                          <option>Lactante</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => setEditandoAnamnese(false)}
                        className="bg-rose-600 text-white px-5 py-2 rounded-lg hover:bg-rose-700 text-sm font-medium transition-colors"
                      >
                        Salvar Anamnese
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-600"><strong className="text-gray-800">Alergias:</strong> Nenhuma declarada.</p>
                    <p className="text-sm text-gray-600"><strong className="text-gray-800">Roacutan:</strong> Não.</p>
                    <p className="text-sm text-gray-600"><strong className="text-gray-800">Gestante/Lactante:</strong> Não.</p>
                  </div>
                )}
              </div>

              {/* Novo Editor de Texto */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Nova Evolução Diária</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-rose-200 focus-within:border-rose-400 transition-all">
                  <DefaultEditor
                    value={textoEvolucao}
                    onChange={(e) => setTextoEvolucao(e.target.value)}
                    containerProps={{ style: { height: '200px', backgroundColor: '#f9fafb', border: 'none' } }}
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors">
                    Registrar Evolução
                  </button>
                </div>
              </div>

              {/* Timeline de Histórico */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center gap-2">
                  <Clock size={20} className="text-gray-400" /> Histórico de Evoluções
                </h3>

                <div className="space-y-8 relative before:absolute before:top-2 before:bottom-0 before:left-3 before:w-0.5 before:bg-gray-200">
                  {historicoEvolucoes.map((ev) => (
                    <div key={ev.id} className="relative pl-10">
                      <div className="absolute left-0 top-1 w-6 h-6 bg-white border-2 border-rose-400 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                      </div>

                      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-800">{ev.data}</h4>
                            <p className="text-sm text-gray-500">Registrado por: {ev.profissional}</p>
                          </div>
                        </div>
                        <div
                          className="text-gray-700 text-sm prose prose-sm max-w-none prose-rose"
                          dangerouslySetInnerHTML={{ __html: ev.texto }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Galeria de Imagens */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <ImageIcon size={20} /> Galeria Antes/Depois
              </h3>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-400 hover:bg-gray-50 cursor-pointer transition-colors">
                <ImageIcon size={32} className="mx-auto mb-2" />
                <p className="text-sm">Clique para adicionar fotos</p>
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="p-4">Data</th>
                  <th className="p-4">Procedimento</th>
                  <th className="p-4">Profissional</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-4 font-medium">15/02/2026 - 14:00</td>
                  <td className="p-4 text-gray-600">Limpeza de Pele Profunda</td>
                  <td className="p-4 text-gray-600">Dra. Marina</td>
                  <td className="p-4"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Concluído</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return null;
}