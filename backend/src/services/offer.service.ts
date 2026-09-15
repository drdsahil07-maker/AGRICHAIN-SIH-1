import { AuthRequest, getScopedClient } from '../middleware/auth';

export const getOffers = async (req: AuthRequest, harvestId?: string) => {
  const supabase = getScopedClient(req);
  
  let query = supabase.from('buyer_offers').select('*').order('created_at', { ascending: false });
  
  if (harvestId) {
    query = query.eq('harvest_id', harvestId);
  }

  const { data, error } = await query;

  if (error) {
    if (error.code === '42P01') {
       throw new Error("Table 'buyer_offers' does not exist. Please run migration 002_create_buyer_offers.sql");
    }
    throw new Error(error.message);
  }

  return data.map(o => ({
    id: o.id,
    buyerId: o.buyer_id,
    buyerName: o.buyer_name,
    harvestId: o.harvest_id,
    crop: o.crop,
    quantityKg: Number(o.quantity_kg),
    offeredPrice: Number(o.offered_price),
    destination: o.destination,
    pickupTerms: o.pickup_terms,
    status: o.status,
    createdAt: o.created_at
  }));
};

export const createOffer = async (req: AuthRequest, data: any) => {
  const supabase = getScopedClient(req);
  
  if (!req.user || !req.user.id) {
    throw new Error("Authenticated user required to create an offer");
  }

  const buyerId = req.user.id;
  
  // If the frontend passed buyerId, ensure it matches the authenticated user
  if (data.buyerId && data.buyerId !== buyerId) {
    throw new Error("Cannot create offer for another buyer.");
  }

  // Fetch the buyer's profile to get their real name if not provided
  let buyerName = data.buyerName;
  if (!buyerName) {
     const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', buyerId).single();
     buyerName = profile?.full_name || 'Unknown Buyer';
  }

  const {
    harvestId,
    crop,
    quantityKg,
    offeredPrice,
    destination,
    pickupTerms = 'Farmgate',
  } = data;
  
  if (!harvestId || !crop || !quantityKg || !offeredPrice || !destination) {
     throw new Error("Missing required fields for offer: harvestId, crop, quantityKg, offeredPrice, destination");
  }

  const insertData = {
    buyer_id: buyerId,
    buyer_name: buyerName,
    harvest_id: harvestId,
    crop,
    quantity_kg: Number(quantityKg),
    offered_price: Number(offeredPrice),
    destination,
    pickup_terms: pickupTerms,
    status: 'ACTIVE'
  };

  const { data: result, error } = await supabase
    .from('buyer_offers')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    if (error.code === '42P01') {
       throw new Error("Table 'buyer_offers' does not exist. Please run migration 002_create_buyer_offers.sql");
    }
    throw new Error(error.message);
  }

  return {
    id: result.id,
    buyerId: result.buyer_id,
    buyerName: result.buyer_name,
    harvestId: result.harvest_id,
    crop: result.crop,
    quantityKg: Number(result.quantity_kg),
    offeredPrice: Number(result.offered_price),
    destination: result.destination,
    pickupTerms: result.pickup_terms,
    status: result.status,
    createdAt: result.created_at
  };
};
