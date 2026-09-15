import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  AlertTriangle, 
  Search, 
  Filter, 
  Calendar, 
  TrendingUp, 
  MapPin, 
  CheckCircle2, 
  Activity,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { api } from '../services/api';

interface MandiPriceRecord {
  commodity: string;
  variety: string;
  state: string;
  district: string;
  market: string;
  min_price: number | string;
  max_price: number | string;
  modal_price: number | string;
  min_price_per_kg?: number;
  max_price_per_kg?: number;
  modal_price_per_kg?: number;
  arrival_date?: string;
}

export const MandiPriceIntelligence: React.FC = () => {
  const [records, setRecords] = useState<MandiPriceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [source, setSource] = useState<string>('Government of India (data.gov.in)');

  // Filters
  const [searchCommodity, setSearchCommodity] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const loadMandiPrices = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.getMandiPrices({
        commodity: searchCommodity || undefined,
        state: selectedState || undefined,
        district: selectedDistrict || undefined,
      });

      setAvailable(res.available);
      if (res.records && res.records.length > 0) {
        setRecords(res.records);
        setLastUpdated(res.lastUpdated || new Date().toLocaleTimeString());
        if (res.source) setSource(res.source);
      }
      if (!res.available) {
        setErrorMessage(res.message || 'Live government mandi feed currently unavailable. Displaying cached APMC benchmark data.');
      }
    } catch (err: any) {
      console.error('Failed to load mandi prices:', err);
      setAvailable(false);
      setErrorMessage('Government mandi feed unavailable: connection failed. Displaying cached benchmark data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMandiPrices();
  }, []);

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h2 className="text-xl font-black text-slate-900 font-display flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Mandi Price Intelligence
            </h2>
            {available && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE / Latest Available Government Data
              </span>
            )}
            {available === false && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Latest Available Government Data (Cached)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-2">
            <span>Resource: 9ef84268-d588-465a-a308-a864a43d0070 (Agmarknet Daily APMC)</span>
            {lastUpdated && (
              <>
                <span>&bull;</span>
                <span>Last updated: {lastUpdated}</span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadMandiPrices}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search commodity (e.g., Tomato, Potato, Onion)..."
            value={searchCommodity}
            onChange={(e) => setSearchCommodity(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <button
          type="button"
          onClick={loadMandiPrices}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          Filter
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {loading && (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-medium">Fetching official APMC mandi benchmark feed...</p>
          </div>
        )}

        {/* Status notice banner when live feed is unavailable */}
        {!loading && available === false && (
          <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-900">
                  Government Mandi Feed Status
                </div>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  {errorMessage || 'Live upstream APMC feed returned error 403. Displaying verified cached APMC mandi price benchmarks.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={loadMandiPrices}
              className="px-3 py-1.5 bg-amber-900 text-white text-xs font-bold rounded-xl hover:bg-amber-800 transition-colors cursor-pointer shrink-0"
            >
              Retry Live Feed
            </button>
          </div>
        )}

        {!loading && records.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-xs">
            No mandi records found matching the current search parameters.
          </div>
        )}

        {!loading && records.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4 font-bold">Commodity</th>
                  <th className="py-3 px-4 font-bold">Variety</th>
                  <th className="py-3 px-4 font-bold">State</th>
                  <th className="py-3 px-4 font-bold">District</th>
                  <th className="py-3 px-4 font-bold">Market</th>
                  <th className="py-3 px-4 font-bold">Min Price</th>
                  <th className="py-3 px-4 font-bold">Max Price</th>
                  <th className="py-3 px-4 font-bold">Modal Price</th>
                  <th className="py-3 px-4 font-bold">Arrival Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {records.map((record, index) => (
                  <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {record.commodity}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {record.variety}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {record.state}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {record.district}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {record.market}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono">
                      ₹{record.min_price} <span className="text-[10px] text-slate-400">/qtl</span>
                      {record.min_price_per_kg && (
                        <span className="block text-[10px] text-slate-500">₹{record.min_price_per_kg}/kg</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono">
                      ₹{record.max_price} <span className="text-[10px] text-slate-400">/qtl</span>
                      {record.max_price_per_kg && (
                        <span className="block text-[10px] text-slate-500">₹{record.max_price_per_kg}/kg</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-emerald-700 font-bold font-mono">
                      ₹{record.modal_price} <span className="text-[10px] text-emerald-600">/qtl</span>
                      {record.modal_price_per_kg && (
                        <span className="block text-[10px] text-emerald-800">₹{record.modal_price_per_kg}/kg</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {record.arrival_date || 'Today'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
