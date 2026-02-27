import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Shield, Key, Search, Check, X, Stethoscope, Briefcase, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MODULOS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'pacientes', label: 'Pacientes' },
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'estoque', label: 'Estoque' },
  { id: 'procedimentos', label: 'Procedimentos' },
  { id: 'usuarios', label: 'Usuários do Sistema' }
];

export default function Usuarios() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { token, usuario: usuarioLogado } = useAuth(); 

  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');

  // --- ESTADOS DO FORMULÁRIO ---
  const [idEditando, setIdEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState([]);
  const [status, setStatus] = useState('ativo');
  
  // Novos Estados (Equipe/Profissional)
  const [cargo, setCargo] = useState('Recepcionista');
  const [atendePacientes, setAtendePacientes] = useState(false);
  const [especialidade, setEspecialidade] = useState('');
  const [conselho, setConselho] = useState('');
  const [telefone, setTelefone] = useState('');
  const [comissao, setComissao] = useState(0);

  useEffect(() => {
    buscarUsuarios();
  }, []);

  const buscarUsuarios = async () => {
    try {
      setCarregando(true);
      const res = await fetch(`${API_URL}/usuarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setUsuarios(await res.json());
    } catch (error) { console.error(error); } 
    finally { setCarregando(false); }
  };

  const abrirModal = (user = null) => {
    if (user) {
      setIdEditando(user.id);
      setNome(user.nome || '');
      setUsername(user.username || '');
      setPermissoesSelecionadas(user.permissoes || []);
      setStatus(user.status || 'ativo');
      setSenha(''); 
      setCargo(user.cargo || 'Indefinido');
      setAtendePacientes(user.atendePacientes || false);
      setEspecialidade(user.especialidade || '');
      setConselho(user.conselho || '');
      setTelefone(user.telefone || '');
      setComissao(user.comissao || 0);
    } else {
      // Padrão para novo usuário
      setIdEditando(null);
      setNome('');
      setUsername('');
      setPermissoesSelecionadas(['dashboard', 'agenda', 'pacientes']); 
      setStatus('ativo');
      setSenha('');
      setCargo('Recepcionista');
      setAtendePacientes(false);
      setEspecialidade('');
      setConselho('');
      setTelefone('');
      setComissao(0);
    }
    setModalAberto(true);
  };

  const togglePermissao = (idModulo) => {
    if (permissoesSelecionadas.includes(idModulo)) {
      setPermissoesSelecionadas(permissoesSelecionadas.filter(p => p !== idModulo));
    } else {
      setPermissoesSelecionadas([...permissoesSelecionadas, idModulo]);
    }
  };

  const salvarUsuario = async (e) => {
    e.preventDefault();

    if (!idEditando && !senha) return alert("A senha é obrigatória para novos usuários.");

    const payload = {
      nome,
      username,
      permissoes: permissoesSelecionadas,
      status,
      senha, 
      cargo,
      atendePacientes,
      especialidade: atendePacientes ? especialidade : null,
      conselho: atendePacientes ? conselho : null,
      telefone,
      comissao: atendePacientes ? Number(comissao) : 0
    };

    try {
      const url = idEditando ? `${API_URL}/usuarios/${idEditando}` : `${API_URL}/usuarios`;
      const metodo = idEditando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      setModalAberto(false);
      buscarUsuarios();
    } catch (error) {
      alert("Erro na operação. Verifique se o login já existe.");
    }
  };

  const deletarUsuario = async (id) => {
    if (id === usuarioLogado.id) return alert("Você não pode excluir a si mesmo!");
    if (!window.confirm("Tem certeza que deseja remover este usuário? Se ele tiver agendamentos, a exclusão pode falhar.")) return;

    try {
      const res = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if(!res.ok) throw new Error("Falha ao deletar");
      
      buscarUsuarios();
    } catch (error) { 
      alert("Não foi possível excluir. O usuário pode estar vinculado a históricos de pacientes ou financeiro. Experimente inativá-lo.");
    }
  };

  const usuariosFiltrados = usuarios.filter(u => 
    u.nome.toLowerCase().includes(termoBusca.toLowerCase()) || 
    (u.cargo && u.cargo.toLowerCase().includes(termoBusca.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-800">Equipe & Acessos</h1>
          <p className="text-sm text-gray-500">Gestão de profissionais e usuários do sistema</p>
        </div>
        <button onClick={() => abrirModal()} className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg flex gap-2 items-center shadow transition-colors font-medium">
          <Plus size={20} /> Adicionar Membro
        </button>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input type="text" placeholder="Buscar por nome ou cargo..." value={termoBusca} onChange={e => setTermoBusca(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-rose-400" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="p-4">Membro da Equipe</th>
                <th className="p-4 text-center">Atende Pacientes?</th>
                <th className="p-4">Acessos Liberados</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {carregando ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Carregando equipe...</td></tr>
              ) : usuariosFiltrados.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Nenhum membro encontrado.</td></tr>
              ) : usuariosFiltrados.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${user.atendePacientes ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                        {user.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">{user.nome}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Briefcase size={12}/> {user.cargo} 
                          <span className="text-gray-300 mx-1">|</span> 
                          Login: <span className="font-mono">{user.username}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {user.atendePacientes ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Stethoscope size={14}/> Sim
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                        Não
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {user.permissoes.length === 0 ? <span className="text-xs text-gray-400 italic">Sem acessos</span> :
                        user.permissoes.slice(0, 3).map(p => (
                          <span key={p} className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded text-[10px] uppercase border border-rose-100 font-semibold">{p}</span>
                        ))
                      }
                      {user.permissoes.length > 3 && <span className="text-[10px] text-gray-400 self-center font-bold">+{user.permissoes.length - 3}</span>}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.status === 'ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => abrirModal(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar"><Edit2 size={18}/></button>
                      {user.id !== usuarioLogado?.id && (
                        <button onClick={() => deletarUsuario(user.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Excluir"><Trash2 size={18}/></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- SUPER MODAL DE CADASTRO --- */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 animate-in zoom-in-95">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Shield className="text-rose-600" size={24}/> {idEditando ? 'Editar Membro da Equipe' : 'Novo Membro da Equipe'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Configure o perfil e os acessos ao sistema.</p>
              </div>
              <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-gray-700 transition-colors p-2"><X size={20}/></button>
            </div>

            <form onSubmit={salvarUsuario} className="p-6 space-y-8">
              
              {/* BLOCO 1: DADOS PESSOAIS E LOGIN */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">1. Identificação e Login</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <input type="text" value={nome} onChange={e => setNome(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                    <input type="text" value={cargo} onChange={e => setCargo(e.target.value)} placeholder="Ex: Recepcionista, Biomédica..." className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Login (Username)</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 font-mono" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Key size={14}/> Senha
                      {idEditando && <span className="text-[10px] font-normal text-gray-400">(Vazio = manter atual)</span>}
                    </label>
                    <input 
                      type="password" 
                      value={senha} 
                      onChange={e => setSenha(e.target.value)} 
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400" 
                      placeholder={idEditando ? "••••••••" : "Digite a senha inicial"}
                      required={!idEditando}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
                    <input type="text" value={telefone} onChange={e => setTelefone(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status da Conta</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400">
                      <option value="ativo">Ativo (Acesso Liberado)</option>
                      <option value="inativo">Inativo (Acesso Bloqueado)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BLOCO 2: PERFIL PROFISSIONAL (Oculto se não atender pacientes) */}
              <div>
                <div className="flex items-center justify-between border-b pb-2 mb-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">2. Perfil Clínico</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className={`text-sm font-medium ${atendePacientes ? 'text-emerald-600' : 'text-gray-500'}`}>Este membro realiza atendimentos?</span>
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${atendePacientes ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                      <input type="checkbox" className="sr-only" checked={atendePacientes} onChange={(e) => setAtendePacientes(e.target.checked)} />
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${atendePacientes ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                  </label>
                </div>

                {atendePacientes ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
                      <input type="text" value={especialidade} onChange={e => setEspecialidade(e.target.value)} placeholder="Ex: Harmonização Facial" className="w-full p-2.5 bg-white border border-emerald-200 rounded-lg outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Conselho (Ex: CRM)</label>
                      <input type="text" value={conselho} onChange={e => setConselho(e.target.value)} className="w-full p-2.5 bg-white border border-emerald-200 rounded-lg outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Comissão Padrão (%)</label>
                      <input type="number" min="0" max="100" value={comissao} onChange={e => setComissao(e.target.value)} className="w-full p-2.5 bg-white border border-emerald-200 rounded-lg outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400" />
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-lg text-center border border-slate-100 text-sm text-slate-500">
                    Ative a opção acima se este membro precisar aparecer na Agenda e registrar evoluções de prontuário.
                  </div>
                )}
              </div>

              {/* BLOCO 3: PERMISSÕES DE ACESSO */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">3. Módulos Liberados</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {MODULOS.map(modulo => (
                    <div 
                      key={modulo.id} 
                      onClick={() => togglePermissao(modulo.id)}
                      className={`cursor-pointer p-3 rounded-xl border text-sm flex items-center gap-3 transition-all select-none shadow-sm ${
                        permissoesSelecionadas.includes(modulo.id) 
                          ? 'bg-rose-50 border-rose-200 text-rose-800 font-semibold' 
                          : 'bg-white border-gray-200 text-gray-500 hover:border-rose-100 hover:bg-rose-50/30'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${permissoesSelecionadas.includes(modulo.id) ? 'bg-rose-600' : 'bg-gray-100 border border-gray-300'}`}>
                        {permissoesSelecionadas.includes(modulo.id) && <Check size={14} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className="leading-tight">{modulo.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AÇÕES FOOTER */}
              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setModalAberto(false)} className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-[2] py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black shadow-lg transition-colors flex items-center justify-center gap-2">
                  <Save size={20}/> Salvar Perfil
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}