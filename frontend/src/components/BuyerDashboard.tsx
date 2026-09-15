import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, CheckCircle2, Clock, MapPin, ShieldCheck, DollarSign, Store, ArrowRight, Package } from 'lucide-react';
import { Buyer, BuyerDemand, Harvest, FarmerPool, Order } from '../../../shared/types';
import { SEED_BUYERS, SEED_BUYER_DEMANDS } from '../../../shared/data/seedData';
import { api } from '../services/api';
import { useOrders } from '../hooks/useOrders';
import { OrderStatusTimeline } from './OrderStatusTimeline';

export const BuyerDashboard: React.FC = () => {
  const [buyer] = useState<Buyer>(SEED_BUYERS[0]); // Shreemaya Hotel & Restaurants
  const [demands, setDemands] = useState<BuyerDemand[]>(SEED_BUYER_DEMANDS);
  const [showPostModal, setShowPostModal] = useState(false);
  const [acceptedOffer, setAcceptedOffer] = useState<string | null>(null);

  // New demand form state
  const [crop, setCrop] = useState('Tomato');
  const [requiredQty, setRequiredQty] = useState<number>(500);
  const [maxPrice, setMaxPrice] = useState<number>(18.0);
  const [requiredBy, setRequiredBy] = useState('Tomorrow 8:00 AM');

  // Available farm produce ready for purchase
  const [realHarvests, setRealHarvests] = useState<Harvest[]>([]);
  const [realPools, setRealPools] = useState<FarmerPool[]>([]);
  
  const { orders, refreshOrders } = useOrders();

  useEffect(() => {
    api.getHarvests().then(h => setRealHarvests(h));
    api.getPools().then(p => setRealPools(p));
  }, []);

  const handleCreateOrder = async (poolId: string, crop: string, quantityKg: number, agreedPrice: number) => {
    try {
      await api.createOrder({
        pool_id: poolId,
        crop,
        quantity_kg: quantityKg,
        agreed_price_per_kg: agreedPrice,
        pickup_location: "Cluster A",
        delivery_location: buyer.location
      });
      alert(`Order for ${quantityKg}kg of ${crop} created successfully!`);
      refreshOrders();
    } catch(e: any) {
      alert("Error creating order: " + e.message);
    }
  };

  const handlePlaceOffer = async (harvestId: string, crop: string, quantityKg: number) => {
    try {
      await api.createOffer({
        harvestId,
        crop,
        quantityKg,
        offeredPrice: 18.0,
        destination: buyer.location,
        pickupTerms: 'Farmgate'
      });
      alert("Offer placed successfully for ₹18/kg!");
    } catch(e) {
      alert("Error placing offer. Are you logged in as a buyer? " + e);
    }
  };
  const availableProduce = [
    {
      id: 'prod-1',
      crop: 'Tomato',
      variety: 'Hybrid Grade A',
      quantity: '640 kg',
      location: 'Sanwer (6 km away)',
      quality: 'Grade A',
      expectedPrice: '₹18 / kg',
      deliveryTime: 'Today, within 3 hours',
      farmer: 'Ramesh Patel & Cluster A',
    },
    {
      id: 'prod-2',
      crop: 'Soybean',
      variety: 'JS-335',
      quantity: '1,200 kg',
      location: 'Dewas Hub (14 km away)',
      quality: 'Grade A',
      expectedPrice: '₹46 / kg',
      deliveryTime: 'Tomorrow Morning',
      farmer: 'Dewas Kisan FPO Hub',
    },
    {
      id: 'prod-3',
      crop: 'Onion',
      variety: 'Nashik Red Medium',
      quantity: '850 kg',
      location: 'Hatod Cluster (8 km away)',
      quality: 'Grade B+',
      expectedPrice: '₹22 / kg',
      deliveryTime: 'Today Afternoon',
      farmer: 'Mukesh Choudhary',
    },
  ];

  const handlePostDemand = async () => {
    setDemands((prev) => [
      {
        id: `dem-${Date.now()}`,
        buyerId: buyer.id,
        buyerName: buyer.name,
        buyerType: buyer.businessType,
        crop,
        requiredQuantityKg: requiredQty,
        qualityGrade: 'Grade A',
        requiredBy,
        maxLandedPrice: maxPrice,
        deliveryLocation: buyer.location,
        status: 'open',
      },
      ...prev,
    ]);
    setShowPostModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Title & Post Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Direct Produce Sourcing
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Procure fresh produce directly from verified farm pools with certified quality.
          </p>
        </div>

        <button
          id="btn-post-demand"
          type="button"
          onClick={() => setShowPostModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 text-xs transition-colors cursor-pointer self-start sm:self-center active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Post Demand</span>
        </button>
      </div>

      {/* Available Pools Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 font-display">
            Available Farm Pools
          </h2>
          <span className="text-xs text-slate-500">{realPools.length} verified pools nearby</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {realPools.slice(0,3).map((pool) => (
            <div 
              key={pool.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900 font-display">{pool.crop}</span>
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    {pool.poolCode}
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-emerald-700 font-display">
                  {pool.totalQuantityKg} kg
                </div>
                <div className="space-y-1 text-xs text-slate-600 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Farmers:</span>
                    <span className="font-semibold text-slate-800">{pool.farmerCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="font-medium text-slate-800">{pool.clusterName}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  const qty = prompt(`How many kg of ${pool.crop} do you want to order?`, pool.totalQuantityKg.toString());
                  if (!qty) return;
                  const price = prompt(`Enter price per kg for ${pool.crop} (e.g. 18):`, "18");
                  if (!price) return;
                  handleCreateOrder(pool.id, pool.crop, Number(qty), Number(price));
                }}
                className="w-full py-2.5 rounded-xl border-2 border-emerald-500 text-emerald-600 font-bold text-xs hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                Create Order
              </button>
            </div>
          ))}
          {availableProduce.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900 font-display">{item.crop}</span>
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    {item.quality}
                  </span>
                </div>

                <div className="text-2xl font-extrabold text-emerald-700 font-display">
                  {item.expectedPrice}
                </div>

                <div className="space-y-1 text-xs text-slate-600 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Quantity:</span>
                    <span className="font-semibold text-slate-800">{item.quantity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="font-semibold text-slate-800">{item.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Delivery:</span>
                    <span className="font-semibold text-slate-800">{item.deliveryTime}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAcceptedOffer(item.id)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  acceptedOffer === item.id 
                    ? 'bg-emerald-800 text-white' 
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                }`}
              >
                {acceptedOffer === item.id ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Offer Locked</span>
                  </>
                ) : (
                  <>
                    <span>View Offer</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* My Active Orders List */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-600" />
          My Active Orders
        </h3>
        {orders.length === 0 ? (
          <div className="text-sm text-slate-500 py-4 text-center">No active orders found.</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{order.crop}</div>
                    <div className="text-xs text-slate-500">Order ID: {order.id.substring(0, 8)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-700">{order.quantity_kg} kg</div>
                    <div className="text-xs font-semibold text-slate-700">₹{order.agreed_price_per_kg}/kg</div>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                   <OrderStatusTimeline currentStatus={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Buyer Demands List */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 font-display">Your Posted Demands</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Crop</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Target Rate</th>
                <th className="py-3 px-4">Required By</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {demands.map((dem) => (
                <tr key={dem.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{dem.crop}</td>
                  <td className="py-3.5 px-4 font-medium">{dem.requiredQuantityKg} kg</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]">
                      {dem.qualityGrade}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">₹{dem.maxLandedPrice.toFixed(2)}/kg</td>
                  <td className="py-3.5 px-4 text-slate-600">{dem.requiredBy}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                      {dem.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Post New Demand */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 font-display">Post Commercial Demand</h3>
            <p className="text-xs text-slate-500">AgriChain will automatically match nearby farm pools.</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Crop</label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Tomato">Tomato</option>
                  <option value="Onion">Onion</option>
                  <option value="Potato">Potato</option>
                  <option value="Garlic">Garlic</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Required Quantity (kg)</label>
                <input
                  type="number"
                  value={requiredQty}
                  onChange={(e) => setRequiredQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Max Landed Price (₹/kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Required By</label>
                <input
                  type="text"
                  value={requiredBy}
                  onChange={(e) => setRequiredBy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePostDemand}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
              >
                Broadcast Demand
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
