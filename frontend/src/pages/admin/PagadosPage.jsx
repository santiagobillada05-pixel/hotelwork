import React, { useState, useEffect } from 'react';
import { checkoutsApi } from '../../api/checkoutsApi';
import { useAuthStore } from '../../store/authStore';
import { 
  FileText, 
  Trash2, 
  Check, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  ShieldAlert,
  Filter
} from 'lucide-react';

export default function PagadosPage() {
  const [checkouts, setCheckouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const fetchCheckouts = async (filter = statusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const params = { per_page: 50 };
      if (filter !== 'all') {
        params.status = filter;
      }
      const res = await checkoutsApi.getCheckouts(params);
      setCheckouts(res.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar lista de pagados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckouts(statusFilter);
  }, [statusFilter]);

  const handleUpdateStatus = async (id, status) => {
    setActionLoading(id);
    try {
      await checkoutsApi.updateStatus(id, status);
      await fetchCheckouts(statusFilter);
    } catch (err) {
      alert(err.message || 'Error al actualizar registro');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      alert('Solo el administrador puede eliminar registros de conteo.');
      return;
    }

    const confirm = window.confirm(
      '¿Estás seguro de eliminar este registro del conteo? Esta acción lo removerá del arqueo de caja.'
    );
    if (!confirm) return;

    setActionLoading(id);
    try {
      await checkoutsApi.deleteCheckout(id);
      await fetchCheckouts(statusFilter);
    } catch (err) {
      alert(err.message || 'Error al eliminar el registro');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">
            Pendiente Conteo
          </span>
        );
      case 'kept':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
            Conservado
          </span>
        );
      case 'removed':
        return (
          <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full border border-rose-200">
            Eliminado de Conteo
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold px-2.5 py-1 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2.5">
              <FileText className="w-7 h-7 text-brand-600" />
              Lista de Pagados & Conteo de Caja
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Registro histórico de check-outs para el arqueo de caja.
            </p>
          </div>

          <button
            onClick={() => fetchCheckouts(statusFilter)}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualizar Lista
          </button>
        </div>

        {!isAdmin && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              Vista de recepción (Lectura): Únicamente el usuario <strong>Administrador</strong> puede conservar o eliminar registros en el conteo de caja.
            </span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {[
            { id: 'pending', label: 'Pendientes' },
            { id: 'kept', label: 'Conservados' },
            { id: 'removed', label: 'Eliminados' },
            { id: 'all', label: 'Todos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Cargando registros de conteo...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Huésped / Reserva</th>
                    <th className="py-4 px-6">Habitación</th>
                    <th className="py-4 px-6">Fechas Stay</th>
                    <th className="py-4 px-6">Monto Cobrado</th>
                    <th className="py-4 px-6">Fecha Check-out</th>
                    <th className="py-4 px-6">Estado Conteo</th>
                    {isAdmin && <th className="py-4 px-6 text-right">Acciones Admin</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {checkouts.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 7 : 6} className="py-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                        No se encontraron registros de check-out con el filtro seleccionado ({statusFilter}).
                      </td>
                    </tr>
                  ) : (
                    checkouts.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50 dark:bg-slate-900/50/70 transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-extrabold text-slate-900 dark:text-slate-50 block">
                            {record.guest_name}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Reserva #{record.reservation_id}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <span className="font-bold text-slate-800 dark:text-slate-100 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">
                            Hab. {record.room_number}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-300 font-medium">
                          <div>In: {record.check_in_date}</div>
                          <div>Out: {record.check_out_date}</div>
                        </td>

                        <td className="py-4 px-6">
                          <span className="font-black text-slate-900 dark:text-slate-50 block">
                            ${record.total_amount} USD
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
                            {record.payment_method}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-300 font-medium">
                          {new Date(record.checked_out_at).toLocaleString()}
                        </td>

                        <td className="py-4 px-6">
                          {getStatusBadge(record.counting_status)}
                        </td>

                        {isAdmin && (
                          <td className="py-4 px-6 text-right space-x-2">
                            {record.counting_status !== 'kept' && (
                              <button
                                onClick={() => handleUpdateStatus(record.id, 'kept')}
                                disabled={actionLoading === record.id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                title="Conservar en el historial de pagos"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Conservar
                              </button>
                            )}

                            {record.counting_status !== 'removed' && (
                              <button
                                onClick={() => handleDelete(record.id)}
                                disabled={actionLoading === record.id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                title="Eliminar de la lista de conteo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Eliminar
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
