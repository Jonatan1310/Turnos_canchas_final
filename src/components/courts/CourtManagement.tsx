import React, { useState } from "react";
import {
  Trophy,
  Plus,
  Edit2,
  Trash2,
  Power,
  Wrench,
  ShieldAlert,
  CheckCircle2,
  DollarSign,
  Clock,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Court, CourtType } from "../../types";

export const CourtManagement: React.FC = () => {
  const {
    courts,
    courtTypes,
    bookings,
    addCourt,
    updateCourt,
    deleteCourt,
    toggleCourtActive,
    addCourtType,
    updateCourtType,
    deleteCourtType,
    addMaintenanceBlock,
    removeMaintenanceBlock,
    activeUser,
    formatPrice,
  } = useApp();

  // New Court Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);

  const [name, setName] = useState("");
  const [typeId, setTypeId] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerHour, setPricePerHour] = useState<number>(25000);
  const [weekendSurchargePercent, setWeekendSurchargePercent] =
    useState<number>(20);
  const [nightSurchargeAmount, setNightSurchargeAmount] =
    useState<number>(5000);
  const [openingTime, setOpeningTime] = useState("08:00");
  const [closingTime, setClosingTime] = useState("23:00");
  const [slotDurationMinutes, setSlotDurationMinutes] = useState<
    30 | 60 | 90 | 120
  >(60);

  // Sport Modal (Add & Edit)
  const [isSportModalOpen, setIsSportModalOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<CourtType | null>(null);
  const [newSportName, setNewSportName] = useState("");
  const [newSportDesc, setNewSportDesc] = useState("");
  const [sportError, setSportError] = useState("");

  // Maintenance Modal
  const [maintenanceCourtId, setMaintenanceCourtId] = useState<string | null>(
    null,
  );
  const [maintReason, setMaintReason] = useState(
    "Mantenimiento césped sintético",
  );
  const [maintStartDate, setMaintStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [maintEndDate, setMaintEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [maintStartTime, setMaintStartTime] = useState("08:00");
  const [maintEndTime, setMaintEndTime] = useState("13:00");

  // Delete Confirmation States
  const [sportToDelete, setSportToDelete] = useState<CourtType | null>(null);
  const [courtToDelete, setCourtToDelete] = useState<Court | null>(null);

  const openCreateModal = () => {
    setEditingCourt(null);
    setName("");
    setTypeId(courtTypes.length > 0 ? courtTypes[0].id : "");
    setDescription("");
    setPricePerHour(25000);
    setWeekendSurchargePercent(20);
    setNightSurchargeAmount(5000);
    setOpeningTime("08:00");
    setClosingTime("23:00");
    setSlotDurationMinutes(60);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Court) => {
    setEditingCourt(c);
    setName(c.name);
    setTypeId(c.typeId);
    setDescription(c.description || "");
    setPricePerHour(c.pricePerHour);
    setWeekendSurchargePercent(c.weekendSurchargePercent);
    setNightSurchargeAmount(c.nightSurchargeAmount);
    setOpeningTime(c.openingTime);
    setClosingTime(c.closingTime);
    setSlotDurationMinutes(c.slotDurationMinutes);
    setIsModalOpen(true);
  };

  const handleSaveCourt = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedType = courtTypes.find((ct) => ct.id === typeId);
    const typeName = selectedType ? selectedType.name : "Deporte";

    if (editingCourt) {
      updateCourt(editingCourt.id, {
        name,
        typeId,
        typeName,
        description,
        pricePerHour,
        weekendSurchargePercent,
        nightSurchargeAmount,
        openingTime,
        closingTime,
        slotDurationMinutes,
      });
    } else {
      addCourt({
        name,
        typeId,
        typeName,
        description,
        pricePerHour,
        weekendSurchargePercent,
        nightSurchargeAmount,
        openingTime,
        closingTime,
        slotDurationMinutes,
        isActive: true,
      });
    }

    setIsModalOpen(false);
  };

  const openAddSportModal = () => {
    setEditingSport(null);
    setNewSportName("");
    setNewSportDesc("");
    setSportError("");
    setIsSportModalOpen(true);
  };

  const openEditSportModal = (st: CourtType) => {
    setEditingSport(st);
    setNewSportName(st.name);
    setNewSportDesc(st.description || "");
    setSportError("");
    setIsSportModalOpen(true);
  };

  const handleSaveSport = (e: React.FormEvent) => {
    e.preventDefault();
    setSportError("");
    if (!newSportName.trim()) return;

    if (editingSport) {
      updateCourtType(
        editingSport.id,
        newSportName.trim(),
        newSportDesc.trim(),
      );
    } else {
      addCourtType(newSportName.trim(), newSportDesc.trim());
    }
    setNewSportName("");
    setNewSportDesc("");
    setIsSportModalOpen(false);
  };

  const handlePromptDeleteSport = (sport: CourtType) => {
    setSportToDelete(sport);
  };

  const confirmDeleteSport = () => {
    if (!sportToDelete) return;
    const courtsUsing = courts.filter((c) => c.typeId === sportToDelete.id);
    deleteCourtType(sportToDelete.id, courtsUsing.length > 0);
    setSportToDelete(null);
  };

  const handlePromptDeleteCourt = (court: Court) => {
    setCourtToDelete(court);
  };

  const confirmDeleteCourt = () => {
    if (!courtToDelete) return;
    deleteCourt(courtToDelete.id);
    setCourtToDelete(null);
  };

  const handleAddMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceCourtId) return;
    addMaintenanceBlock(maintenanceCourtId, {
      startDate: maintStartDate,
      endDate: maintEndDate,
      startTime: maintStartTime,
      endTime: maintEndTime,
      reason: maintReason,
    });
    setMaintenanceCourtId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Gestión de Canchas y Deportes
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configurá tarifas, recargos nocturnos, horarios y mantenimientos.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={openAddSportModal}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Deporte</span>
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Cancha</span>
          </button>
        </div>
      </div>

      {/* Sports Management Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Deportes Configurados ({courtTypes.length})
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Administrá los deportes disponibles para tus canchas.
            </p>
          </div>
          <button
            onClick={openAddSportModal}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Deporte</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {courtTypes.map((st) => {
            const count = courts.filter((c) => c.typeId === st.id).length;
            return (
              <div
                key={st.id}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {st.name}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
                      {count} {count === 1 ? "cancha" : "canchas"}
                    </span>
                  </div>
                  {st.description && (
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {st.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-1 mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <button
                    onClick={() => openEditSportModal(st)}
                    className="p-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-semibold flex items-center gap-1 px-2"
                    title="Editar Deporte"
                  >
                    <Edit2 className="w-3 h-3" /> Editar
                  </button>
                  <button
                    onClick={() => handlePromptDeleteSport(st)}
                    className="p-1 rounded-md text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-semibold flex items-center gap-1 px-2 cursor-pointer"
                    title="Eliminar Deporte"
                  >
                    <Trash2 className="w-3 h-3" /> Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Courts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courts.map((court) => (
          <div
            key={court.id}
            className={`bg-white dark:bg-slate-900 rounded-2xl border ${
              court.isActive
                ? "border-slate-200/80 dark:border-slate-800"
                : "border-rose-200 dark:border-rose-900/60 opacity-80"
            } shadow-sm overflow-hidden flex flex-col justify-between`}
          >
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px] uppercase">
                    {court.typeName}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                    {court.name}
                  </h3>
                </div>

                <button
                  onClick={() => toggleCourtActive(court.id)}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                    court.isActive
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                  }`}
                  title={
                    court.isActive ? "Desactivar Cancha" : "Activar Cancha"
                  }
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{court.isActive ? "Activa" : "Inactiva"}</span>
                </button>
              </div>

              {court.description && (
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {court.description}
                </p>
              )}

              {/* Price & Surcharge Details */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Precio base por hora:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {formatPrice(court.pricePerHour, 'admin')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>Recargo fin de semana:</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    +{court.weekendSurchargePercent}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>Recargo nocturno (&gt;20hs):</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    +{formatPrice(court.nightSurchargeAmount, 'admin')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700">
                  <span>Horario & Duración:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {court.openingTime} a {court.closingTime} (
                    {court.slotDurationMinutes}m)
                  </span>
                </div>
              </div>

              {/* Maintenance Blocks if any */}
              {court.maintenanceBlocks &&
                court.maintenanceBlocks.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs space-y-1">
                    <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1 text-[11px]">
                      <Wrench className="w-3 h-3" /> Mantenimiento Programado
                    </span>
                    {court.maintenanceBlocks.map((b) => (
                      <div
                        key={b.id}
                        className="flex justify-between items-center text-[10px] text-amber-900 dark:text-amber-200"
                      >
                        <span>
                          {b.reason} ({b.startDate})
                        </span>
                        <button
                          onClick={() => removeMaintenanceBlock(court.id, b.id)}
                          className="text-rose-600 font-bold hover:underline"
                        >
                          Quitar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* Actions Footer */}
            <div className="p-3 bg-slate-50/80 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => setMaintenanceCourtId(court.id)}
                className="text-amber-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1"
              >
                <Wrench className="w-3.5 h-3.5" /> Bloquear Horario
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openEditModal(court)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  title="Editar Cancha"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handlePromptDeleteCourt(court)}
                  className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 dark:border-rose-900/60 dark:hover:bg-rose-950/40 cursor-pointer"
                  title="Eliminar Cancha"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add/Edit Court */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {editingCourt ? "Editar Cancha" : "Nueva Cancha"}
            </h3>

            <form onSubmit={handleSaveCourt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Nombre de Cancha
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Cancha Azul, Pádel Cristal 1"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Tipo de Deporte
                </label>
                <select
                  value={typeId}
                  onChange={(e) => setTypeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white"
                  required
                >
                  {courtTypes.map((ct) => (
                    <option key={ct.id} value={ct.id}>
                      {ct.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej. Césped sintético 50mm con iluminación LED"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Precio por Hora ($)
                  </label>
                  <input
                    type="number"
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Recargo Fin de Semana (%)
                  </label>
                  <input
                    type="number"
                    value={weekendSurchargePercent}
                    onChange={(e) =>
                      setWeekendSurchargePercent(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Plus Nocturno ($)
                  </label>
                  <input
                    type="number"
                    value={nightSurchargeAmount}
                    onChange={(e) =>
                      setNightSurchargeAmount(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Duración Turno
                  </label>
                  <select
                    value={slotDurationMinutes}
                    onChange={(e) =>
                      setSlotDurationMinutes(Number(e.target.value) as any)
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white"
                  >
                    <option value={60}>60 Minutos (1 Hora - Mínimo)</option>
                    <option value={120}>120 Minutos (2 Horas)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Hora Apertura
                  </label>
                  <input
                    type="time"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Hora Cierre
                  </label>
                  <input
                    type="time"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Sport */}
      {isSportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {editingSport ? "Editar Deporte" : "Agregar Nuevo Deporte / Tipo"}
            </h3>
            <form onSubmit={handleSaveSport} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Nombre (ej. Fútbol 9, Squash, Pádel)
                </label>
                <input
                  type="text"
                  value={newSportName}
                  onChange={(e) => setNewSportName(e.target.value)}
                  placeholder="Ej. Fútbol 9"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Descripción Opcional
                </label>
                <input
                  type="text"
                  value={newSportDesc}
                  onChange={(e) => setNewSportDesc(e.target.value)}
                  placeholder="Ej. Canchas de 30x15m..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSportModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                >
                  {editingSport ? "Guardar Cambios" : "Agregar Deporte"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Maintenance Block */}
      {maintenanceCourtId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-500" /> Bloquear por
              Mantenimiento
            </h3>

            <form onSubmit={handleAddMaintenance} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Motivo / Razón
                </label>
                <input
                  type="text"
                  value={maintReason}
                  onChange={(e) => setMaintReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold mb-1">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={maintStartDate}
                    onChange={(e) => setMaintStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={maintEndDate}
                    onChange={(e) => setMaintEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMaintenanceCourtId(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold"
                >
                  Confirmar Bloqueo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmation Delete Sport */}
      {sportToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-full bg-rose-100 dark:bg-rose-950/60">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  ¿Eliminar Deporte "{sportToDelete.name}"?
                </h3>
                <p className="text-xs text-slate-500">
                  Esta acción removerá la categoría de tu complejo.
                </p>
              </div>
            </div>

            {courts.filter((c) => c.typeId === sportToDelete.id).length > 0 ? (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-200 space-y-1">
                <p className="font-bold">¡Atención!</p>
                <p>
                  El deporte "{sportToDelete.name}" tiene{" "}
                  <span className="font-black">
                    {courts.filter((c) => c.typeId === sportToDelete.id).length}{" "}
                    cancha(s)
                  </span>{" "}
                  asociadas (
                  {courts
                    .filter((c) => c.typeId === sportToDelete.id)
                    .map((c) => c.name)
                    .join(", ")}
                  ).
                </p>
                <p className="text-[11px] opacity-90">
                  Al confirmar, se eliminará el deporte Y TAMBIÉN todas sus
                  canchas asociadas.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Este deporte no tiene canchas asociadas actualmente. ¿Deseas
                eliminarlo de la lista?
              </p>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSportToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteSport}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-500/20 cursor-pointer"
              >
                {courts.filter((c) => c.typeId === sportToDelete.id).length > 0
                  ? "Eliminar Deporte y Canchas"
                  : "Eliminar Deporte"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmation Delete Court */}
      {courtToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-full bg-rose-100 dark:bg-rose-950/60">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  ¿Eliminar Cancha "{courtToDelete.name}"?
                </h3>
                <p className="text-xs text-slate-500">
                  Categoría: {courtToDelete.typeName}
                </p>
              </div>
            </div>

            {bookings.filter(
              (b) => b.courtId === courtToDelete.id && b.status !== "CANCELLED",
            ).length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                <p className="font-bold">Advertencia de Reservas</p>
                <p>
                  Esta cancha posee{" "}
                  <span className="font-black">
                    {
                      bookings.filter(
                        (b) =>
                          b.courtId === courtToDelete.id &&
                          b.status !== "CANCELLED",
                      ).length
                    }{" "}
                    reserva(s) activa(s)
                  </span>
                  .
                </p>
              </div>
            )}

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Esta acción es irreversible y quitará la cancha de la grilla
              pública y del panel de administración.
            </p>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setCourtToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteCourt}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-500/20 cursor-pointer"
              >
                Eliminar Cancha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
