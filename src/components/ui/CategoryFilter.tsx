'use client';

// import { useState } from 'react';
// import { CATEGORIES } from '@/lib/constants';

// export default function CategoryFilter() {
//   const [selected, setSelected] = useState('Tout');

//   return (
//     <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
//       {CATEGORIES.map((cat) => (
//         <button
//           key={cat}
//           onClick={() => setSelected(cat)}
//           className={`px-5 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
//             cat === selected
//               ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-200'
//               : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
//           }`}
//         >
//           {cat}
//         </button>
//       ))}
//     </div>
//   );
// }