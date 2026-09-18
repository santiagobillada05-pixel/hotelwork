import React from 'react';
import { 
  X, 
  Printer, 
  Hotel, 
  CheckCircle2, 
  Calendar, 
  CreditCard, 
  Receipt,
  Download
} from 'lucide-react';

export default function ReservationReceiptModal({ reservation, onClose }) {
  if (!reservation) return null;

  const handlePrint = () => {
    window.print();
  };

  const nights = Math.max(
    1,
    Math.round(
      (new Date(reservation.check_out_date) - new Date(reservation.check_in_date)) /
        (1000 * 60 * 60 * 24)
    )
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:p-0 print:bg-white animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Controls - Hidden when printing */}
        <div className="flex justify-between items-center pb-6 mb-6 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Receipt className="w-4 h-4 text-brand-600" />
            Comprobante de Reserva & Factura
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Letterhead Area */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-md">
                <Hotel className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                  Hotel<span className="text-brand-600">Work</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Gestión & Hospitalidad Hotelera</p>
                <p className="text-[11px] text-slate-400">NIT: 900.123.456-7 • contacto@hotelwork.com</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                Factura / Recibo
              </span>
              <span className="text-lg font-black text-slate-900">
                #HW-{reservation.id.toString().padStart(5, '0')}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Fecha: {reservation.created_at ? new Date(reservation.created_at).toLocaleDateString() : 'Hoy'}
              </span>
            </div>
          </div>

          {/* Guest & Reservation Metadata */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Datos del Huésped
              </span>
              <p className="font-extrabold text-slate-800">
                Usuario Registrado #{reservation.user_id}
              </p>
              <p className="text-slate-600">
                Huéspedes registrados: {reservation.num_guests}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Detalles de Estancia
              </span>
              <p className="text-slate-700 font-semibold">
                Habitación: #{reservation.room_id}
              </p>
              <p className="text-slate-600">
                {reservation.check_in_date} al {reservation.check_out_date} ({nights} noche{nights > 1 ? 's' : ''})
              </p>
              <div className="mt-1">
                <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-black uppercase">
                  {reservation.status}
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-2.5">Concepto</th>
                <th className="py-2.5 text-center">Noches</th>
                <th className="py-2.5 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3">
                  <span className="font-bold text-slate-800 block">
                    Alojamiento — Habitación #{reservation.room_id}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Tarifa regular por estadía
                  </span>
                </td>
                <td className="py-3 text-center font-semibold text-slate-700">
                  {nights}
                </td>
                <td className="py-3 text-right font-extrabold text-slate-900">
                  ${reservation.base_total?.toFixed(2)} USD
                </td>
              </tr>
              {reservation.discount_amount > 0 && (
                <tr className="text-emerald-700">
                  <td className="py-2.5 font-medium">Descuento aplicado</td>
                  <td className="py-2.5 text-center">-</td>
                  <td className="py-2.5 text-right font-bold">
                    -${reservation.discount_amount?.toFixed(2)} USD
                  </td>
                </tr>
              )}
              <tr>
                <td className="py-2.5 text-slate-600">Impuestos (IVA 19%)</td>
                <td className="py-2.5 text-center">-</td>
                <td className="py-2.5 text-right font-semibold text-slate-800">
                  ${reservation.tax_amount?.toFixed(2)} USD
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-900 font-extrabold text-sm text-slate-900">
                <td className="pt-3" colSpan="2">
                  Total Facturado
                </td>
                <td className="pt-3 text-right text-brand-700 text-base">
                  ${reservation.final_total?.toFixed(2)} USD
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Footer note */}
          <div className="pt-6 border-t border-slate-100 text-center text-[11px] text-slate-400 space-y-1">
            <p>Gracias por elegir HotelWork. Esperamos que disfrute plenamente de su estancia.</p>
            <p className="text-[10px]">Este documento constituye un comprobante formal de reserva emitido por HotelWork PMS.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
