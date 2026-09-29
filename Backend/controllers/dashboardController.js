import { querySchema } from '../services/validation.js';
import { store, ok } from './helpers.js';
export const getDashboard = async (req, res) => {
  const q = querySchema.pick({ phcId: true, date: true }).parse(req.query);
  const collections = ['phcs', 'inventory', 'beds', 'staff', 'footfall', 'alerts', 'transfers'];
  const [allPhcs, allInventory, allBeds, allStaff, allFootfall, allAlerts, allTransfers] =
    await Promise.all(collections.map(c => store(req).list(c)));
  const phcs = allPhcs.filter(v => !q.phcId || v.id === q.phcId);
  const ids = new Set(phcs.map(v => v.id));
  const live = rows => rows.filter(v => ids.has(v.phcId));
  const inventory = live(allInventory), beds = live(allBeds), staff = live(allStaff);
  const footfall = live(allFootfall).filter(v => !q.date || v.date === q.date);
  const alerts = live(allAlerts).filter(v => v.status === 'ACTIVE');
  const sum = (rows, field) => rows.reduce((total, v) => total + (v[field] ?? 0), 0);
  ok(res, { totalPHCs: phcs.length, totalPatients: sum(footfall, 'patients'),
    totalBeds: sum(beds, 'totalBeds'), occupiedBeds: sum(beds, 'occupiedBeds'),
    availableBeds: sum(beds, 'availableBeds'), activeAlerts: alerts.length,
    criticalAlerts: alerts.filter(v => v.severity === 'CRITICAL').length,
    medicineShortages: inventory.filter(v => v.quantity <= v.minimumStock).length,
    doctorsPresent: staff.reduce((n, v) => n + v.doctors.present, 0),
    nursesPresent: staff.reduce((n, v) => n + v.nurses.present, 0),
    pendingTransfers: allTransfers.filter(v => ids.has(v.fromPhcId) || ids.has(v.toPhcId))
      .filter(v => ['PENDING', 'APPROVED', 'IN_TRANSIT'].includes(v.status)).length,
    date: q.date ?? null });
};
