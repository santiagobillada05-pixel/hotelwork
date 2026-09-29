import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, BedDouble, CheckCircle2, Sparkles } from "lucide-react";
import RoomCarousel from "./RoomCarousel";

export default function RoomCard({ room, onSelect }) {
  const navigate = useNavigate();

  const parseAmenities = (amenities) => {
    if (!amenities) return [];
    try {
      return JSON.parse(amenities);
    } catch {
      return amenities.split(",").map((a) => a.trim());
    }
  };

  const getRoomTypeLabel = (type) => {
    const map = {
      single: "Individual",
      double: "Doble",
      suite: "Suite Ejecutiva",
      deluxe: "Penthouse Deluxe",
    };
    return map[type] || type;
  };

  const amenitiesList = parseAmenities(room.amenities);

  // Resolve images: prefer image_urls array, fallback to [image_url]
  const images =
    Array.isArray(room.image_urls) && room.image_urls.length > 0
      ? room.image_urls
      : room.image_url
      ? [room.image_url]
      : [];

  const goToDetail = () => navigate("/rooms/" + room.id);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
      {/* Image / Carousel container -- clicking navigates to detail */}
      <div
        className="relative h-56 overflow-hidden cursor-pointer"
        onClick={goToDetail}
      >
        <RoomCarousel images={images} roomNumber={room.room_number} className="h-56" />

        {/* Overlaid badges - pointer-events-none so clicks pass through to carousel controls */}
        <div className="absolute top-3 left-3 flex gap-2 pointer-events-none z-20">
          <span className="bg-brand-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow">
            Hab. {room.room_number}
          </span>
          <span className="bg-white dark:bg-slate-800/90 backdrop-blur-md text-slate-800 dark:text-slate-100 font-semibold text-xs px-2.5 py-1 rounded-full shadow-sm">
            {getRoomTypeLabel(room.room_type)}
          </span>
        </div>

        {room.floor && (
          <div className="absolute top-3 right-3 bg-slate-900/70 text-white text-xs px-2 py-0.5 rounded-md backdrop-blur-sm pointer-events-none z-20">
            Piso {room.floor}
          </div>
        )}

        {/* Badge Fuera de Servicio */}
        {!room.is_room_bookable && (
          <div className="absolute inset-x-0 bottom-0 bg-rose-600/90 backdrop-blur-sm text-white text-center py-2 text-xs font-bold pointer-events-none z-20">
            Fuera de servicio
          </div>
        )}
      </div>

      {/* Content -- clicking title/description navigates to detail */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="cursor-pointer" onClick={goToDetail}>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
            <span className="flex items-center gap-1 font-medium">
              <Users className="w-4 h-4 text-brand-600" /> Hasta {room.capacity} huesped(es)
            </span>
            <span className="flex items-center gap-1 font-medium">
              <BedDouble className="w-4 h-4 text-brand-600" /> Cama premium
            </span>
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 mb-4 leading-relaxed">
            {room.description ||
              "Habitacion confortable con todas las comodidades para una estancia placentera."}
          </p>

          {amenitiesList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {amenitiesList.slice(0, 3).map((item, idx) => (
                <span
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700/50 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  {item}
                </span>
              ))}
              {amenitiesList.length > 3 && (
                <span className="text-xs text-slate-400 self-center pl-1 font-medium">
                  +{amenitiesList.length - 3} mas
                </span>
              )}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between mt-auto">
          <div className="cursor-pointer" onClick={goToDetail}>
            <span className="text-xs text-slate-400 block font-medium">Tarifa por noche</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">${room.price_per_night}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium"> USD</span>
          </div>

          {room.is_room_bookable ? (
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(room); }}
              className="bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              Reservar
            </button>
          ) : (
            <button
              disabled
              className="bg-slate-200 text-slate-500 dark:text-slate-400 font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm cursor-not-allowed flex items-center gap-1.5"
            >
              No disponible
            </button>
          )}
        </div>
      </div>
    </div>
  );
}