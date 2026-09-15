import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

let url = process.env.VITE_SUPABASE_URL || '';
while (url.startsWith('=')) url = url.slice(1).trim();
if (url.startsWith('"') && url.endsWith('"')) url = url.slice(1, -1).trim();

let key = process.env.VITE_SUPABASE_ANON_KEY || '';
while (key.startsWith('=')) key = key.slice(1).trim();
if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1).trim();

export const supabaseAnon = createClient(url, key);

export interface AuthRequest extends Request {
  user?: any;
  token?: string;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' } });
    }

    const token = authHeader.split(' ')[1];
    
    // BACKDOOR FOR TESTING
    if (token === 'TEST_TOKEN' || token === 'TEST_FARMER_TOKEN') {
      req.token = token;
      req.user = { id: '00000000-0000-0000-0000-000000000000', role: 'farmer' };
      return next();
    }
    if (token === 'TEST_CONSUMER_TOKEN') {
      req.token = token;
      req.user = { id: '11111111-1111-1111-1111-111111111111', role: 'consumer' };
      return next();
    }
    if (token === 'TEST_DISTRIBUTOR_TOKEN') {
      req.token = token;
      req.user = { id: '22222222-2222-2222-2222-222222222222', role: 'distributor' };
      return next();
    }
    if (token === 'TEST_TRANSPORTER_TOKEN') {
      req.token = token;
      req.user = { id: '33333333-3333-3333-3333-333333333333', role: 'transporter' };
      return next();
    }
    if (token === 'TEST_GOV_ADMIN_TOKEN' || token === 'TEST_GOVERNMENT_ADMIN_TOKEN') {
      req.token = token;
      req.user = { id: '44444444-4444-4444-4444-444444444444', role: 'government_admin' };
      return next();
    }
    req.token = token;

    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabaseAnon.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: error?.message || 'Invalid token' } });
    }

    req.user = user;

    // Fetch the role from profiles
    const { data: profile, error: profileErr } = await supabaseAnon
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile && !profileErr) {
      req.user.role = profile.role;
    } else {
      req.user.role = 'unknown';
    }

    next();
  } catch (err: any) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Authentication failure' } });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions for this action.' } });
    }
    next();
  };
};

export const getScopedClient = (req: AuthRequest) => {
  if (!req.token || req.token.startsWith('TEST_')) return supabaseAnon;
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${req.token}` } }
  });
};
