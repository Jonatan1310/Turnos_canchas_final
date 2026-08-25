import React from "react";
import {
  BarChart3,
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  Calendar,
  PieChart as PieIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useApp } from "../../context/AppContext";
import { exportBookingsToCSV, printBookingsReport } from "../../lib/export";

export const ReportsView: React.FC = () => {
  const { bookings, courts, courtTypes } = useApp();

  // Revenue by Court
  const courtRevenueData = courts.map((court) => {
    const revenue = bookings
      .filter((b) => b.courtId === court.id && b.status !== "CANCELLED")
      .reduce((sum, b) => sum + b.totalPrice, 0);
    return { name: court.name, Ingresos: revenue };
  });

  // Revenue by Sport
  const sportRevenueData = courtTypes.map((ct) => {
    const sportCourts = courts
      .filter((c) => c.typeId === ct.id)
      .map((c) => c.id);
    const revenue = bookings
      .filter(
        (b) => sportCourts.includes(b.courtId) && b.status !== "CANCELLED",
      )
      .reduce((sum, b) => sum + b.totalPrice, 0);
    return { name: ct.name, value: revenue };
  });

  // Status Distribution
  const statusData = [
    {
      name: "Confirmados",
      value: bookings.filter((b) => b.status === "CONFIRMED").length,
    },
    {
      name: "Reservados",
      value: bookings.filter((b) => b.status === "RESERVED").length,
    },
    {
      name: "Cancelados",
      value: bookings.filter((b) => b.status === "CANCELLED").length,
    },
  ];

  const COLORS = ["#10b981", "#f59e0b", "#f43f5e"];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Reportes, Estadísticas y Exportación
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Análisis de facturación por cancha, deporte, tasa de ocupación e
            impresiones.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportBookingsToCSV(bookings, courts)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV / Excel</span>
          </button>
          <button
            onClick={() => printBookingsReport(bookings, courts)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir PDF</span>
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue by Court */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Ingresos Totales por Cancha ($)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courtRevenueData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    color: "#fff",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="Ingresos" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Breakdown Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-emerald-600" />
            Distribución de Turnos por Estado
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    color: "#fff",
                    borderRadius: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs font-semibold">
            {statusData.map((s, idx) => (
              <span
                key={s.name}
                className="flex items-center gap-1.5"
                style={{ color: COLORS[idx] }}
              >
                ● {s.name}: {s.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
