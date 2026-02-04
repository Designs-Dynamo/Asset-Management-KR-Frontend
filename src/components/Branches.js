export const AVAILABLE_BRANCHES = [
  { id: 'BH001', name: 'Downtown Tech Hub', city: 'New York' },
  { id: 'BH002', name: 'Westside Logistics', city: 'Los Angeles' },
  { id: 'JM005', name: 'Jamnager', city: 'Chicago' },
  { id: 'HQ',    name: 'Corporate Headquarters', city: 'San Francisco' },
];

// --- Helper: Get Branch Name ---
export const getBranchName = (branchId) => {
  const branch = AVAILABLE_BRANCHES.find(b => b.id === branchId);
  return branch ? branch.name : "Unknown Branch";
};