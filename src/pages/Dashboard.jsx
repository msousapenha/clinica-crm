import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Users, Calendar, DollarSign, Award, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { startOfMonth, endOfMonth, subMonths, format, parseISO, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = useAuth();

  // Estados dos Dados
  const [kpis, setKpis] = useState({ pacientes: 0, agendamentos: 0, faturamento: 0, ticket: 0 });
  const [dadosMensais, setDadosMensais] = useState([]);
  const [dadosProcedimentos, setDadosProcedimentos] = useState([]);
  const [produtosBaixoEstoque, setProdutosBaixoEstoque] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const CORES = ['#e11d48', '#fb7185', '#fda4af', '#fff1f2', '#f472b6', '#db2777'];

  useEffect(() => {
    carregarDashboard();
  }, []);

  const carregarDashboard = async () => {
    try {
      setCarregando(true);
      const headers = { 'Authorization': `Bearer ${token}` };

      // Definindo datas para buscar histórico de 6 meses
      const hoje = new Date();
      const seisMesesAtras = subMonths(hoje, 5);
      const inicioBusca = startOfMonth(seisMesesAtras).toISOString().split('T')[0];
      const fimBusca = endOfMonth(hoje).toISOString().split('T')[0];

      // BUSCA PARALELA DE TODOS OS DADOS
      const [resPacientes, resAgendamentos, resFinanceiro, resEstoque] = await Promise.all([
        fetch(`${API_URL}/pacientes`, { headers }),
        fetch(`${API_URL}/agendamentos?inicio=${startOfMonth(hoje).toISOString()}&fim=${endOfMonth(hoje).toISOString()}`, { headers }), // Só do mês atual para KPI
        fetch(`${API_URL}/financeiro?inicio=${inicioBusca}&fim=${fimBusca}`, { headers }), // 6 meses para o gráfico
        fetch(`${API_URL}/estoque/produtos`, { headers })
      ]);

      const pacientes = resPacientes.ok ? await resPacientes.json() : [];
      const agendamentosMes = resAgendamentos.ok ? await resAgendamentos.json() : [];
      const financeiro = resFinanceiro.ok ? await resFinanceiro.json() : [];
      const produtos = resEstoque.ok ? await resEstoque.json() : [];

      // 1. PROCESSAR KPIS (Cards do Topo)
      const totalPacientes = pacientes.length;
      const totalAgendamentos = agendamentosMes.length;
      
      // Filtra transações APENAS do mês atual para o card de Faturamento
      const transacoesMesAtual = financeiro.filter(t => isSameMonth(parseISO(t.data), hoje));
      const faturamentoMes = transacoesMesAtual
        .filter(t => t.tipo === 'RECEITA')
        .reduce((acc, t) => acc + t.valor, 0);

      const ticketMedio = totalAgendamentos > 0 ? (faturamentoMes / totalAgendamentos) : 0;

      setKpis({
        pacientes: totalPacientes,
        agendamentos: totalAgendamentos,
        faturamento: faturamentoMes,
        ticket: ticketMedio
      });

      // 2. PROCESSAR ALERTA DE ESTOQUE
      const estoqueCritico = produtos.filter(p => p.qtd <= p.min);
      setProdutosBaixoEstoque(estoqueCritico);

      // 3. PROCESSAR GRÁFICO DE BARRAS (Últimos 6 meses)
      const dadosGraficoBarras = [];
      for (let i = 5; i >= 0; i--) {
        const dataRef = subMonths(hoje, i);
        const mesStr = format(dataRef, 'MMM', { locale: ptBR }); // Ex: "Fev"
        
        // Filtra transações daquele mês específico
        const transacoesDoMes = financeiro.filter(t => isSameMonth(parseISO(t.data), dataRef));
        
        const entradas = transacoesDoMes.filter(t => t.tipo === 'RECEITA').reduce((acc, t) => acc + t.valor, 0);
        const saidas = transacoesDoMes.filter(t => t.tipo === 'DESPESA').reduce((acc, t) => acc + t.valor, 0);

        dadosGraficoBarras.push({
            name: mesStr.charAt(0).toUpperCase() + mesStr.slice(1), // Capitaliza (fev -> Fev)
            entradas,
            saidas
        });
      }
      setDadosMensais(dadosGraficoBarras);

      // 4. PROCESSAR GRÁFICO DE PIZZA (Distribuição de Procedimentos - Receita Total)
      // Agrupa receitas por nome do procedimento (Limpando o nome do paciente da string)
      const mapaProcedimentos = {};
      
      financeiro
        .filter(t => t.categoria === 'PROCEDIMENTO' && t.tipo === 'RECEITA')
        .forEach(t => {
          // A string vem como "Botox - Nome Paciente". Vamos pegar só o "Botox"
          const nomeProcedimento = t.descricao.split(' - ')[0] || 'Outros';
          
          if (!mapaProcedimentos[nomeProcedimento]) {
            mapaProcedimentos[nomeProcedimento] = 0;
          }
          mapaProcedimentos[nomeProcedimento] += t.valor;
        });

      const dadosPizza = Object.keys(mapaProcedimentos).map(key => ({
        name: key,
        value: mapaProcedimentos[key]
      }));
      
      // Ordena por valor e pega os top 5, agrupa o resto em "Outros" se precisar (opcional)
      setDadosProcedimentos(dadosPizza);

    } catch (erro) {
      console.error("Erro ao carregar dashboard:", erro);
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return <div className="flex h-screen items-center justify-center text-gray-400">Carregando indicadores...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-800">Painel de Performance</h1>
        <p className="text-sm text-gray-500">Visão geral em tempo real</p>
      </div>

      {/* ALERTA DE ESTOQUE BAIXO */}
      {produtosBaixoEstoque.length > 0 && (
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm animate-in slide-in-from-top-2">
          <div className="bg-amber-100 p-2 rounded-xl text-amber-600 mt-1 shadow-sm">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-amber-900 mb-1">Atenção: Estoque Baixo</h3>
            <p className="text-sm text-amber-700 mb-3">Os seguintes itens atingiram a quantidade mínima e precisam de reposição:</p>
            <div className="flex gap-3 flex-wrap">
              {produtosBaixoEstoque.map(p => (
                <span key={p.id} className="bg-white border border-amber-200 text-amber-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  {p.nome} • Restam: {p.qtd}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <CardResumo 
          title="Total Pacientes" 
          value={kpis.pacientes} 
          icon={<Users size={20} />} 
          color="bg-blue-500" 
        />
        <CardResumo 
          title="Agendamentos (Mês)" 
          value={kpis.agendamentos} 
          icon={<Calendar size={20} />} 
          color="bg-purple-500" 
        />
        <CardResumo 
          title="Faturamento (Mês)" 
          value={kpis.faturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
          icon={<TrendingUp size={20} />} 
          color="bg-emerald-500" 
        />
        <CardResumo 
          title="Ticket Médio" 
          value={kpis.ticket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
          icon={<Award size={20} />} 
          color="bg-amber-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GRÁFICO DE BARRAS: ENTRADAS VS SAÍDAS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">Fluxo Financeiro (6 Meses)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosMensais}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(value) => `R$ ${value}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="entradas" fill="#10b981" radius={[4, 4, 0, 0]} name="Receitas" />
                <Bar dataKey="saidas" fill="#e11d48" radius={[4, 4, 0, 0]} name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO DE PIZZA: PROCEDIMENTOS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">Receita por Procedimento</h3>
          <div className="h-80 w-full">
            {dadosProcedimentos.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosProcedimentos} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="name">
                    {dadosProcedimentos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 italic">
                Sem dados de procedimentos no período.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CardResumo({ title, value, icon, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`${color} p-3 rounded-xl text-white shadow-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{title}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}