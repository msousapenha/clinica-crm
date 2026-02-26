import React, { useState, useEffect } from 'react';
import { Package, Plus, AlertTriangle, ArrowUpRight, Search, X, History, List } from 'lucide-react';
import Select from 'react-select';
import { useAuth } from '../contexts/AuthContext';

export default function Estoque() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = useAuth();

  // --- ESTADOS DA API ---
  const [produtos, setProdutos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // --- ESTADOS DE UI ---
  const [abaAtiva, setAbaAtiva] = useState('lista');
  const [modalEntradaAberto, setModalEntradaAberto] = useState(false);
  const [modalNovoProdutoAberto, setModalNovoProdutoAberto] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');

  // --- ESTADOS FORMULÁRIO: NOVO PRODUTO ---
  const [nomeNovo, setNomeNovo] = useState('');
  const [categoriaNovo, setCategoriaNovo] = useState('Injetáveis');
  const [unidadeNovo, setUnidadeNovo] = useState('unidade');
  const [minNovo, setMinNovo] = useState(0);
  const [precoMedioNovo, setPrecoMedioNovo] = useState(0);

  // --- ESTADOS FORMULÁRIO: ENTRADA ---
  const [produtoIdEntrada, setProdutoIdEntrada] = useState(null);
  const [qtdEntrada, setQtdEntrada] = useState('');
  const [custoEntrada, setCustoEntrada] = useState('');
  const [loteEntrada, setLoteEntrada] = useState('');
  const [validadeEntrada, setValidadeEntrada] = useState('');
  const [fornecedorEntrada, setFornecedorEntrada] = useState('');

  useEffect(() => {
    carregarDados();
  }, [abaAtiva]);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [resProd, resHist] = await Promise.all([
        fetch(`${API_URL}/estoque/produtos`, { headers }),
        fetch(`${API_URL}/estoque/historico`, { headers })
      ]);

      if (resProd.ok) setProdutos(await resProd.json());
      if (resHist.ok) setHistorico(await resHist.json());
    } catch (erro) {
      console.error("Erro ao carregar estoque:", erro);
    } finally {
      setCarregando(false);
    }
  };

  const salvarNovoProduto = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/estoque/produtos`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          nome: nomeNovo, 
          categoria: categoriaNovo, 
          unidade: unidadeNovo, 
          min: minNovo, 
          precoMedio: precoMedioNovo 
        })
      });

      if (res.ok) {
        setModalNovoProdutoAberto(false);
        carregarDados();
        // Reset campos
        setNomeNovo(''); setMinNovo(0); setPrecoMedioNovo(0);
      }
    } catch (erro) { console.error(erro); }
  };

  const registrarEntrada = async (e) => {
    e.preventDefault();
    if (!produtoIdEntrada) return alert("Selecione um produto.");

    try {
      const res = await fetch(`${API_URL}/estoque/movimentacao`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          produtoId: produtoIdEntrada.value,
          qtd: qtdEntrada,
          valorUnitario: custoEntrada,
          fornecedor: fornecedorEntrada,
          lote: loteEntrada,
          validade: validadeEntrada,
          tipo: 'DESPESA'
        })
      });

      if (res.ok) {
        setModalEntradaAberto(false);
        carregarDados();
        // Reset campos
        setProdutoIdEntrada(null); setQtdEntrada(''); setCustoEntrada('');
      }
    } catch (erro) { console.error(erro); }
  };

  const opcoesProdutos = produtos.map(p => ({ value: p.id, label: p.nome }));

  const produtosFiltrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-800">Estoque</h1>
          <p className="text-sm text-gray-500">Gestão de insumos e materiais</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setModalEntradaAberto(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg shadow transition-colors text-sm font-medium">
            <ArrowUpRight size={18} /> Dar Entrada
          </button>
          <button onClick={() => setModalNovoProdutoAberto(true)} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg shadow transition-colors text-sm font-medium">
            <Plus size={20} /> Novo Produto
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button onClick={() => setAbaAtiva('lista')} className={`pb-3 px-2 flex items-center gap-2 font-medium text-sm transition-all border-b-2 ${abaAtiva === 'lista' ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
          <List size={18} /> Lista
        </button>
        <button onClick={() => setAbaAtiva('historico')} className={`pb-3 px-2 flex items-center gap-2 font-medium text-sm transition-all border-b-2 ${abaAtiva === 'historico' ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
          <History size={18} /> Histórico
        </button>
      </div>

      {abaAtiva === 'lista' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50/50 border-b border-gray-100">
            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input type="text" placeholder="Buscar produto..." className="w-full pl-10 pr-4 py-2 bg-white border rounded-lg text-sm outline-none focus:border-rose-400" onChange={(e) => setTermoBusca(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                <tr>
                  <th className="p-4">Produto</th>
                  <th className="p-4 text-center">Qtd Atual</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Preço Médio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {carregando ? <tr><td colSpan="4" className="p-10 text-center">Carregando...</td></tr> : 
                  produtosFiltrados.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="p-4 font-medium text-gray-700">
                        {p.nome}
                        <div className="text-[10px] text-gray-400">{p.categoria}</div>
                      </td>
                      <td className="p-4 text-center font-bold">{p.qtd} {p.unidade}s</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${p.qtd <= p.min ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {p.qtd <= p.min ? 'Estoque Baixo' : 'Ok'}
                        </span>
                      </td>
                      <td className="p-4 text-right text-gray-500">R$ {p.precoMedio.toFixed(2)}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                <tr>
                  <th className="p-4">Data</th>
                  <th className="p-4">Produto</th>
                  <th className="p-4">Fornecedor</th>
                  <th className="p-4 text-center">Qtd</th>
                  <th className="p-4 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {historico.map(h => (
                  <tr key={h.id}>
                    <td className="p-4 text-gray-500 text-xs">{new Date(h.data).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4">
                      <div className="font-medium">{h.produto?.nome}</div>
                      <div className="text-[10px] text-gray-400">Lote: {h.lote || '-'}</div>
                    </td>
                    <td className="p-4 text-gray-600">{h.fornecedor || '-'}</td>
                    <td className="p-4 text-center font-bold text-emerald-600">+{h.qtd}</td>
                    <td className="p-4 text-right font-medium">R$ {(h.qtd * h.valorUnitario).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL ENTRADA */}
      {modalEntradaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Dar Entrada</h2>
              <button onClick={() => setModalEntradaAberto(false)}><X size={20} /></button>
            </div>
            <form className="space-y-4" onSubmit={registrarEntrada}>
              <Select options={opcoesProdutos} value={produtoIdEntrada} onChange={setProdutoIdEntrada} placeholder="Produto..." />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" value={qtdEntrada} onChange={e => setQtdEntrada(e.target.value)} className="w-full p-2.5 bg-gray-50 border rounded-lg" placeholder="Quantidade" required />
                <input type="number" step="0.01" value={custoEntrada} onChange={e => setCustoEntrada(e.target.value)} className="w-full p-2.5 bg-gray-50 border rounded-lg" placeholder="Custo Unitário (R$)" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={loteEntrada} onChange={e => setLoteEntrada(e.target.value)} className="w-full p-2.5 bg-gray-50 border rounded-lg" placeholder="Lote" />
                <input type="date" value={validadeEntrada} onChange={e => setValidadeEntrada(e.target.value)} className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm" />
              </div>
              <input type="text" value={fornecedorEntrada} onChange={e => setFornecedorEntrada(e.target.value)} className="w-full p-2.5 bg-gray-50 border rounded-lg" placeholder="Fornecedor" />
              <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-lg font-bold">Confirmar Entrada</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO PRODUTO */}
      {/* MODAL NOVO PRODUTO CORRIGIDO */}
      {modalNovoProdutoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-800">Cadastrar Novo Produto</h2>
              <button onClick={() => setModalNovoProdutoAberto(false)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <form className="space-y-4" onSubmit={salvarNovoProduto}>
              {/* Nome do Produto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                <input 
                  type="text" 
                  value={nomeNovo} 
                  onChange={e => setNomeNovo(e.target.value)} 
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400" 
                  placeholder="Ex: Toxina Botulínica" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select 
                    value={categoriaNovo} 
                    onChange={e => setCategoriaNovo(e.target.value)} 
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400"
                  >
                    <option value="Injetáveis">Injetáveis</option>
                    <option value="Preenchedores">Preenchedores</option>
                    <option value="Descartáveis">Descartáveis</option>
                  </select>
                </div>
                
                {/* Unidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidade de Medida</label>
                  <select 
                    value={unidadeNovo} 
                    onChange={e => setUnidadeNovo(e.target.value)} 
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400"
                  >
                    <option value="unidade">unidade</option>
                    <option value="frasco">frasco</option>
                    <option value="seringa">seringa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Estoque Mínimo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Mínimo</label>
                  <input 
                    type="number" 
                    value={minNovo} 
                    onChange={e => setMinNovo(e.target.value)} 
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400" 
                    placeholder="Avisar com..." 
                    required 
                  />
                </div>
                
                {/* Preço Médio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço Médio (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={precoMedioNovo} 
                    onChange={e => setPrecoMedioNovo(e.target.value)} 
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400" 
                    placeholder="0,00" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-colors shadow-lg mt-2"
              >
                Salvar no Catálogo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}