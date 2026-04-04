export const AVAILABLE_BRANCHES = [
  /* ── SAURASHTRA ── */
  { id: "BR_RAJKOT",       name: "Rajkot",         city: "Rajkot" },
  { id: "BR_JAMNAGAR",     name: "Jamnagar",       city: "Jamnagar" },
  { id: "BR_JUNAGADH",     name: "Junagadh",       city: "Junagadh" },
  { id: "BR_BHAVNAGAR",    name: "Bhavnagar",      city: "Bhavnagar" },
  { id: "BR_PORBANDAR",    name: "Porbandar",      city: "Porbandar" },
  { id: "BR_MORBI",        name: "Morbi",          city: "Morbi" },
  { id: "BR_SURENDRANAGAR",name: "Surendranagar",  city: "Surendranagar" },

  /* ── SOUTH GUJARAT ── */
  { id: "SRT001",          name: "Surat",          city: "Surat" },
  { id: "BR_VAPI",         name: "Vapi",           city: "Vapi" },
  { id: "BR_NAVSARI",      name: "Navsari",        city: "Navsari" },
  { id: "BR_BHARUCH",      name: "Bharuch",        city: "Bharuch" },
  { id: "BR_BARDOLI",      name: "Bardoli",        city: "Bardoli" },
  { id: "BR_TAPI",         name: "Tapi",           city: "Tapi" },

  /* ── CENTRAL GUJARAT ── */
  { id: "BR_AHMEDABAD",    name: "Ahmedabad",      city: "Ahmedabad" },
  { id: "BR_VADODARA",     name: "Vadodara",       city: "Vadodara" },
  { id: "BR_ANAND",        name: "Anand",          city: "Anand" },
  { id: "BR_NADIAD",       name: "Nadiad",         city: "Nadiad" },
  { id: "BR_GODHRA",       name: "Godhra",         city: "Godhra" },
  { id: "BR_DAHOD",        name: "Dahod",          city: "Dahod" },

  /* ── NORTH GUJARAT ── */
  { id: "BR_MEHSANA",      name: "Mehsana",        city: "Mehsana" },
  { id: "BR_GANDHINAGAR",  name: "Gandhinagar",    city: "Gandhinagar" },
  { id: "BR_PATAN",        name: "Patan",          city: "Patan" },
  { id: "BR_BANASKANTHA",  name: "Banaskantha",    city: "Banaskantha" },
  { id: "BR_SABARKANTHA",  name: "Sabarkantha",    city: "Sabarkantha" },
  { id: "BR_HIMMATNAGAR",  name: "Himmatnagar",    city: "Himmatnagar" }

];

// --- Helper: Get Branch Name ---
export const getBranchName = (branchId) => {
  const branch = AVAILABLE_BRANCHES.find(b => b.id === branchId);
  return branch ? branch.name : "Unknown Branch";
};