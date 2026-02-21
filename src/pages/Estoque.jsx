import React, { useState } from 'react';
import { Package, Plus, AlertTriangle, ArrowUpRight, Search, X, History, List } from 'lucide-react';
import Select from 'react-select';

export default function Estoque() {
  const [abaAtiva, setAbaAtiva] = useState('lista');
  const [modalEntradaAberto, setModalEntradaAberto] = useState(false);
  const [modalNovoProdutoAberto, setModalNovoProdutoAberto] = useState(false); // NOVO ESTADO AQUI
  const [termoBusca, setTermoBusca] = useState('');

  // --- DADOS MOCKADOS ---
  const produtos = [
    { id: 1, nome: 'Toxina Botulínica 100U', categoria: 'Injetáveis', qtd: 5, min: 3, unidade: 'frasco', preco: 650.00 },
    { id: 2, nome: 'Ácido Hialurônico 1ml', categoria: 'Preenchedores', qtd: 2, min: 5, unidade: 'seringa', preco: 420.00 },
  ];

  const historicoCompras = [
    { id: 1, data: '18/02/2026', produto: 'Toxina Botulínica 100U', qtd: 10, valorUnitario: 610.00, fornecedor: 'Allergan Brasil', lote: 'ABC1234' },
    { id: 2, data: '10/02/2026', produto: 'Luvas de Nitrilo', qtd: 20, valorUnitario: 38.00, fornecedor: 'Dental Cremer', lote: 'LOT9988' },
  ];

  const opcoesProdutos = produtos.map(p => ({ value: p.id, label: p.nome }));

  const selectStyles = {
    control: (base) => ({ ...base, backgroundColor: '#f9fafb', borderRadius: '0.5rem', borderColor: '#e5e7eb' })
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-800">Controle de Estoque</h1>
          <p className="text-sm text-gray-500">Gestão de insumos da clinica</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setModalEntradaAberto(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg shadow transition-colors text-sm font-medium"
          >
            <ArrowUpRight size={18} /> Dar Entrada
          </button>

          {/* BOTÃO NOVO PRODUTO ATIVADO */}
          <button
            onClick={() => setModalNovoProdutoAberto(true)}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg shadow transition-colors text-sm font-medium"
          >
            <Plus size={20} /> Novo Produto
          </button>
        </div>
      </div>

      {/* SELETOR DE ABAS */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setAbaAtiva('lista')}
          className={`pb-3 px-2 flex items-center gap-2 font-medium text-sm transition-all border-b-2 ${abaAtiva === 'lista' ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <List size={18} /> Lista de Produtos
        </button>
        <button
          onClick={() => setAbaAtiva('historico')}
          className={`pb-3 px-2 flex items-center gap-2 font-medium text-sm transition-all border-b-2 ${abaAtiva === 'historico' ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <History size={18} /> Histórico de Entradas
        </button>
      </div>

      {abaAtiva === 'lista' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
              <div className="relative w-72">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar no estoque..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-rose-400"
                  onChange={(e) => setTermoBusca(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap min-w-[600px]">
                <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="p-4">Produto</th>
                    <th className="p-4 text-center">Quantidade</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Preço Médio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {produtos.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="p-4 font-medium text-gray-700">{p.nome}</td>
                      <td className="p-4 text-center font-bold">{p.qtd} {p.unidade}s</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${p.qtd <= p.min ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {p.qtd <= p.min ? 'Baixo' : 'Ok'}
                        </span>
                      </td>
                      <td className="p-4 text-right text-gray-500">R$ {p.preco.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ABA: HISTÓRICO DE COMPRAS */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-right-2 duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap min-w-[600px]">
              <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                <tr>
                  <th className="p-4">Data</th>
                  <th className="p-4">Produto</th>
                  <th className="p-4">Fornecedor</th>
                  <th className="p-4 text-center">Qtd</th>
                  <th className="p-4 text-right">Custo Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {historicoCompras.map(h => (
                  <tr key={h.id}>
                    <td className="p-4 text-gray-500 font-mono text-xs">{h.data}</td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{h.produto}</div>
                      <div className="text-[10px] text-gray-400 uppercase">Lote: {h.lote}</div>
                    </td>
                    <td className="p-4 text-gray-600">{h.fornecedor}</td>
                    <td className="p-4 text-center font-bold text-emerald-600">+{h.qtd}</td>
                    <td className="p-4 text-right font-medium">R$ {(h.qtd * h.valorUnitario).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* MODAL 1: DAR ENTRADA (MANTIDO)                       */}
      {/* ================================================== */}
      {modalEntradaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Dar Entrada no Estoque</h2>
              <button onClick={() => setModalEntradaAberto(false)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setModalEntradaAberto(false); alert("Entrada registrada!"); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selecionar Produto</label>
                <Select options={opcoesProdutos} styles={selectStyles} placeholder="Procure o produto..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                  <input type="number" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-emerald-500" placeholder="0" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custo Unitário (R$)</label>
                  <input type="number" step="0.01" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-emerald-500" placeholder="0,00" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lote</label>
                  <input type="text" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-emerald-500" placeholder="Ex: AB123" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Validade</label>
                  <input type="date" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 text-sm" required />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalEntradaAberto(false)} className="flex-1 py-3 text-gray-500 font-medium hover:bg-gray-50 rounded-lg transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-lg transition-all">Registrar Compra</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* MODAL 2: NOVO PRODUTO (NOVO!)                        */}
      {/* ================================================== */}
      {modalNovoProdutoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Cadastrar Novo Produto</h2>
              <button onClick={() => setModalNovoProdutoAberto(false)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>

            <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setModalNovoProdutoAberto(false); alert("Produto adicionado ao catálogo!"); }}>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                <input type="text" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400" placeholder="Ex: Fios de PDO" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400 text-sm">
                    <option>Injetáveis</option>
                    <option>Preenchedores</option>
                    <option>Fios de Sustentação</option>
                    <option>Descartáveis</option>
                    <option>Limpeza / Higiene</option>
                    <option>Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidade de Medida</label>
                  <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400 text-sm">
                    <option>frasco</option>
                    <option>seringa</option>
                    <option>caixa</option>
                    <option>unidade</option>
                    <option>litro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Mínimo (Alerta)</label>
                  <input type="number" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400" placeholder="Ex: 5" required />
                  <p className="text-[10px] text-gray-400 mt-1">Avisa quando chegar neste valor.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço Médio Estimado</label>
                  <input type="number" step="0.01" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400" placeholder="R$ 0,00" />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalNovoProdutoAberto(false)} className="flex-1 py-3 text-gray-500 font-medium hover:bg-gray-50 rounded-lg transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 shadow-lg transition-all">Salvar Produto</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}