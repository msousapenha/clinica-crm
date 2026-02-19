import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Download, X, Calendar as CalendarIcon } from 'lucide-react';
import Select from 'react-select';
import { format, isWithinInterval, parse } from 'date-fns';

export default function Financeiro() {
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoLancamento, setTipoLancamento] = useState('entrada');

  // --- ESTADOS PARA FILTRO DE DATA ---
  // Iniciamos com o mês de Fevereiro de 2026 como padrão (conforme seu projeto)
  const [dataInicio, setDataInicio] = useState('2026-02-01');
  const [dataFim, setDataFim] = useState('2026-02-28');

  // --- DADOS MOCKADOS (Simulando Banco de Dados) ---
  const [transacoes, setTransacoes] = useState([
    { id: 1, data: '2026-02-16', descricao: 'Limpeza de Pele - Ana Silva', categoria: 'Procedimento', valor: 150.00, tipo: 'entrada' },
    { id: 2, data: '2026-02-16', descricao: 'Compra de Luvas', categoria: 'Insumos', valor: 85.90, tipo: 'saida' },
    { id: 3, data: '2026-02-15', descricao: 'Toxina Botulínica - Carla Mendes', categoria: 'Procedimento', valor: 1200.00, tipo: 'entrada' },
    { id: 4, data: '2026-02-10', descricao: 'Aluguel Sala', categoria: 'Fixo', valor: 1500.00, tipo: 'saida' },
  ]);

  // --- LÓGICA DE FILTRAGEM E CÁLCULO ---
  const transacoesFiltradas = transacoes.filter(t => {
    const dataTransacao = t.data; 
    return dataTransacao >= dataInicio && dataTransacao <= dataFim;
  });

  const totalEntradas = transacoesFiltradas
    .filter(t => t.tipo === 'entrada')
    .reduce((acc, t) => acc + t.valor, 0);

  const totalSaidas = transacoesFiltradas
    .filter(t => t.tipo === 'saida')
    .reduce((acc, t) => acc + t.valor, 0);

  const lucroLiquido = totalEntradas - totalSaidas;

  // Estilos e Opções (conforme anteriores)
  const categoriasEntrada = [{ value: 'procedimento', label: 'Procedimento Estético' }];
  const categoriasSaida = [{ value: 'insumos', label: 'Insumos' }];
  const selectStyles = { control: (base) => ({ ...base, backgroundColor: '#f9fafb', borderRadius: '0.5rem' }) };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-800">Fluxo de Caixa</h1>
        </div>

        {/* FILTRO DE DATAS (DE/ATÉ) */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 px-2">
            <CalendarIcon size={16} className="text-gray-400" />
            <input 
              type="date" 
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="text-xs font-medium outline-none border-none bg-transparent"
            />
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-2 px-2">
            <input 
              type="date" 
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="text-xs font-medium outline-none border-none bg-transparent"
            />
          </div>
        </div>

        <button 
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg shadow transition-colors text-sm font-medium"
        >
          <Plus size={20} /> Novo Lançamento
        </button>
      </div>

      {/* CARDS DINÂMICOS (Calculam conforme o filtro de data) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-emerald-500">
          <div className="text-emerald-600 mb-1 flex items-center gap-2 italic text-sm">
            <TrendingUp size={16}/> Entradas no período
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {totalEntradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-rose-500">
          <div className="text-rose-600 mb-1 flex items-center gap-2 italic text-sm">
            <TrendingDown size={16}/> Saídas no período
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {totalSaidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>

        <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 ${lucroLiquido >= 0 ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
          <div className="text-blue-600 mb-1 flex items-center gap-2 italic text-sm">
            <DollarSign size={16}/> Lucro do Período
          </div>
          <p className={`text-2xl font-bold ${lucroLiquido >= 0 ? 'text-gray-800' : 'text-rose-600'}`}>
            {lucroLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>

      {/* TABELA DE RESULTADOS FILTRADOS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Detalhamento dos Lançamentos</h3>
          <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-bold">
            {transacoesFiltradas.length} REGISTROS
          </span>
        </div>
        <table className="w-full text-left">
          <tbody className="divide-y divide-gray-100">
            {transacoesFiltradas.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="p-4 text-xs text-gray-400 font-mono">
                  {format(parse(t.data, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')}
                </td>
                <td className="p-4 text-sm font-medium text-gray-700 group-hover:text-rose-600 transition-colors">
                  {t.descricao}
                </td>
                <td className="p-4">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-tighter">
                    {t.categoria}
                  </span>
                </td>
                <td className={`p-4 text-sm text-right font-bold ${t.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.tipo === 'entrada' ? '+ ' : '- '}
                  {t.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
            ))}
            {transacoesFiltradas.length === 0 && (
              <tr>
                <td colSpan="4" className="p-10 text-center text-gray-400 italic text-sm">
                  Nenhum lançamento encontrado para este período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL COM SELECT BOXES */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Novo Lançamento</h2>
              <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-gray-700 p-1"><X size={20}/></button>
            </div>
            
            <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setModalAberto(false); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Lançamento</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button" 
                    onClick={() => setTipoLancamento('entrada')}
                    className={`py-2 border-2 rounded-lg font-bold text-sm transition-all ${tipoLancamento === 'entrada' ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-gray-100 text-gray-400'}`}
                  >
                    Receita (+)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setTipoLancamento('saida')}
                    className={`py-2 border-2 rounded-lg font-bold text-sm transition-all ${tipoLancamento === 'saida' ? 'border-rose-500 text-rose-600 bg-rose-50' : 'border-gray-100 text-gray-400'}`}
                  >
                    Despesa (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                {/* SELECT BOX PARA CATEGORIAS */}
                <Select 
                  options={tipoLancamento === 'entrada' ? categoriasEntrada : categoriasSaida}
                  styles={selectStyles}
                  placeholder="Selecione a categoria..."
                  isSearchable
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input type="text" placeholder="Ex: Botox facial - Ana" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                  <input type="number" placeholder="0,00" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rose-400 font-bold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input type="date" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm" />
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-3 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-900 shadow-lg transition-all">
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}