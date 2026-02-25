import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Shield, Key, Search, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MODULOS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'pacientes', label: 'Pacientes' },
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'estoque', label: 'Estoque' },
  { id: 'procedimentos', label: 'Procedimentos' },
  { id: 'equipe', label: 'Equipe (Profissionais)' },
  { id: 'usuarios', label: 'Usuários do Sistema (Admin)' }
];

export default function Usuarios() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { token, usuario: usuarioLogado } = useAuth(); // Pega o usuário logado para evitar que ele se exclua

  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');

  // Estados do Formulário
  const [idEditando, setIdEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState([]);
  const [status, setStatus] = useState('ativo');

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
      setNome(user.nome);
      setUsername(user.username);
      setPermissoesSelecionadas(user.permissoes || []);
      setStatus(user.status);
      setSenha(''); // Senha começa vazia na edição
    } else {
      setIdEditando(null);
      setNome('');
      setUsername('');
      setPermissoesSelecionadas(['dashboard', 'agenda', 'pacientes']); // Padrão
      setStatus('ativo');
      setSenha('');
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

    // Validação básica
    if (!idEditando && !senha) return alert("A senha é obrigatória para novos usuários.");

    const payload = {
      nome,
      username,
      permissoes: permissoesSelecionadas,
      status,
      senha // Se for vazio na edição, o backend ignora
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
      alert(idEditando ? "Usuário atualizado!" : "Usuário criado!");
    } catch (error) {
      alert("Erro na operação. Verifique se o usuário já existe.");
    }
  };

  const deletarUsuario = async (id) => {
    if (id === usuarioLogado.id) return alert("Você não pode excluir a si mesmo!");
    if (!window.confirm("Tem certeza que deseja remover este acesso?")) return;

    try {
      await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      buscarUsuarios();
    } catch (error) { console.error(error); }
  };

  const usuariosFiltrados = usuarios.filter(u => u.nome.toLowerCase().includes(termoBusca.toLowerCase()));

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto w-full animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-800">Gestão de Usuários</h1>
          <p className="text-sm text-gray-500">Controle de acesso ao sistema</p>
        </div>
        <button onClick={() => abrirModal()} className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg flex gap-2 items-center shadow transition-colors">
          <Plus size={20} /> Novo Usuário
        </button>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input type="text" placeholder="Buscar usuário..." value={termoBusca} onChange={e => setTermoBusca(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm outline-none focus:border-rose-400" />
          </div>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
            <tr>
              <th className="p-4">Usuário</th>
              <th className="p-4">Login</th>
              <th className="p-4">Acessos</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {usuariosFiltrados.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">{user.nome}</td>
                <td className="p-4 text-gray-600 font-mono text-xs">{user.username}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {user.permissoes.slice(0, 3).map(p => (
                      <span key={p} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] uppercase border border-slate-200">{p}</span>
                    ))}
                    {user.permissoes.length > 3 && <span className="text-[10px] text-gray-400 self-center">+{user.permissoes.length - 3}</span>}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${user.status === 'ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => abrirModal(user)} className="p-2 text-blue-500 hover:bg-blue-50 rounded" title="Editar"><Edit2 size={16}/></button>
                    {user.id !== usuarioLogado.id && (
                      <button onClick={() => deletarUsuario(user.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded" title="Excluir"><Trash2 size={16}/></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Criação/Edição */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Shield className="text-rose-600" size={24}/> {idEditando ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <button onClick={() => setModalAberto(false)}><X size={20} className="text-gray-400 hover:text-gray-700"/></button>
            </div>

            <form onSubmit={salvarUsuario} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome Completo</label>
                  <input type="text" value={nome} onChange={e => setNome(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Login (Username)</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  <Key size={16}/> Senha
                  {idEditando && <span className="text-xs font-normal text-gray-400">(Deixe em branco para manter a atual)</span>}
                </label>
                <input 
                  type="password" 
                  value={senha} 
                  onChange={e => setSenha(e.target.value)} 
                  className="w-full p-2.5 border rounded-lg bg-gray-50 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-none transition-all" 
                  placeholder={idEditando ? "••••••••" : "Digite a senha inicial"}
                  required={!idEditando}
                />
              </div>

              {/* Seção de Permissões */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-sm font-bold text-gray-700 mb-3">Módulos Permitidos</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {MODULOS.map(modulo => (
                    <div 
                      key={modulo.id} 
                      onClick={() => togglePermissao(modulo.id)}
                      className={`cursor-pointer p-3 rounded-lg border text-sm flex items-center gap-2 transition-all ${
                        permissoesSelecionadas.includes(modulo.id) 
                          ? 'bg-rose-50 border-rose-200 text-rose-700 font-medium' 
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${permissoesSelecionadas.includes(modulo.id) ? 'bg-rose-600 border-rose-600' : 'bg-white border-gray-300'}`}>
                        {permissoesSelecionadas.includes(modulo.id) && <Check size={12} className="text-white" />}
                      </div>
                      {modulo.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Status:</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="p-2 border rounded-lg text-sm bg-white">
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo (Bloqueado)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalAberto(false)} className="flex-1 py-3 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-900 shadow-lg">Salvar Usuário</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}