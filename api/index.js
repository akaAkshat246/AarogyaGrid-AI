import { createApp } from '../Backend/app.js';
import { memoryStore } from '../Backend/test/support/memoryStore.js';
import { createAIService } from '../Backend/services/aiService.js';

let appInstance = null;

function getApp() {
  if (appInstance) return appInstance;

  const store = memoryStore();
  const auth = { verifyIdToken: async () => ({ uid: 'serverless-user' }) };

  const defaultPhcs = [
    { id: 'phc-noida-sec22', name: 'PHC Sector 22 Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', latitude: 28.5960, longitude: 77.3480, pincode: '201301', total_beds: 24, doctors: 4, nurses: 8 },
    { id: 'phc-noida-sec62', name: 'PHC Sector 62 Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', latitude: 28.6270, longitude: 77.3620, pincode: '201309', total_beds: 32, doctors: 5, nurses: 10 },
    { id: 'phc-gr-noida-beta', name: 'CHC Beta 1 Greater Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', latitude: 28.4720, longitude: 77.5080, pincode: '201308', total_beds: 40, doctors: 6, nurses: 12 },
    { id: 'phc-dadri-rural', name: 'PHC Dadri Rural', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', latitude: 28.5530, longitude: 77.5540, pincode: '203207', total_beds: 16, doctors: 3, nurses: 6 },
    { id: 'phc-delhi-east-01', name: 'PHC Laxmi Nagar', district: 'Delhi East', state: 'Delhi', latitude: 28.6315, longitude: 77.2773, pincode: '110092', total_beds: 24, doctors: 4, nurses: 8 },
    { id: 'phc-delhi-east-02', name: 'PHC Mayur Vihar', district: 'Delhi East', state: 'Delhi', latitude: 28.6083, longitude: 77.2952, pincode: '110091', total_beds: 30, doctors: 5, nurses: 10 },
    { id: 'phc-delhi-south-01', name: 'PHC Saket', district: 'Delhi South', state: 'Delhi', latitude: 28.5244, longitude: 77.2167, pincode: '110017', total_beds: 36, doctors: 6, nurses: 12 },
    { id: 'phc-delhi-south-02', name: 'PHC Hauz Khas', district: 'Delhi South', state: 'Delhi', latitude: 28.5494, longitude: 77.2001, pincode: '110016', total_beds: 20, doctors: 3, nurses: 6 },
    { id: 'phc-delhi-north-01', name: 'PHC Rohini Sec-15', district: 'Delhi North', state: 'Delhi', latitude: 28.7180, longitude: 77.1264, pincode: '110089', total_beds: 28, doctors: 4, nurses: 8 },
    { id: 'phc-delhi-central-01', name: 'PHC Karol Bagh', district: 'Delhi Central', state: 'Delhi', latitude: 28.6514, longitude: 77.1907, pincode: '110005', total_beds: 22, doctors: 4, nurses: 8 },
    { id: 'phc-ghaziabad-rural', name: 'PHC Muradnagar Rural', district: 'Ghaziabad', state: 'Uttar Pradesh', latitude: 28.7770, longitude: 77.5020, pincode: '201206', total_beds: 20, doctors: 3, nurses: 6 },
    { id: 'phc-ghaziabad-rajnagar', name: 'CHC Raj Nagar', district: 'Ghaziabad', state: 'Uttar Pradesh', latitude: 28.6920, longitude: 77.4410, pincode: '201002', total_beds: 40, doctors: 6, nurses: 12 },
    { id: 'phc-ghaziabad-indirapuram', name: 'PHC Indirapuram', district: 'Ghaziabad', state: 'Uttar Pradesh', latitude: 28.6410, longitude: 77.3710, pincode: '201014', total_beds: 24, doctors: 4, nurses: 8 },
    { id: 'phc-ghaziabad-sahibabad', name: 'PHC Sahibabad', district: 'Ghaziabad', state: 'Uttar Pradesh', latitude: 28.6710, longitude: 77.3750, pincode: '201005', total_beds: 22, doctors: 3, nurses: 6 },
    { id: 'phc-gurgaon-sec14', name: 'PHC Sector 14 Gurgaon', district: 'Gurgaon', state: 'Haryana', latitude: 28.4740, longitude: 77.0420, pincode: '122001', total_beds: 24, doctors: 4, nurses: 8 },
    { id: 'phc-faridabad-nit', name: 'PHC Faridabad NIT', district: 'Faridabad', state: 'Haryana', latitude: 28.3880, longitude: 77.3010, pincode: '121001', total_beds: 28, doctors: 4, nurses: 8 }
  ];

  for (const p of defaultPhcs) {
    store.put('phcs', p.id, {
      name: p.name,
      district: p.district,
      state: p.state,
      latitude: p.latitude,
      longitude: p.longitude,
      pincode: p.pincode
    });
    store.put('beds', p.id, {
      totalBeds: p.total_beds,
      occupiedBeds: Math.floor(p.total_beds * 0.7),
      icuBeds: 4
    });
    store.put('staff', p.id, {
      doctorsTotal: p.doctors,
      doctorsPresent: Math.max(1, p.doctors - 1),
      nursesTotal: p.nurses,
      nursesPresent: Math.max(2, p.nurses - 1)
    });
  }

  const dummyMedicines = [
    { phcId: 'phc-noida-sec22', medicine: 'Insulin Glargine 100IU', quantity: 31, minimumStock: 100, dailyUsage: 22 },
    { phcId: 'phc-noida-sec62', medicine: 'Insulin Glargine 100IU', quantity: 503, minimumStock: 80, dailyUsage: 14 },
    { phcId: 'phc-delhi-east-01', medicine: 'ORS Rehydration Salts', quantity: 112, minimumStock: 300, dailyUsage: 35 },
    { phcId: 'phc-ghaziabad-rural', medicine: 'IV Normal Saline 500ml', quantity: 45, minimumStock: 250, dailyUsage: 30 }
  ];

  for (const item of dummyMedicines) {
    store.create('inventory', item);
  }

  const config = {
    skipAuth: true,
    origins: ['*'],
    AI_URL: 'http://127.0.0.1:8000',
    AI_PREDICT_PATH: '/predict',
    AI_TIMEOUT_MS: 10000
  };

  const predict = createAIService(config);
  appInstance = createApp({ store, auth, config, predict });
  return appInstance;
}

export default function handler(req, res) {
  const app = getApp();
  return app(req, res);
}
