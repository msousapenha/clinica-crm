import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Users, Calendar, DollarSign, Award, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const dadosMensais = [
    { name: 'Set', entradas: 4000, saidas: 2400 },
    { name: 'Out', entradas: 3000, saidas: 1398 },
    { name: 'Nov', entradas: 2000, saidas: 9800 },
    { name: 'Dez', entradas: 2780, saidas: 3908 },
    { name: 'Jan', entradas: 1890, saidas: 4800 },
    { name: 'Fev', entradas: 6390, saidas: 3800 },
  ];

  const dadosProcedimentos = [
    { name: 'Botox', value: 400 },
    { name: 'Limpeza de Pele', value: 300 },
    { name: 'Preenchimento', value: 200 },
    { name: 'Microagulhamento', value: 100 },
  ];

  const CORES = ['#e11d48', '#fb7185', '#fda4af', '#fff1f2'];

  // SIMULAÇÃO DO ESTADO DE ALERTA DO ESTOQUE
  const produtosBaixoEstoque = [
    { id: 1, nome: 'Toxina Botulínica 100U', qtd: 2, min: 3 },
    { id: 2, nome: 'Ácido Hialurônico 1ml', qtd: 4, min: 5 }
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-800">Painel de Performance</h1>
        <p className="text-sm text-gray-500">Visão geral do Instituto Fernanda Rocha</p>
      </div>

      {/* NOVO: ALERTA DE ESTOQUE BAIXO */}
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

      {/* CARDS DE RESUMO RÁPIDO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <CardResumo title="Total Pacientes" value="128" icon={<Users size={20} />} color="bg-blue-500" />
        <CardResumo title="Agendamentos/Mês" value="42" icon={<Calendar size={20} />} color="bg-purple-500" />
        <CardResumo title="Faturamento Fev" value="R$ 6.390" icon={<TrendingUp size={20} />} color="bg-emerald-500" />
        <CardResumo title="Ticket Médio" value="R$ 450" icon={<Award size={20} />} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GRÁFICO DE BARRAS: ENTRADAS VS SAÍDAS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">Fluxo Financeiro Mensal</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosMensais}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="entradas" fill="#e11d48" radius={[4, 4, 0, 0]} name="Receitas" />
                <Bar dataKey="saidas" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO DE PIZZA: PROCEDIMENTOS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">Distribuição de Serviços</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dadosProcedimentos} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {dadosProcedimentos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardResumo({ title, value, icon, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
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