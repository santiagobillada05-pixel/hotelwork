import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { roomsApi } from "../api/roomsApi";
import { reservationsApi } from "../api/reservationsApi";
import { useAuthStore } from "../store/authStore";
import RoomCarousel from "../components/rooms/RoomCarousel";
import { 
  ArrowLeft, 
  Users, 
  BedDouble, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  Receipt, 
  Loader2, 
  AlertCircle 
} from "lucide-react";

export default function RoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (user?.role === "staff") {
        navigate("/check-in-out", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultCheckOut = tomorrow.toISOString().split("T")[0];

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [numGuests, setNumGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true);
      try {
        const res = await roomsApi.getRoomById(id);
        setRoom(res.data);
      } catch (err) {
        setError(err.message || "Error al cargar habitacion");
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const calculations = useMemo(() => {
    if (!room || !checkIn || !checkOut) return null;
    const diff = new Date(checkOut) - new Date(checkIn);
    const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (nights <= 0) return null;

    const base = nights * room.price_per_night;
    const tax = base * 0.19;
    const total = base + tax;
    return {
      nights,
      base: base.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    };
  }, [room, checkIn, checkOut]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setBookingLoading(true);
    setError(null);
    try {
      await reservationsApi.createReservation({
        room_id: room.id,
        check_in_date: checkIn,
        check_out_date: checkOut,
        num_guests: Number(numGuests),
        special_requests: specialRequests || null,
        discount_rate: 0.0,
      });
      setBookingSuccess(true);
    } catch (err) {
      setError(err.message || "Error al procesar reserva");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Habitacion no encontrada</h2>
        <Link to="/" className="text-brand-600 font-bold hover:underline">
          Volver al buscador
        </Link>
      </div>
    );
  }

  const parseAmenities = (amenities) => {
    if (!amenities) return [];
    try {
      return JSON.parse(amenities);
    } catch {
      return amenities.split(",").map((a) => a.trim());
    }
  };

  const amenitiesList = parseAmenities(room.amenities);

  // Resolve gallery images
  const galleryImages =
    Array.isArray(room.image_urls) && room.image_urls.length > 0
      ? room.image_urls
      : room.image_url
      ? [room.image_url]
      : [];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a Habitaciones
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery carousel - h-96 in detail view */}
            <div className="relative rounded-3xl overflow-hidden shadow-sm">
              <RoomCarousel
                images={galleryImages}
                roomNumber={room.room_number}
                className="h-96"
              />
              <div className="absolute top-4 left-4 flex gap-2 pointer-events-none z-20">
                <span className="bg-brand-600 text-white font-extrabold text-sm px-3.5 py-1 rounded-full shadow">
                  Habitacion {room.room_number}
                </span>
                <span className="bg-white/90 backdrop-blur-md text-slate-900 font-bold text-sm px-3 py-1 rounded-full shadow">
                  {room.room_type?.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 mb-2">
                  Habitacion {room.room_number} - Categoria {room.room_type}
                </h1>
                <div className="flex items-center gap-6 text-xs text-slate-500 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-brand-600" /> Capacidad: {room.capacity} persona(s)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4 text-brand-600" /> Piso: {room.floor || 1}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Descripcion
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {room.description ||
                    "Disfrute de una estancia placentera con todas las comodidades modernas, servicio de primera y el ambiente optimo tanto para descanso como para viajes de trabajo."}
                </p>
              </div>

              {/* Amenities */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Amenidades y Servicios Incluidos
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenitiesList.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-100"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Policies */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Politicas del Hotel
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>Check-in a partir de las 15:00 hrs</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>Check-out hasta las 12:00 hrs</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cancelacion gratuita hasta 24h antes</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Servicio de limpieza diario incluido</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Widget Sidebar */}
          <div>
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl sticky top-24">
              <div className="flex items-baseline justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-3xl font-black text-slate-900">${room.price_per_night}</span>
                  <span className="text-xs text-slate-500 font-bold"> USD / noche</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Disponible
                </span>
              </div>

              {bookingSuccess ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">Reserva Registrada!</h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Tu estancia ha sido confirmada satisfactoriamente.
                  </p>
                  <button
                    onClick={() => navigate("/my-reservations")}
                    className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs"
                  >
                    Ir a Mis Reservas
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Entrada (Check-in)
                      </label>
                      <input
                        type="date"
                        min={today}
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Salida (Check-out)
                      </label>
                      <input
                        type="date"
                        min={checkIn || today}
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Huespedes (Max: {room.capacity})
                      </label>
                      <select
                        value={numGuests}
                        onChange={(e) => setNumGuests(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      >
                        {Array.from({ length: room.capacity }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? "huesped" : "huespedes"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Peticiones Especiales (Opcional)
                      </label>
                      <textarea
                        rows={2}
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Cama matrimonial, piso silencioso..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {calculations && (
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>
                          {calculations.nights} noche(s) x ${room.price_per_night}
                        </span>
                        <span className="font-semibold text-slate-900">${calculations.base} USD</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>IVA (19%)</span>
                        <span className="font-semibold text-slate-900">${calculations.tax} USD</span>
                      </div>
                      <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900 text-sm">
                        <span>Total</span>
                        <span className="text-brand-700 font-extrabold text-base">
                          ${calculations.total} USD
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bookingLoading || !calculations}
                    className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {bookingLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Confirmar Reserva"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}