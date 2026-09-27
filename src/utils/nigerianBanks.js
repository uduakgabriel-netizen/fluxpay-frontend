export const NIGERIAN_BANKS = [
  // Top Digital & Fintech Banks
  { id: 'opay', name: 'OPay', code: '999992', category: 'Fintech / Digital', popular: true, color: 'from-[#00B875] to-[#059669]' },
  { id: 'palmpay', name: 'PalmPay', code: '999991', category: 'Fintech / Digital', popular: true, color: 'from-[#673AB7] to-[#512DA8]' },
  { id: 'moniepoint', name: 'Moniepoint MFB', code: '50515', category: 'Fintech / Digital', popular: true, color: 'from-[#032B69] to-[#0052CC]' },
  { id: 'kuda', name: 'Kuda Bank', code: '50211', category: 'Fintech / Digital', popular: true, color: 'from-[#40196D] to-[#280F45]' },
  { id: 'vfd', name: 'VFD Microfinance Bank (VBank)', code: '566', category: 'Fintech / Digital', popular: false, color: 'from-[#B71C1C] to-[#880E4F]' },
  { id: 'fairmoney', name: 'FairMoney MFB', code: '51318', category: 'Fintech / Digital', popular: false, color: 'from-[#1976D2] to-[#0D47A1]' },
  { id: 'carbon', name: 'Carbon (One Finance)', code: '565', category: 'Fintech / Digital', popular: false, color: 'from-[#1F2937] to-[#111827]' },
  { id: 'rubies', name: 'Rubies MFB', code: '125', category: 'Fintech / Digital', popular: false, color: 'from-[#E11D48] to-[#BE123C]' },
  { id: 'raven', name: 'Raven Bank', code: '50860', category: 'Fintech / Digital', popular: false, color: 'from-[#0284C7] to-[#0369A1]' },
  { id: 'gomoney', name: 'Gomoney', code: '100022', category: 'Fintech / Digital', popular: false, color: 'from-[#EA580C] to-[#C2410C]' },

  // Tier-1 Commercial Banks
  { id: 'gtb', name: 'Guaranty Trust Bank (GTBank)', code: '058', category: 'Commercial Bank', popular: true, color: 'from-[#E05A10] to-[#C2410C]' },
  { id: 'access', name: 'Access Bank', code: '044', category: 'Commercial Bank', popular: true, color: 'from-[#F58220] to-[#D96B0F]' },
  { id: 'zenith', name: 'Zenith Bank', code: '057', category: 'Commercial Bank', popular: true, color: 'from-[#EE1C25] to-[#B71219]' },
  { id: 'firstbank', name: 'First Bank of Nigeria', code: '011', category: 'Commercial Bank', popular: true, color: 'from-[#002D62] to-[#001D40]' },
  { id: 'uba', name: 'United Bank for Africa (UBA)', code: '033', category: 'Commercial Bank', popular: true, color: 'from-[#D32F2F] to-[#B71C1C]' },

  // Commercial & Investment Banks
  { id: 'stanbic', name: 'Stanbic IBTC Bank', code: '221', category: 'Commercial Bank', popular: true, color: 'from-[#0033AA] to-[#002277]' },
  { id: 'fidelity', name: 'Fidelity Bank', code: '070', category: 'Commercial Bank', popular: true, color: 'from-[#1A237E] to-[#0D47A1]' },
  { id: 'fcmb', name: 'First City Monument Bank (FCMB)', code: '214', category: 'Commercial Bank', popular: false, color: 'from-[#5C2D91] to-[#3B1A60]' },
  { id: 'sterling', name: 'Sterling Bank', code: '232', category: 'Commercial Bank', popular: false, color: 'from-[#C62828] to-[#8E0000]' },
  { id: 'union', name: 'Union Bank of Nigeria', code: '032', category: 'Commercial Bank', popular: false, color: 'from-[#0288D1] to-[#01579B]' },
  { id: 'wema', name: 'Wema Bank (ALAT)', code: '035', category: 'Commercial Bank', popular: false, color: 'from-[#880E4F] to-[#4A148C]' },
  { id: 'polaris', name: 'Polaris Bank', code: '076', category: 'Commercial Bank', popular: false, color: 'from-[#388E3C] to-[#1B5E20]' },
  { id: 'keystone', name: 'Keystone Bank', code: '082', category: 'Commercial Bank', popular: false, color: 'from-[#00796B] to-[#004D40]' },
  { id: 'ecobank', name: 'Ecobank Nigeria', code: '050', category: 'Commercial Bank', popular: false, color: 'from-[#00838F] to-[#006064]' },
  { id: 'providus', name: 'Providus Bank', code: '101', category: 'Commercial Bank', popular: false, color: 'from-[#FF8F00] to-[#E65100]' },
  { id: 'unity', name: 'Unity Bank', code: '215', category: 'Commercial Bank', popular: false, color: 'from-[#FF6F00] to-[#E65100]' },
  { id: 'jaiz', name: 'Jaiz Bank', code: '301', category: 'Non-Interest Bank', popular: false, color: 'from-[#2E7D32] to-[#1B5E20]' },
  { id: 'taj', name: 'Taj Bank', code: '302', category: 'Non-Interest Bank', popular: false, color: 'from-[#C2185B] to-[#880E4F]' },
  { id: 'lotus', name: 'Lotus Bank', code: '303', category: 'Non-Interest Bank', popular: false, color: 'from-[#00695C] to-[#004D40]' },
  { id: 'premiumtrust', name: 'Premium Trust Bank', code: '105', category: 'Commercial Bank', popular: false, color: 'from-[#455A64] to-[#263238]' },
  { id: 'titantrust', name: 'Titan Trust Bank', code: '102', category: 'Commercial Bank', popular: false, color: 'from-[#37474F] to-[#212121]' },
];

export const DEFAULT_RESOLVED_NAME = 'UDUAK GABRIEL AKPAN';

export function resolveAccountName(accountNumber, bankName) {
  // Realistic account lookup simulator
  if (!accountNumber || accountNumber.length < 10) return '';
  return DEFAULT_RESOLVED_NAME;
}
