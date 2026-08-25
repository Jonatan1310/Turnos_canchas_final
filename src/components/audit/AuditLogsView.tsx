import React from "react";
import { History, Shield, Clock, User } from "lucide-react";
import { useApp } from "../../context/AppContext";

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            Registro de Auditoría de Cambios
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Historial cronológico con timestamp de todas las reservas,
            modificaciones y cancelaciones.
          </p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Fecha & Hora</th>
                <th className="p-4">Usuario</th>
                <th className="p-4">Acción</th>
                <th className="p-4">Entidad</th>
                <th className="p-4">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Sin registros de auditoría aún.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                  >
                    <td className="p-4 text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString("es-ES")}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      <span>{log.userName}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          log.action.includes("CREATE")
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : log.action.includes("CANCEL")
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {log.entity} #{log.entityId.substring(0, 6)}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
