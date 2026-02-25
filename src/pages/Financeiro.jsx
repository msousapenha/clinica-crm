import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar as CalendarIcon, Filter } from 'lucide-react';
import Select from 'react-select';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

export default function Financeiro() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = useAuth();

  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  // Filtros de Data (Padrão: Mês Atual)
  const hoje = new Date();
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];

  const [dataInicio, setDataInicio] = useState(primeiroDia);
  const [dataFim, setDataFim] = useState(ultimoDia);

  // Formulário Manual
  const [tipoLancamento, setTipoLancamento] = useState('DESPESA'); // Padrão Despesa (já que receitas vêm automático)
  const [descManual, setDescManual] = useState('');
  const [valorManual, setValorManual] = useState('');
  const [catManual, setCatManual] = useState({ value: 'FIXO', label: 'Custo Fixo (Aluguel, Luz...)' });
  const [dataManual, setDataManual] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    carregarTransacoes();
  }, [dataInicio, dataFim]); // Recarrega se mudar a data

  const carregarTransacoes = async () => {
    try {
      setCarregando(true);
      const res = await fetch(`${API_URL}/financeiro?inicio=${dataInicio}&fim=${dataFim}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setTransacoes(await res.json());
      }
    } catch (error) { console.error(error); } 
    finally { setCarregando(false); }
  };

  const salvarLancamentoManual = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/financeiro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          descricao: descManual,
          valor: valorManual,
          tipo: tipoLancamento,
          categoria: catManual.value,
          data: dataManual
        })
      });

      if (res.ok) {
        setModalAberto(false);
        carregarTransacoes();
        // Reset
        setDescManual(''); setValorManual('');
      }
    } catch (error) { alert("Erro ao salvar"); }
  };

  // Cálculos
  const totalEntradas = transacoes.filter(t => t.tipo === 'RECEITA').reduce((acc, t) => acc + t.valor, 0);
  const totalSaidas = transacoes.filter(t => t.tipo === 'DESPESA').reduce((acc, t) => acc + t.valor, 0);
  const lucro = totalEntradas - totalSaidas;

  const opcoesDespesa = [
    { value: 'FIXO', label: 'Custo Fixo (Aluguel, Energia)' },
    { value: 'IMPOSTO', label: 'Impostos / Taxas' },
    { value: 'PESSOAL', label: 'Pagamento de Funcionários' },
    { value: 'OUTROS', label: 'Outras Despesas' }
  ];
  
  const opcoesReceita = [
    { value: 'OUTROS', label: 'Outras Receitas' } // Procedimentos já entram automático
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in">
      
      {/* HEADER + FILTROS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-800">Financeiro</h1>
          <p className="text-sm text-gray-500">Fluxo de caixa consolidado</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <CalendarIcon size={16} className="text-gray-400" />
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="text-sm bg-transparent outline-none" />
            <span className="text-gray-300">até</span>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="text-sm bg-transparent outline-none" />
          </div>
          
          <button onClick={() => setModalAberto(true)} className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg transition-all">
            <Plus size={18}/> Lançar Manual
          </button>
        </div>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-emerald-500">
          <div className="text-emerald-600 mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
            <TrendingUp size={18}/> Receitas
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {totalEntradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-rose-500">
          <div className="text-rose-600 mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
            <TrendingDown size={18}/> Despesas
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {totalSaidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>

        <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${lucro >= 0 ? 'border-l-blue-600' : 'border-l-orange-500'}`}>
          <div className={`${lucro >= 0 ? 'text-blue-600' : 'text-orange-600'} mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider`}>
            <DollarSign size={18}/> Resultado Líquido
          </div>
          <p className={`text-3xl font-bold ${lucro >= 0 ? 'text-gray-800' : 'text-rose-600'}`}>
            {lucro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="p-4">Data</th>
                <th className="p-4">Descrição</th>
                <th className="p-4">Categoria</th>
                <th className="p-4 text-center">Origem</th>
                <th className="p-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {carregando ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Carregando...</td></tr>
              ) : transacoes.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400 italic">Nenhum lançamento neste período.</td></tr>
              ) : (
                transacoes.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="p-4 text-gray-500 font-mono text-xs">
                      {format(parseISO(t.data), 'dd/MM/yyyy')}
                    </td>
                    <td className="p-4 font-medium text-gray-700">{t.descricao}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase">{t.categoria}</span>
                    </td>
                    <td className="p-4 text-center">
                      {t.agendamentoId && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">AGENDA</span>}
                      {t.movimentacaoId && <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded border border-orange-100">ESTOQUE</span>}
                      {!t.agendamentoId && !t.movimentacaoId && <span className="text-[10px] text-gray-400">MANUAL</span>}
                    </td>
                    <td className={`p-4 text-right font-bold ${t.tipo === 'RECEITA' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.tipo === 'RECEITA' ? '+' : '-'} {t.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL MANUAL */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
            <h2 className="text-xl font-bold mb-4">Lançamento Manual</h2>
            <form onSubmit={salvarLancamentoManual} className="space-y-4">
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                <button type="button" onClick={() => setTipoLancamento('RECEITA')} className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${tipoLancamento === 'RECEITA' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}>Receita</button>
                <button type="button" onClick={() => setTipoLancamento('DESPESA')} className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${tipoLancamento === 'DESPESA' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-400'}`}>Despesa</button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Categoria</label>
                <Select options={tipoLancamento === 'RECEITA' ? opcoesReceita : opcoesDespesa} value={catManual} onChange={setCatManual} />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Descrição</label>
                <input type="text" value={descManual} onChange={e => setDescManual(e.target.value)} className="w-full p-2 border rounded-lg" required placeholder={tipoLancamento === 'DESPESA' ? 'Ex: Conta de Luz' : 'Ex: Venda de Produto'} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Valor</label>
                  <input type="number" step="0.01" value={valorManual} onChange={e => setValorManual(e.target.value)} className="w-full p-2 border rounded-lg" required placeholder="0,00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Data</label>
                  <input type="date" value={dataManual} onChange={e => setDataManual(e.target.value)} className="w-full p-2 border rounded-lg" required />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModalAberto(false)} className="flex-1 py-3 text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-900">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}