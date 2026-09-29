import React, { useState, useEffect } from 'react';
import { reportsApi } from '../api/reportsApi';
import { DollarSign, RefreshCw, Calendar } from 'lucide-react';

export default function RecaudacionPage() {
  const [period, setPeriod] = useState('week');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const currencies = {
    USD: { rate: 1, symbol: '$', locale: 'en-US' },
    COP: { rate: 4000, symbol: '$', locale: 'es-CO' },
    EUR: { rate: 0.92, symbol: '€', locale: 'es-ES' }
  };

  const fetchRecaudacion = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await reportsApi.getRecaudacion(period);
      setData(response.data);
    } catch (err) {
      setError(err.message || 'Error al obtener los datos de recaudación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecaudacion();
  }, [period]);

  const formatCurrency = (amount) => {
    const convertedAmount = amount * currencies[selectedCurrency].rate;
    return new Intl.NumberFormat(currencies[selectedCurrency].locale, {
      style: 'currency',
      currency: selectedCurrency,
      minimumFractionDigits: selectedCurrency === 'COP' ? 0 : 2
    }).format(convertedAmount);
  };
  
  const formatDateRange = (start, end) => {
    if (!start || !end) return '';
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return `${startDate.toLocaleDateString('es-CO', options)} - ${endDate.toLocaleDateString('es-CO', options)}`;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Recaudación</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Resumen de ingresos por pagos confirmados.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {Object.keys(currencies).map(curr => (
              <option key={curr} value={curr}>{curr}</option>
            ))}
          </select>
          <button
            onClick={fetchRecaudacion}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 dark:bg-slate-900/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Cards de Totales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card Semana */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Esta Semana</h3>
            <div className="bg-blue-100 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-700" />
            </div>
          </div>
          <div className="mb-1">
            <span className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {data ? formatCurrency(data.totals.week.amount) : '---'}
            </span>
          </div>
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-2">
            <Calendar className="w-3 h-3 mr-1" />
            {data ? formatDateRange(data.totals.week.start, data.totals.week.end) : 'Cargando...'}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {data ? `${data.totals.week.count} cobro(s)` : '-'}
          </div>
        </div>

        {/* Card Mes */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Este Mes</h3>
            <div className="bg-emerald-100 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-700" />
            </div>
          </div>
          <div className="mb-1">
            <span className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {data ? formatCurrency(data.totals.month.amount) : '---'}
            </span>
          </div>
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-2">
            <Calendar className="w-3 h-3 mr-1" />
            {data ? formatDateRange(data.totals.month.start, data.totals.month.end) : 'Cargando...'}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {data ? `${data.totals.month.count} cobro(s)` : '-'}
          </div>
        </div>

        {/* Card Año */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Este Año</h3>
            <div className="bg-purple-100 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-700" />
            </div>
          </div>
          <div className="mb-1">
            <span className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {data ? formatCurrency(data.totals.year.amount) : '---'}
            </span>
          </div>
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-2">
            <Calendar className="w-3 h-3 mr-1" />
            {data ? formatDateRange(data.totals.year.start, data.totals.year.end) : 'Cargando...'}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {data ? `${data.totals.year.count} cobro(s)` : '-'}
          </div>
        </div>
      </div>

      {/* Tabla y Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Detalle de Cobros</h2>
          
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setPeriod('week')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                period === 'week' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-slate-50'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                period === 'month' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-slate-50'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                period === 'year' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-slate-50'
              }`}
            >
              Año
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fecha/Hora</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Huésped</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Habitación</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Método</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Concepto</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    Cargando cobros...
                  </td>
                </tr>
              ) : data && data.payments.length > 0 ? (
                data.payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatDateTime(p.paid_at)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-50">
                      {p.guest_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {p.room_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 capitalize">
                      {p.payment_method.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {p.concept}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-50 text-right">
                      {formatCurrency(p.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    No hay cobros en este periodo
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
