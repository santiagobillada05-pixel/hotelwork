import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900/50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-100 dark:border-slate-700 pb-6">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Términos y Condiciones</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Políticas de servicio y privacidad</p>
            </div>
          </div>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p>Bienvenido a HotelWork. Al utilizar nuestro sistema y reservar habitaciones, aceptas los siguientes términos y condiciones:</p>
            
            <h3>1. Reservas y Pagos</h3>
            <p>Todas las reservas están sujetas a disponibilidad. El pago total debe completarse antes del check-out utilizando cualquiera de los métodos de pago aceptados y en la moneda de su preferencia (USD, EUR, COP).</p>
            
            <h3>2. Cancelaciones y Reembolsos</h3>
            <p>Las cancelaciones de reservas deben realizarse con al menos 24 horas de anticipación a la fecha de check-in para evitar cobros adicionales. Las cancelaciones tardías podrían incurrir en una penalidad equivalente a la tarifa de la primera noche de estancia.</p>
            
            <h3>3. Uso de las Instalaciones</h3>
            <p>Los huéspedes deben respetar las instalaciones del hotel, mantener un comportamiento adecuado y cumplir con los horarios de check-in y check-out establecidos por el establecimiento.</p>
            
            <h3>4. Privacidad y Datos Personales</h3>
            <p>Tus datos personales están protegidos de acuerdo con nuestra política de privacidad. Solo se utilizarán para gestionar tus reservas, garantizar tu seguridad durante tu estancia y mejorar nuestros servicios.</p>
            
            <h3>5. Responsabilidad</h3>
            <p>El hotel no se hace responsable por objetos de valor perdidos que no hayan sido depositados en las cajas de seguridad del establecimiento.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
