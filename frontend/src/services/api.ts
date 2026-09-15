import { fetchWithAuth } from "./apiFetch";
import { 
  ChainOption, 
  Harvest, 
  FarmerPool, 
  BackhaulTrip, 
  BuyerDemand, 
  ServiceProvider, 
  PriceBenchmark, 
  QualityAnalysisResult 
} from '../../../shared/types';
import { 
   
   
  SEED_BACKHAUL_TRIPS, 
  SEED_BUYER_DEMANDS, 
  SEED_SERVICE_PROVIDERS, 
  SEED_PRICE_BENCHMARKS 
} from '../../../shared/data/seedData';
import { compileSupplyChains, evaluateCounterfactual, CounterfactualScenario } from '../../../shared/services/chainCompiler';

export interface CompileParams {
  crop: string;
  quantityKg: number;
  location: string;
  harvestDate?: string;
  minAcceptablePrice: number;
  qualityGrade: 'Grade A' | 'Grade B' | 'Grade C';
  preferredBuyerType?: string;
  harvestId?: string;
}

export const api = {
  // === Phase 7 Orders API ===
  async createOrder(orderData: any): Promise<any> {
    const res = await fetchWithAuth('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data?.error?.message || "Failed to create order");
    return data.data;
  },
  async getOrders(): Promise<any[]> {
    try {
      const res = await fetchWithAuth('/api/orders');
      if (res.ok) {
        const data = await res.json();
        return data.data || [];
      }
    } catch (e) {
      console.warn('API error fetching orders:', e);
    }
    return [];
  },
  async getOrderById(orderId: string): Promise<any> {
    const res = await fetchWithAuth(`/api/orders/${orderId}`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data?.error?.message || "Failed to fetch order");
    return data.data;
  },
  async updateOrderStatus(orderId: string, status: string): Promise<any> {
    const res = await fetchWithAuth(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data?.error?.message || "Failed to update order status");
    return data.data;
  },
  // === Existing API ===

  async compileChain(params: CompileParams): Promise<{ options: ChainOption[]; bestOption: ChainOption }> {
    try {
      const res = await fetchWithAuth('/api/chain/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const data = await res.json();
        return { options: data.options, bestOption: data.bestOption };
      }
    } catch (e) {
      console.warn('API call failed, compiling locally:', e);
    }
    const options = compileSupplyChains({
      crop: params.crop,
      quantityKg: params.quantityKg,
      location: params.location,
      harvestDate: params.harvestDate || '2026-09-10',
      minAcceptablePrice: params.minAcceptablePrice,
      qualityGrade: params.qualityGrade,
      preferredBuyerType: params.preferredBuyerType,
    });
    return { options, bestOption: options[0] };
  },

  async getCounterfactual(scenario: 'replace_distributor' | 'replace_trader' | 'enable_backhaul' | 'full_optimal'): Promise<CounterfactualScenario> {
    try {
      const res = await fetchWithAuth(`/api/chain/counterfactual?scenario=${scenario}`);
      if (res.ok) {
        const data = await res.json();
        return data.counterfactual;
      }
    } catch (e) {
      console.warn('Counterfactual API fallback:', e);
    }
    return evaluateCounterfactual(scenario);
  },

  async getHarvests(): Promise<Harvest[]> {
    try {
      const res = await fetchWithAuth('/api/harvests');
      if (res.ok) {
        const data = await res.json();
        return data.harvests;
      }
    } catch (e) {
      console.warn('Harvests API fallback:', e);
    }
    return []; // Removed in Phase 5 to ensure Supabase truth
  },

  async createHarvest(payload: Partial<Harvest>): Promise<Harvest> {
    const newH: Harvest = {
      id: `AC-HRV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      farmerId: 'f-1',
      farmerName: payload.farmerName || 'Ramesh Patel',
      crop: payload.crop || 'Tomato',
      quantityKg: payload.quantityKg || 100,
      location: payload.location || 'Sanwer, Indore',
      harvestDate: new Date().toISOString().split('T')[0],
      sellingWindow: payload.sellingWindow || 'Tomorrow Morning',
      minAcceptablePrice: payload.minAcceptablePrice || 12,
      qualityGrade: payload.qualityGrade || 'Grade A',
      status: 'compiled',
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetchWithAuth('/api/harvests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return data.harvest;
      }
    } catch (e) {
      console.warn('Create harvest API fallback:', e);
    }
    return newH;
  },

  
  async suggestPools(requirement: any): Promise<any[]> {
    try {
      const res = await fetchWithAuth('/api/pools/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requirement),
      });
      if (res.ok) {
        const data = await res.json();
        return data.suggestions;
      }
    } catch (e) {
      console.warn('API error suggesting pools:', e);
    }
    return [];
  },

  async createPool(poolData: any): Promise<any> {
    const res = await fetchWithAuth('/api/pools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(poolData),
    });
    if (!res.ok) throw new Error("Failed to create pool");
    const data = await res.json();
    return data.pool;
  },

  async getPools(): Promise<FarmerPool[]> {
    try {
      const res = await fetchWithAuth('/api/pools');
      if (res.ok) {
        const data = await res.json();
        return data.pools;
      }
    } catch (e) {
      console.warn('Pools API fallback:', e);
    }
    return []; // Removed in Phase 5 to ensure Supabase truth
  },

  async getTransportOptions(poolId: string): Promise<any[]> {
    const res = await fetchWithAuth(`/api/transporters/options/${poolId}`);
    if (res.ok) {
      const data = await res.json();
      return data.options;
    }
    return [];
  },
  
  async assignTransport(poolId: string, tripId: string): Promise<any> {
    const res = await fetchWithAuth(`/api/transporters/assign/${poolId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripId })
    });
    if (!res.ok) throw new Error("Failed to assign transport");
    return await res.json();
  },
  
  async getBackhaulTrips(): Promise<BackhaulTrip[]> {
    try {
      const res = await fetchWithAuth('/api/transporters/backhaul');
      if (res.ok) {
        const data = await res.json();
        return data.backhaulTrips;
      }
    } catch (e) {
      console.warn('Backhaul API fallback:', e);
    }
    return []; // Phase 6: Removed SEED_BACKHAUL_TRIPS
  },

  async createBackhaulTrip(trip: Partial<BackhaulTrip>): Promise<BackhaulTrip> {
    

    try {
      const res = await fetchWithAuth('/api/transporters/backhaul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip),
      });
      if (res.ok) {
        const data = await res.json();
        return data.trip;
      }
    } catch (e) {
      console.warn('Backhaul create fallback:', e);
    }
    throw new Error("Failed to create backhaul trip");
  },

  async getBuyerDemands(): Promise<BuyerDemand[]> {
    try {
      const res = await fetchWithAuth('/api/buyers/demand');
      if (res.ok) {
        const data = await res.json();
        return data.demands;
      }
    } catch (e) {
      console.warn('Buyer demand fallback:', e);
    }
    return SEED_BUYER_DEMANDS;
  },

  
  async getOffers(harvestId?: string): Promise<any[]> {
    try {
      const url = harvestId ? `/api/offers?harvestId=${harvestId}` : '/api/offers';
      const res = await fetchWithAuth(url);
      if (res.ok) {
        const data = await res.json();
        return data.offers;
      }
    } catch (e) {
      console.warn('API error fetching offers:', e);
    }
    return [];
  },

  async createOffer(offerData: any): Promise<any> {
    const res = await fetchWithAuth('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offerData),
    });
    if (!res.ok) throw new Error("Failed to create offer");
    const data = await res.json();
    return data.offer;
  },

  async getServiceProviders(): Promise<ServiceProvider[]> {
    try {
      const res = await fetchWithAuth('/api/service-providers');
      if (res.ok) {
        const data = await res.json();
        return data.providers;
      }
    } catch (e) {
      console.warn('Service providers fallback:', e);
    }
    return SEED_SERVICE_PROVIDERS;
  },

  async getPriceBenchmarks(): Promise<Record<string, PriceBenchmark>> {
    try {
      const res = await fetchWithAuth('/api/prices/benchmark');
      if (res.ok) {
        const data = await res.json();
        return data.benchmarks;
      }
    } catch (e) {
      console.warn('Price benchmark fallback:', e);
    }
    return SEED_PRICE_BENCHMARKS;
  },

  async getMandiPrices(filters?: { commodity?: string; state?: string; district?: string }): Promise<{
    success: boolean;
    available: boolean;
    records: any[];
    error?: string;
    message?: string;
    lastUpdated?: string;
    source?: string;
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.commodity) params.append('commodity', filters.commodity);
      if (filters?.state) params.append('state', filters.state);
      if (filters?.district) params.append('district', filters.district);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await fetchWithAuth(`/api/mandi/prices${queryString}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Mandi prices fetch error:', e);
    }
    return {
      success: false,
      available: false,
      error: 'Government mandi feed unavailable',
      message: 'Government mandi feed unavailable',
      records: []
    };
  },

  async analyzeQuality(crop: string, base64Image?: string, sampleType: 'grade_a' | 'grade_b' = 'grade_a'): Promise<QualityAnalysisResult> {
    try {
      const res = await fetchWithAuth('/api/quality/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop, base64Image, sampleType }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.result;
      }
    } catch (e) {
      console.warn('Quality analyze fallback:', e);
    }
    return {
      crop,
      estimatedGrade: sampleType === 'grade_a' ? 'Grade A' : 'Grade B',
      confidence: sampleType === 'grade_a' ? 91 : 84,
      colorUniformity: sampleType === 'grade_a' ? 94 : 79,
      visibleDefects: sampleType === 'grade_a' ? 'Low' : 'Medium',
      sizeConsistency: sampleType === 'grade_a' ? 'High' : 'Medium',
      firmnessScore: sampleType === 'grade_a' ? 92 : 81,
      recommendation: sampleType === 'grade_a'
        ? 'Grade A Premium: Optimal for restaurant & hotel contracts.'
        : 'Grade B Standard: Suitable for processing or wholesale.',
      isAiAssistedEstimate: true,
    };
  },

  async processVoice(transcript: string): Promise<any> {
    try {
      const res = await fetchWithAuth('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.extracted;
      }
    } catch (e) {
      console.warn('Voice API fallback:', e);
    }
    return {
      crop: 'Tomato',
      quantityKg: 100,
      sellingWindow: 'Tomorrow Morning',
      minAcceptablePrice: 12,
      farmerIntent: 'confirmed',
      hindiReply: 'Ram-ram ji! Aapke 100 kg tamatar ka entry taiyyar hai (bhav ₹12/kg).'
    };
  },

  async simulateFarmerCall(farmerName: string = 'Ramesh Patel', crop: string = 'Tomato', quantityKg: number = 100): Promise<any> {
    try {
      const res = await fetchWithAuth('/api/calls/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerName, crop, quantityKg }),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      console.warn('Call simulation fallback:', e);
    }
    return {
      success: true,
      callId: `CALL-${Date.now()}`,
      farmerName,
      status: 'completed',
      durationSeconds: 24,
      script: [
        { speaker: 'AI Assistant', text: `Namaste ${farmerName} ji! Main AgriChain se bol raha hoon.` },
        { speaker: 'AI Assistant', text: `Aapke ${quantityKg} kg ${crop} ki entry mili hai. Kya aap ise kal bechna chahte hain?` },
        { speaker: farmerName, text: 'Haan, kal subah tak taiyyar ho jayega.', isFarmer: true },
        { speaker: 'AI Assistant', text: 'Aapka minimum bhav kya hona chahiye?' },
        { speaker: farmerName, text: '12 rupaye kilo kam se kam.', isFarmer: true },
        { speaker: 'AI Assistant', text: 'Thik hai Ramesh ji! Main aapke liye buyers aur shared transport options compile karta hoon.' }
      ],
      extractedHarvest: {
        crop,
        quantityKg,
        minAcceptablePrice: 12,
        sellingWindow: 'Tomorrow Morning',
        location: 'Sanwer (Cluster A), Indore'
      }
    };
  },

  async getAdminDashboard(): Promise<any> {
    try {
      const res = await fetchWithAuth('/api/dashboard/admin');
      if (res.ok) {
        const data = await res.json();
        return data.metrics;
      }
    } catch (e) {
      console.warn('Admin dashboard fallback:', e);
    }
    return {
      totalFarmers: 420,
      activeHarvestsToday: 30,
      activeConsignmentPools: 8,
      activeTransporters: 10,
      availableReturnTrucks: 3,
      activeBuyerDemands: 10,
      averageFarmerNetValue: 14.20,
      traditionalMandiNet: 11.00,
      farmerNetGainPercentage: 29.1,
      averageLogisticsCostPerKg: 1.20,
      estimatedWastageAvoidedKg: 4250,
      completedTransactionsCount: 148,
      totalGrossVolumeInr: 1285000,
      verifiedServiceProviders: 10,
      activeTrustAlertsCount: 0
    };
  }
};
