export const AVAILABLE_BRANCHES = [
  { id: 'BH001', name: 'Downtown Tech Hub', city: 'New York' },
  { id: 'BH002', name: 'Westside Logistics', city: 'Los Angeles' },
  { id: 'JM005', name: 'Jamnager', city: 'Chicago' },
  { id: 'HQ',    name: 'Corporate Headquarters', city: 'San Francisco' },
  { id: 'SRT001',name: 'Surat-Kellogs', city: 'Surat' },
  { id: 'BR_PATAN',name: 'Patan', city: 'Patan' },
  { id: 'BR_AHEMDABAD',name: 'Ahemdabad-HO', city: 'Ahemdabad' },
  { id: 'BR_VADODARA',name: 'Vadodara-Kellogs', city: 'Vadodara' },
  { id: 'BR_RAJKOT',name: 'Rajkot', city: 'Rajkot' },
];

// --- Helper: Get Branch Name ---
export const getBranchName = (branchId) => {
  const branch = AVAILABLE_BRANCHES.find(b => b.id === branchId);
  return branch ? branch.name : "Unknown Branch";
};