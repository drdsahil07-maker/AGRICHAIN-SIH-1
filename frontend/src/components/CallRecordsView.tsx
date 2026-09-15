import React, { useState } from 'react';
import { 
  Phone, 
  PhoneCall, 
  Volume2, 
  VolumeX, 
  Search, 
  Filter, 
  Play, 
  Square, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Sparkles, 
  Calendar, 
  Clock, 
  DollarSign, 
  Scale, 
  MapPin, 
  CheckCircle2, 
  Cpu, 
  TrendingUp,
  User,
  Plus
} from 'lucide-react';
import { CallRecordItem, getStoredCallRecords } from '../../../shared/data/callRecords';
import { callAudio } from '../utils/callAudio';

interface CallRecordsViewProps {
  onOpenNewCall: () => void;
  onCompileForCrop?: (crop: string, qty: number, price: number) => void;
}

export const CallRecordsView: React.FC<CallRecordsViewProps> = ({
  onOpenNewCall,
  onCompileForCrop
}) => {
  const [records, setRecords] = useState<CallRecordItem[]>(() => getStoredCallRecords());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(records[0]?.id || null);
  
  // Audio playback state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playingMsgIndex, setPlayingMsgIndex] = useState<number>(-1);

  // Computed Business Metrics
  const totalVolume = records.reduce((sum, r) => sum + r.quantityKg, 0);
  const avgMinPrice = records.length > 0 
    ? (records.reduce((sum, r) => sum + r.minAcceptablePrice, 0) / records.length).toFixed(1)
    : '0';

  // Filtered records
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.phoneNumber.includes(searchQuery) ||
      record.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.crop.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCrop = selectedCrop === 'all' || record.crop.toLowerCase() === selectedCrop.toLowerCase();
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;

    return matchesSearch && matchesCrop && matchesStatus;
  });

  // Handle playing call audio sequence
  const handlePlayCallAudio = (record: CallRecordItem) => {
    if (playingId === record.id) {
      // Stop currently playing
      callAudio.stopSpeech();
      setPlayingId(null);
      setPlayingMsgIndex(-1);
      return;
    }

    callAudio.stopSpeech();
    setPlayingId(record.id);
    setExpandedId(record.id);

    // Play messages sequentially
    let idx = 0;
    const playNext = () => {
      if (idx >= record.dialogue.length) {
        setPlayingId(null);
        setPlayingMsgIndex(-1);
        return;
      }

      setPlayingMsgIndex(idx);
      const msg = record.dialogue[idx];
      idx++;

      callAudio.speak({
        text: msg.text,
        isAi: msg.isAi,
        rate: 1.0,
        preferredLang: 'hi',
        onEnd: () => {
          setTimeout(playNext, 600);
        },
        onError: () => {
          setPlayingId(null);
          setPlayingMsgIndex(-1);
        }
      });
    };

    playNext();
  };

  const handleStopAudio = () => {
    callAudio.stopSpeech();
    setPlayingId(null);
    setPlayingMsgIndex(-1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Business Action Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <PhoneCall className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                AI Farmer Call Records
              </h1>
              <p className="text-slate-500 text-xs mt-0.5">
                Automated outbound telephony logs, audio recordings &amp; extracted harvest requirements
              </p>
            </div>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2.5">
          {playingId && (
            <button
              type="button"
              onClick={handleStopAudio}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Audio</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenNewCall}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Make Outbound AI Call</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-400 text-xs font-medium">Total Calls Logged</div>
          <div className="text-2xl font-extrabold text-slate-900 font-display mt-1">
            {records.length}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% Verified Telephony</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-400 text-xs font-medium">Procured Harvest Volume</div>
          <div className="text-2xl font-extrabold text-slate-900 font-display mt-1">
            {totalVolume.toLocaleString()} <span className="text-xs text-slate-500 font-normal">kg</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {(totalVolume / 100).toFixed(1)} Quintals Ready
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-400 text-xs font-medium">Avg Farmer Floor Price</div>
          <div className="text-2xl font-extrabold text-emerald-700 font-display mt-1">
            ₹{avgMinPrice} <span className="text-xs text-slate-500 font-normal">/ kg</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
            +24% vs Mandi Distress Level
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-400 text-xs font-medium">Compiler Match Rate</div>
          <div className="text-2xl font-extrabold text-indigo-700 font-display mt-1">
            94.8%
          </div>
          <div className="text-[11px] text-indigo-600 font-medium mt-0.5">
            Direct &amp; Backhaul Matched
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search farmer name, phone number, location, or crop..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Crop:</span>
          </div>
          <div className="flex items-center gap-1">
            {['all', 'Tomato', 'Onion', 'Potato', 'Garlic'].map(crop => (
              <button
                key={crop}
                type="button"
                onClick={() => setSelectedCrop(crop)}
                className={`px-2.5 py-1.5 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
                  selectedCrop.toLowerCase() === crop.toLowerCase()
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {crop === 'all' ? 'All Crops' : crop}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="compiled">Chain Compiled</option>
            <option value="in_transit">In Transit</option>
          </select>
        </div>
      </div>

      {/* Call Records List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
            <Phone className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-700">No call records match your search</div>
            <p className="text-xs text-slate-400">Try adjusting your filters or initiate a new outbound AI call.</p>
            <button
              type="button"
              onClick={onOpenNewCall}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
            >
              Start New Call
            </button>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const isExpanded = expandedId === record.id;
            const isPlayingThis = playingId === record.id;

            return (
              <div
                key={record.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                  isPlayingThis 
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Main Card Summary Row */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left Column: Farmer & Call Identity */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl shrink-0">
                      {record.cropIcon}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {record.farmerName}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {record.phoneNumber}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md font-mono ${
                          record.status === 'compiled'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : record.status === 'in_transit'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {record.status === 'compiled' ? '✓ Compiled' : record.status === 'in_transit' ? '🚚 In Transit' : '• Confirmed'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {record.location}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {record.timestamp}
                        </span>
                        <span>&bull;</span>
                        <span className="text-slate-600 font-mono">
                          {record.durationSeconds}s call
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Extracted Values (Crop, Qty, Min Price) */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-slate-50 rounded-xl p-2.5 sm:p-3 border border-slate-100 text-center text-xs shrink-0">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Crop</div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {record.crop}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Quantity</div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {record.quantityKg} kg
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Min Bhav</div>
                      <div className="font-bold text-emerald-700 mt-0.5">
                        ₹{record.minAcceptablePrice}/kg
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions (Audio Player, Transcript Toggle, Compiler) */}
                  <div className="flex items-center gap-2 self-end lg:self-center">
                    {/* Audio Play Button */}
                    <button
                      type="button"
                      onClick={() => handlePlayCallAudio(record)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isPlayingThis
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                      title={isPlayingThis ? 'Stop Call Audio' : 'Play Full Call Audio Recording'}
                    >
                      {isPlayingThis ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Stop Audio</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Listen Call ({record.durationSeconds}s)</span>
                        </>
                      )}
                    </button>

                    {/* Compile Chain CTA */}
                    {onCompileForCrop && (
                      <button
                        type="button"
                        onClick={() => onCompileForCrop(record.crop, record.quantityKg, record.minAcceptablePrice)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                        title="Compile Best Supply Chain with this Farmer's Harvest"
                      >
                        <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">Compile Chain</span>
                      </button>
                    )}

                    {/* Expand/Collapse Transcript */}
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : record.id)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                      title={isExpanded ? 'Collapse Transcript' : 'View Dialogue Transcript'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                </div>

                {/* Equalizer Bar when Playing */}
                {isPlayingThis && (
                  <div className="bg-emerald-900 text-emerald-200 px-4 py-2 flex items-center justify-between text-xs border-t border-emerald-800">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 h-3">
                        <span className="w-1 h-3 bg-emerald-400 animate-pulse"></span>
                        <span className="w-1 h-2 bg-emerald-400 animate-pulse" style={{ animationDuration: '0.3s' }}></span>
                        <span className="w-1 h-3.5 bg-emerald-400 animate-pulse" style={{ animationDuration: '0.2s' }}></span>
                        <span className="w-1 h-1.5 bg-emerald-400 animate-pulse" style={{ animationDuration: '0.4s' }}></span>
                      </div>
                      <span className="font-semibold font-mono">
                        Playing Call Audio with AgriMitra AI Voice...
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleStopAudio}
                      className="text-[11px] underline font-bold hover:text-white cursor-pointer"
                    >
                      Stop
                    </button>
                  </div>
                )}

                {/* Expanded Transcript Accordion */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                      <span>Full Telephony Transcript (3-Step Questions &amp; Answers):</span>
                      <span className="font-mono text-[11px] text-slate-400">Call ID: {record.id}</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {record.dialogue.map((msg, idx) => {
                        const isCurrentlySpeakingThis = isPlayingThis && playingMsgIndex === idx;

                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl transition-all ${
                              msg.isAi
                                ? 'bg-white border border-slate-200 ml-auto max-w-[90%] text-slate-800'
                                : 'bg-emerald-100/70 border border-emerald-200 mr-auto max-w-[90%] text-emerald-950'
                            } ${isCurrentlySpeakingThis ? 'ring-2 ring-emerald-500 bg-emerald-50' : ''}`}
                          >
                            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                              <span className="font-bold flex items-center gap-1">
                                {msg.isAi ? '🤖 ' : '👨‍🌾 '}
                                {msg.speaker}
                              </span>
                              {msg.timestamp && <span>{msg.timestamp}</span>}
                            </div>
                            <p className="leading-relaxed">{msg.text}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
