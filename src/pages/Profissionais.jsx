import React, { useState, useEffect } from 'react';
import { Stethoscope, Plus, Search, Edit2, Trash2, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Profissionais() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = useAuth();
  // 1. Estados da Tabela e UI
  const [profissionais, setProfissionais] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);

  // 2. Estados do Formulário
  const [idEditando, setIdEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [conselho, setConselho] = useState('');
  const [telefone, setTelefone] = useState('');
  const [comissao, setComissao] = useState('');
  const [status, setStatus] = useState('ativo');

  // Busca inicial
  useEffect(() => {
    buscarProfissionais();
  }, []);

  const buscarProfissionais = async () => {
    try {
      setCarregando(true);
      const resposta = await fetch(`${API_URL}/profissionais`, {
        headers: {
          'Authorization': `Bearer ${token}` 
        }
      });
      const dados = await resposta.json();
      setProfissionais(dados);
    } catch (erro) {
      console.error("Erro ao buscar profissionais:", erro);
      setProfissionais([]);
    } finally {
      setCarregando(false);
    }
  };

  const fecharModal = () => {
    setModalAberto(false);
    setIdEditando(null);
    setNome('');
    setEspecialidade('');
    setConselho('');
    setTelefone('');
    setComissao('');
    setStatus('ativo');
  };

  const abrirModalEdicao = (profissional) => {
    setIdEditando(profissional.id);
    setNome(profissional.nome);
    setEspecialidade(profissional.especialidade);
    setConselho(profissional.conselho || '');
    setTelefone(profissional.telefone);
    setComissao(profissional.comissao.toString()); // Converte para string pro input
    setStatus(profissional.status);
    setModalAberto(true);
  };

  const salvarProfissional = async (e) => {
    e.preventDefault();
    try {
      const url = idEditando ? `${API_URL}/profissionais/${idEditando}` : `${API_URL}/profissionais`;
      const metodo = idEditando ? 'PUT' : 'POST';

      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          nome, 
          especialidade, 
          conselho, 
          telefone, 
          comissao: parseInt(comissao) || 0,
          status 
        }),
      });

      if (resposta.ok) {
        fecharModal();
        buscarProfissionais(); 
      } else {
        alert("Erro ao salvar profissional. Verifique os dados e sua permissão.");
      }
    } catch (erro) {
      console.error("Erro ao salvar:", erro);
    }
  };

  const deletarProfissional = async (id) => {
    if(window.confirm("Tem certeza que deseja excluir este profissional?")) {
      try {
        await fetch(`${API_URL}/profissionais/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        buscarProfissionais(); 
      } catch (erro) {
        console.error("Erro ao deletar:", erro);
      }
    }
  };

  // Filtro
  const profissionaisFiltrados = profissionais.filter(p => 
    p.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    p.especialidade.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-800">Equipe Clínica</h1>
          <p className="text-sm text-gray-500">Gerencie os profissionais e repasses de comissão</p>
        </div>
        <button 
          onClick={() => { fecharModal(); setModalAberto(true); }}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg shadow transition-colors text-sm font-medium w-full md:w-auto justify-center"
        >
          <Plus size={20} /> Novo Profissional
        </button>
      </div>

      {/* ÁREA DE BUSCA E TABELA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou especialidade..." 
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-rose-400 transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap min-w-[800px]">
            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="p-4">Profissional</th>
                <th className="p-4">Especialidade / Registro</th>
                <th className="p-4">Contato</th>
                <th className="p-4 text-center">Comissão</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {carregando ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-400">Carregando profissionais...</td>
                </tr>
              ) : profissionaisFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-400 italic">Nenhum profissional encontrado.</td>
                </tr>
              ) : (
                profissionaisFiltrados.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                          {p.nome.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{p.nome}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-800 font-medium">{p.especialidade}</div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <ShieldCheck size={12} /> {p.conselho || 'Sem registro'}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{p.telefone}</td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg font-mono font-bold text-xs">
                        {p.comissao}%
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${p.status === 'ativo' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => abrirModalEdicao(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                        <button onClick={() => deletarProfissional(p.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {idEditando ? 'Editar Profissional' : 'Novo Profissional'}
              </h2>
              <button onClick={fecharModal} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
            </div>
            
            <form className="p-6 space-y-4" onSubmit={salvarProfissional}>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400" 
                  placeholder="Ex: Dra. Ana Costa" 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
                  <input 
                    type="text" 
                    value={especialidade}
                    onChange={(e) => setEspecialidade(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400" 
                    placeholder="Ex: Dermatologista" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registro (CRM/CRBM/COREN)</label>
                  <input 
                    type="text" 
                    value={conselho}
                    onChange={(e) => setConselho(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400" 
                    placeholder="Ex: CRM 12345" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
                  <input 
                    type="text" 
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400" 
                    placeholder="(00) 00000-0000" 
                    required 
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comissão (%)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={comissao}
                    onChange={(e) => setComissao(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400 font-bold" 
                    placeholder="Ex: 40" 
                    required 
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={fecharModal} className="flex-1 py-3 text-gray-500 font-medium hover:bg-gray-50 rounded-lg transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 shadow-lg transition-all">
                  {idEditando ? 'Atualizar Cadastro' : 'Salvar Cadastro'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}