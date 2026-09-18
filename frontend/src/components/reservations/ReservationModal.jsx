import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { reservationsApi } from '../../api/reservationsApi';
import { 
  X, 
  Calendar, 
  Users, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Receipt
} from 'lucide-react';

export default function ReservationModal({ room, initialCheckIn, initialCheckOut, onClose, onSuccess }) {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  const defaultCheckIn = initialCheckIn || today;
  
  // Calculate default check-out as tomorrow
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const defaultCheckOut = initialCheckOut || tomorrowDate.toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState(defaultCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(defaultCheckOut);
  const [numGuests, setNumGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  // Live tariff calculation
  const calculations = useMemo(() => {
    if (!checkInDate || !checkOutDate) return null;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end - start;
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (nights <= 0) return null;

    const baseTotal = nights * room.price_per_night;
    const taxAmount = baseTotal * 0.19; // 19% IVA
    const finalTotal = baseTotal + taxAmount;

    return {
      nights,
      baseTotal: baseTotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      finalTotal: finalTotal.toFixed(2),
    };
  }, [checkInDate, checkOutDate, room.price_per_night]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!calculations) {
      setError('La fecha de salida debe ser posterior a la fecha de entrada');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await reservationsApi.createReservation({
        room_id: room.id,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        num_guests: Number(numGuests),
        special_requests: specialRequests || null,
        discount_rate: 0.0,
      });

      setSuccessData(response.data);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Error al procesar la reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Confirmar Reserva</h3>
            <p className="text-xs text-slate-500 font-medium">
              Habitación {room.room_number} • ${room.price_per_night} USD / noche
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {successData ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">¡Reserva Confirmada!</h4>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                Tu reserva con código <span className="font-bold text-slate-900">#{successData.id}</span> ha sido registrada exitosamente. Hemos enviado los detalles a tu cuenta.
              </p>

              <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200 mb-6 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Fechas:</span>
                  <span className="font-semibold text-slate-800">{successData.check_in_date} al {successData.check_out_date}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total a pagar:</span>
                  <span className="font-bold text-slate-900 text-sm">${successData.final_total} USD</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estado:</span>
                  <span className="font-semibold text-emerald-600 uppercase">{successData.status}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/my-reservations')}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                >
                  Ver Mis Reservas
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl transition-colors text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Date Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Fecha de Entrada
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={today}
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Fecha de Salida
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={checkInDate || today}
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Guests Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Número de Huéspedes (Máx: {room.capacity})
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <select
                    value={numGuests}
                    onChange={(e) => setNumGuests(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  >
                    {Array.from({ length: room.capacity }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'huésped' : 'huéspedes'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Peticiones Especiales (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Ej: Llegada tardía, piso alto, cuna para bebé..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium placeholder:text-slate-400"
                />
              </div>

              {/* Price Breakdown / RF06 Auto Tariff Calculation */}
              {calculations ? (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                    <Receipt className="w-3.5 h-3.5 text-brand-600" />
                    Desglose de Tarifas (RF06)
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>
                      {calculations.nights} noche(s) × ${room.price_per_night} USD
                    </span>
                    <span className="font-semibold text-slate-800">${calculations.baseTotal} USD</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Impuestos (IVA 19%)</span>
                    <span className="font-semibold text-slate-800">${calculations.taxAmount} USD</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-extrabold text-slate-900">
                    <span>Total a Pagar</span>
                    <span className="text-base text-brand-700">${calculations.finalTotal} USD</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-600 italic">
                  Selecciona fechas válidas para calcular la tarifa automáticamente.
                </p>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading || !calculations}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md hover:shadow transition-all flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando Reserva...
                  </>
                ) : (
                  'Confirmar y Reservar Ahora'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
