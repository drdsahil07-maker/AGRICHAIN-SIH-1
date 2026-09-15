export interface CallRecordItem {
  id: string;
  farmerName: string;
  phoneNumber: string;
  location: string;
  crop: string;
  cropHindi: string;
  cropIcon: string;
  quantityKg: number;
  minAcceptablePrice: number;
  marketPriceBenchmark: number;
  durationSeconds: number;
  timestamp: string;
  dateStr: string;
  status: 'confirmed' | 'compiled' | 'in_transit';
  dialogue: {
    speaker: string;
    text: string;
    isAi: boolean;
    timestamp?: string;
  }[];
}

export const INITIAL_CALL_RECORDS: CallRecordItem[] = [
  {
    id: 'CALL-2026-1048',
    farmerName: 'Ramesh Patel',
    phoneNumber: '+91 98260 11234',
    location: 'Sanwer (Cluster A), Indore',
    crop: 'Tomato',
    cropHindi: 'Tamatar',
    cropIcon: '🍅',
    quantityKg: 150,
    minAcceptablePrice: 14.0,
    marketPriceBenchmark: 10.5,
    durationSeconds: 38,
    timestamp: 'Today, 10:45 AM',
    dateStr: '2026-09-10',
    status: 'compiled',
    dialogue: [
      {
        speaker: 'AgriMitra (AI Calling Assistant)',
        text: 'Namaste Ramesh ji! Main AgriChain se aapka AI Calling Assistant AgriMitra bol raha hoon. Ramesh ji, aaj aapke khet mein kaun si fasal (crop) taiyyar hui hai bechne ke liye?',
        isAi: true,
        timestamp: '10:45:02 AM'
      },
      {
        speaker: 'Ramesh Patel (Farmer)',
        text: 'Bhaiya hamare paas Tamatar (Tomato) taiyyar hai.',
        isAi: false,
        timestamp: '10:45:12 AM'
      },
      {
        speaker: 'AgriMitra (AI Calling Assistant)',
        text: 'Bahut achha, Tamatar! Aur Tamatar ka kitna amount (quantity / wazan) hai aapke paas bechne ke liye?',
        isAi: true,
        timestamp: '10:45:16 AM'
      },
      {
        speaker: 'Ramesh Patel (Farmer)',
        text: 'Lagbhag 150 kilo tamatar hai, kal subah tak pack ho jayega.',
        isAi: false,
        timestamp: '10:45:24 AM'
      },
      {
        speaker: 'AgriMitra (AI Calling Assistant)',
        text: 'Samajh gaya 150 kilo. Ramesh ji, aapka minimum price (kam se kam bhav) kya hona chahiye prati kilo taaki aapko pura munafa mile?',
        isAi: true,
        timestamp: '10:45:28 AM'
      },
      {
        speaker: 'Ramesh Patel (Farmer)',
        text: 'Kam se kam 14 rupaye kilo bhav milna chahiye bhaiya. Mandi mein vyapari bohot kam laga rahe hain.',
        isAi: false,
        timestamp: '10:45:34 AM'
      },
      {
        speaker: 'AgriMitra (AI Calling Assistant)',
        text: 'Bilkul theek Ramesh ji! 150 kg Tamatar @ minimum ₹14/kg confirm ho gaya hai. AgriChain Indore ke direct buyers aur shared return-trucks compile kar raha hai. Dhanyawad!',
        isAi: true,
        timestamp: '10:45:40 AM'
      }
    ]
  },
  {
    id: 'CALL-2026-1044',
    farmerName: 'Suresh Verma',
    phoneNumber: '+91 98932 45890',
    location: 'Hatod, Indore District',
    crop: 'Onion',
    cropHindi: 'Pyaz',
    cropIcon: '🧅',
    quantityKg: 300,
    minAcceptablePrice: 18.5,
    marketPriceBenchmark: 15.0,
    durationSeconds: 44,
    timestamp: 'Today, 09:20 AM',
    dateStr: '2026-09-10',
    status: 'confirmed',
    dialogue: [
      {
        speaker: 'AgriMitra (AI Calling Assistant)',
        text: 'Namaste Suresh ji! Main AgriChain AI Assistant bol raha hoon. Aaj khet mein kaun si fasal taiyyar hai?',
        isAi: true,
        timestamp: '09:20:04 AM'
      },
      {
        speaker: 'Suresh Verma (Farmer)',
        text: 'Namaste bhaiya, hamare paas 300 kilo laal pyaz taiyyar hai.',
        isAi: false,
        timestamp: '09:20:14 AM'
      },
      {
        speaker: 'AgriMitra (AI Calling Assistant)',
        text: 'Badiya Suresh ji, 300 kg pyaz. Aapka kam se kam (minimum acceptable price) bhav kitna hona chahiye?',
        isAi: true,
        timestamp: '09:20:20 AM'
      },
      {
        speaker: 'Suresh Verma (Farmer)',
        text: 'Humko 18.50 rupaye se kam nahi chalega bhaiya. Mandi mein aashanka hai rates girne ki.',
        isAi: false,
        timestamp: '09:20:30 AM'
      },
      {
        speaker: 'AgriMitra (AI Calling Assistant)',
        text: 'Ji Suresh ji, ₹18.50/kg lock kiya gaya hai. Hum aapko direct restaurant chain buyer se match kar rahe hain.',
        isAi: true,
        timestamp: '09:20:44 AM'
      }
    ]
  },
  {
    id: 'CALL-2026-1039',
    farmerName: 'Anita Bai Chouhan',
    phoneNumber: '+91 97551 88421',
    location: 'Dewas Road Cluster, MP',
    crop: 'Potato',
    cropHindi: 'Aloo',
    cropIcon: '🥔',
    quantityKg: 500,
    minAcceptablePrice: 13.0,
    marketPriceBenchmark: 10.0,
    durationSeconds: 52,
    timestamp: 'Yesterday, 04:15 PM',
    dateStr: '2026-09-09',
    status: 'in_transit',
    dialogue: [
      {
        speaker: 'AgriMitra (AI Calling Assistant)',
        text: 'Namaste Anita ji! AgriChain Calling Assistant se call hai. Fasal ki detail batayein please.',
        isAi: true,
        timestamp: '04:15:05 PM'
      },
      {
        speaker: 'Anita Bai (Farmer)',
        text: 'Haan bhaiya, Jyoti variety aloo hai, lagbhag 500 kilo.',
        isAi: false,
        timestamp: '04:15:18 PM'
      },
      {
        speaker: 'AgriMitra (AI Calling Assistant)',
        text: 'Aapka minimum price kya hai Anita ji?',
        isAi: true,
        timestamp: '04:15:26 PM'
      },
      {
        speaker: 'Anita Bai (Farmer)',
        text: 'Tera rupaye (₹13) prati kilo milna chahiye.',
        isAi: false,
        timestamp: '04:15:38 PM'
      },
      {
        speaker: 'AgriMitra (AI Calling Assistant)',
        text: 'Theek hai Anita ji, 500 kg Aloo @ ₹13/kg confirm ho gaya. Return-trip transporter assign ho gaya hai.',
        isAi: true,
        timestamp: '04:15:52 PM'
      }
    ]
  },
  {
    id: 'CALL-2026-1031',
    farmerName: 'Rajesh Patidar',
    phoneNumber: '+91 94250 33812',
    location: 'Manglia Hub, Indore Outer',
    crop: 'Garlic',
    cropHindi: 'Lahsun',
    cropIcon: '🧄',
    quantityKg: 80,
    minAcceptablePrice: 85.0,
    marketPriceBenchmark: 72.0,
    durationSeconds: 35,
    timestamp: 'Yesterday, 11:30 AM',
    dateStr: '2026-09-09',
    status: 'compiled',
    dialogue: [
      {
        speaker: 'AgriMitra (AI Calling Assistant)',
        text: 'Namaste Rajesh ji! AgriChain AI Assistant. Kaun si fasal hai?',
        isAi: true
      },
      {
        speaker: 'Rajesh Patidar (Farmer)',
        text: 'Lahsun (Garlic) hai, 80 kilo dry Grade A.',
        isAi: false
      },
      {
        speaker: 'AgriMitra (AI Calling Assistant)',
        text: 'Aur aapka minimum price bhav?',
        isAi: true
      },
      {
        speaker: 'Rajesh Patidar (Farmer)',
        text: 'Pachasi rupaye (₹85) kilo se kam nahi bechenge.',
        isAi: false
      },
      {
        speaker: 'AgriMitra (AI Calling Assistant)',
        text: 'Note ho gaya Rajesh ji. Spices wholesaler buyer se direct PO create ho raha hai.',
        isAi: true
      }
    ]
  }
];

const STORAGE_KEY = 'agrichain_call_records_v1';

export const getStoredCallRecords = (): CallRecordItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse stored call records', err);
  }
  return INITIAL_CALL_RECORDS;
};

export const saveCallRecord = (newRecord: Omit<CallRecordItem, 'id' | 'timestamp' | 'dateStr'>): CallRecordItem => {
  const current = getStoredCallRecords();
  const id = `CALL-2026-${Math.floor(1050 + Math.random() * 8950)}`;
  const now = new Date();
  const timeStr = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  const dateStr = now.toISOString().split('T')[0];

  const fullRecord: CallRecordItem = {
    ...newRecord,
    id,
    timestamp: timeStr,
    dateStr,
  };

  const updated = [fullRecord, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save call record', err);
  }

  return fullRecord;
};

export const SEED_CALL_RECORDS = INITIAL_CALL_RECORDS;
