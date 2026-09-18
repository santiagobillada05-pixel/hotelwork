import React, { useState, useEffect } from 'react';
import { reservationsApi } from '../api/reservationsApi';
import { 
  CalendarCheck, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Receipt,
  BedDouble,
  FileText
} from 'lucide-react';
import ReservationReceiptModal from '../components/reservations/ReservationReceiptModal';

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchMyReservations = async () => {
    setLoading(true);
    try {
      const res = await reservationsApi.getMyReservations();
      setReservations(res.data || []);
    } catch (err) {
      setError(err.message || 'Error al obtener tu historial de reservas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReservations();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return;
    setActionLoading(id);
    try {
      await reservationsApi.cancelReservation(id);
      await fetchMyReservations();
    } catch (err) {
      alert(err.message || 'Error al cancelar la reserva');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { label: 'Pendiente', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
      confirmed: { label: 'Confirmada', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
      checked_in: { label: 'En el Hotel', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      checked_out: { label: 'Completada', bg: 'bg-slate-100 text-slate-600 border-slate-200' },
      cancelled: { label: 'Cancelada', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
    };
    const s = map[status] || { label: status, bg: 'bg-slate-100 text-slate-600 border-slate-200' };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${s.bg}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="w-7 h-7 text-brand-600" />
            Mis Reservas
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Consulta el estado de tus reservas, detalles de estancia y recibos de pago
          </p>
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
            <p className="text-sm font-semibold text-slate-500">Cargando tu historial...</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <BedDouble className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Aún no tienes reservas</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-6">
              Explora nuestras habitaciones y reserva tu próxima estadía en HotelWork.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between md:items-center gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-base text-slate-900">
                      Reserva #{res.id}
                    </span>
                    {getStatusBadge(res.status)}
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-600 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-brand-600" />
                      {res.check_in_date} al {res.check_out_date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BedDouble className="w-4 h-4 text-brand-600" />
                      Habitación #{res.room_id}
                    </span>
                  </div>

                  {res.special_requests && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-lg">
                      "{res.special_requests}"
                    </p>
                  )}
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 gap-3">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-slate-400 block font-medium">Total Facturado</span>
                    <span className="text-xl font-black text-slate-900">${res.final_total} USD</span>
                    <span className="text-xs text-slate-400 block">IVA 19% incl.</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedReceipt(res)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Receipt className="w-3.5 h-3.5 text-brand-600" />
                      Ver Factura
                    </button>

                    {['pending', 'confirmed'].includes(res.status) && (
                      <button
                        onClick={() => handleCancel(res.id)}
                        disabled={actionLoading === res.id}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === res.id ? 'Cancelando...' : 'Cancelar'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Printable Receipt Modal */}
        {selectedReceipt && (
          <ReservationReceiptModal
            reservation={selectedReceipt}
            onClose={() => setSelectedReceipt(null)}
          />
        )}
      </div>
    </div>
  );
}
