"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Activity, Target, Loader2, PieChart as PieChartIcon, BarChart as BarChartIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { getGlobalStats } from "@/app/actions/admin-actions";

export const AdminHomeView = () => {
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalSpecialists: number;
    graphData: any[];
    roleDistribution: any[];
    specialistStatus: any[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getGlobalStats();
        if (data) {
          setStats(data);
        }
      } catch (e) {
        console.error("Failed to load global stats", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FE] dark:bg-slate-950">
        <Loader2 className="w-10 h-10 text-[#928EFF] animate-spin" />
      </div>
    );
  }

  // Fallback seguro si falla
  const displayData = stats?.graphData || [
    { name: 'LUN', usuarios: 0, psicologos: 0 },
    { name: 'MAR', usuarios: 0, psicologos: 0 },
    { name: 'MIÉ', usuarios: 0, psicologos: 0 },
    { name: 'JUE', usuarios: 0, psicologos: 0 },
    { name: 'VIE', usuarios: 0, psicologos: 0 },
    { name: 'SÁB', usuarios: 0, psicologos: 0 },
    { name: 'DOM', usuarios: 0, psicologos: 0 },
  ];

  return (
    <div className="flex flex-col p-6 bg-[#F8F9FE] dark:bg-slate-950 min-h-full">
      <header className="mb-8 pt-6">
        <h1 className="text-3xl font-black text-zinc-800 dark:text-white uppercase italic tracking-tight">Inicio</h1>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Resumen Global de Plataforma</p>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#928EFF] text-white rounded-3xl p-5 shadow-xl shadow-[#928EFF]/20"
        >
          <Users className="w-6 h-6 mb-3 opacity-80" />
          <h3 className="text-[10px] font-black uppercase tracking-widest opacity-80">Usuarios</h3>
          <p className="text-3xl font-black mt-1">{stats?.totalUsers || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 dark:bg-zinc-800 text-white rounded-3xl p-5 shadow-xl"
        >
          <Activity className="w-6 h-6 mb-3 opacity-80 text-emerald-400" />
          <h3 className="text-[10px] font-black uppercase tracking-widest opacity-80">Psicólogos Verificados</h3>
          <p className="text-3xl font-black mt-1">{stats?.totalSpecialists || 0}</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xl border border-zinc-100 dark:border-white/5"
      >
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-4 h-4 text-[#928EFF]" />
          <h2 className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest">Actividad_Semanal_Registros</h2>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#928EFF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#928EFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.1} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} dy={10} />
              <Tooltip
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#888', fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="usuarios"
                stroke="#928EFF"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorUsers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 mt-4 mb-24">
        {/* Gráfico 2: Torta de Roles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xl border border-zinc-100 dark:border-white/5"
        >
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-4 h-4 text-[#928EFF]" />
            <h2 className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest">Distribución</h2>
          </div>
          <div className="h-32 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.roleDistribution?.some(r => r.value > 0)
                    ? stats.roleDistribution
                    : [{ name: "Sin datos", value: 1, fill: "#27272a" }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {(stats?.roleDistribution?.some(r => r.value > 0)
                    ? stats.roleDistribution
                    : [{ name: "Sin datos", value: 1, fill: "#27272a" }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {(!stats?.roleDistribution || !stats.roleDistribution.some(r => r.value > 0)) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[9px] font-mono text-zinc-500 uppercase">Vacío</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Gráfico 3: Barras Horizontales de Estados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xl border border-zinc-100 dark:border-white/5"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChartIcon className="w-4 h-4 text-[#928EFF]" />
            <h2 className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest">Estados</h2>
          </div>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.specialistStatus || [
                { name: "Aprobados", count: 0, fill: "#34d399" },
                { name: "Pendientes", count: 0, fill: "#f59e0b" },
                { name: "Rechazados", count: 0, fill: "#ef4444" },
              ]} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis type="number" hide domain={[0, 'dataMax + 2']} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#888' }} width={60} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12} minPointSize={2}>
                  {(stats?.specialistStatus || [
                    { name: "Aprobados", count: 0, fill: "#34d399" },
                    { name: "Pendientes", count: 0, fill: "#f59e0b" },
                    { name: "Rechazados", count: 0, fill: "#ef4444" },
                  ]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
      <div className="h-32 w-full shrink-0" aria-hidden="true" />
    </div>
  );
};
