import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Procedimentos() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = useAuth();

  const [procedimentos, setProcedimentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);

  // Estados do Formulário
  const [idEditando, setIdEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [status, setStatus] = useState('ativo');

  useEffect(() => {
    buscarProcedimentos();
  }, []);

  const buscarProcedimentos = async () => {
    setCarregando(true);
    try {
      // Trazemos todos para poder editar os inativos se precisar
      const res = await fetch(`${API_URL}/procedimentos?todos=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setProcedimentos(await res.json());
    } catch (error) { console.error(error); } 
    finally { setCarregando(false); }
  };

  const abrirModal = (proc = null) => {
    if (proc) {
      setIdEditando(proc.id);
      setNome(proc.nome);
      setValor(proc.valor);
      setStatus(proc.status);
    } else {
      setIdEditando(null);
      setNome('');
      setValor('');
      setStatus('ativo');
    }
    setModalAberto(true);
  };

  const salvar = async (e) => {
    e.preventDefault();
    const payload = { nome, valor, status };
    const metodo = idEditando ? 'PUT' : 'POST';
    const url = idEditando ? `${API_URL}/procedimentos/${idEditando}` : `${API_URL}/procedimentos`;

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setModalAberto(false);
        buscarProcedimentos();
      }
    } catch (error) { alert('Erro ao salvar'); }
  };

  const deletar = async (id) => {
    if (!window.confirm('Deseja inativar este procedimento?')) return;
    try {
      await fetch(`${API_URL}/procedimentos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      buscarProcedimentos();
    } catch (error) { alert('Erro ao deletar'); }
  };

  const filtrados = procedimentos.filter(p => 
    p.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-800">Procedimentos</h1>
          <p className="text-sm text-gray-500">Catálogo de serviços e preços</p>
        </div>
        <button onClick={() => abrirModal()} className="bg-rose-600 text-white px-5 py-2.5 rounded-lg flex gap-2 items-center hover:bg-rose-700 shadow">
          <Plus size={20} /> Novo Serviço
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input type="text" placeholder="Buscar procedimento..." value={termoBusca} onChange={e => setTermoBusca(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border rounded-lg text-sm outline-none focus:border-rose-400" />
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
            <tr>
              <th className="p-4">Nome do Procedimento</th>
              <th className="p-4">Valor (R$)</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filtrados.map(proc => (
              <tr key={proc.id} className="hover:bg-gray-50/50">
                <td className="p-4 font-medium text-gray-700 flex items-center gap-2">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><Briefcase size={16}/></div>
                  {proc.nome}
                </td>
                <td className="p-4 font-medium text-gray-600">
                  R$ {proc.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${proc.status === 'ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {proc.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => abrirModal(proc)} className="text-blue-500 hover:bg-blue-50 p-2 rounded"><Edit2 size={16}/></button>
                    {proc.status === 'ativo' && (
                      <button onClick={() => deletar(proc.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded"><Trash2 size={16}/></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold">{idEditando ? 'Editar' : 'Novo'} Procedimento</h2>
              <button onClick={() => setModalAberto(false)}><X size={20}/></button>
            </div>
            <form onSubmit={salvar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50" required placeholder="Ex: Harmonização Facial" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Valor (R$)</label>
                  <input type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50" required placeholder="0,00" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50">
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>
              <button className="w-full py-3 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 mt-2">Salvar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}