const fs = require('fs');

// Update TallerFormModal.tsx
let tallerPath = 'src/pages/Mavet/talleres/TallerFormModal.tsx';
let taller = fs.readFileSync(tallerPath, 'utf8');

taller = taller.replace(
  'const labelCls = "block mb-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300";',
  'const labelCls = "block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200";'
);
taller = taller.replace(
  'const baseInputCls = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all";',
  'const baseInputCls = "w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm";'
);
taller = taller.replace(
  '<Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-0">',
  '<Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-0 overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-xl">'
);
fs.writeFileSync(tallerPath, taller);

// Update InventarioBoveda.tsx
let bovedaPath = 'src/pages/Mavet/InventarioBoveda.tsx';
let boveda = fs.readFileSync(bovedaPath, 'utf8');

// Replace all small uppercase labels with normal bold titles
boveda = boveda.replace(
  /className="block mb-1 text-\[11px\] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"/g,
  'className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200"'
);
boveda = boveda.replace(
  /className="block mb-1.5 text-\[11px\] font-semibold text-brand-700 dark:text-brand-400 uppercase tracking-wider"/g,
  'className="block mb-2 text-sm font-bold text-brand-700 dark:text-brand-400"'
);

// Replace input borders and radius to make them premium
boveda = boveda.replace(/rounded-lg border px-3 py-1\.5/g, 'rounded-xl border px-3.5 py-2.5');
boveda = boveda.replace(/focus:ring-2 focus:ring-brand-500\/20/g, 'focus:ring-4 focus:ring-brand-500/20 shadow-sm transition-all duration-200');
boveda = boveda.replace(/focus:ring-2 focus:ring-red-500\/20/g, 'focus:ring-4 focus:ring-red-500/20 shadow-sm transition-all duration-200');
boveda = boveda.replace(/rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900\/50 px-3 py-1\.5 text-sm/g, 'rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-3.5 py-2.5 text-sm shadow-sm transition-all duration-200');
boveda = boveda.replace(/rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-1\.5 text-sm/g, 'rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm shadow-sm transition-all duration-200');

fs.writeFileSync(bovedaPath, boveda);
console.log("Done");
