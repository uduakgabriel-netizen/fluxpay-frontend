// FluxPay Theme Tokens & Constants
export const colors = {
  primary: '#8b5cf6',
  primaryHover: '#7c3aed',
  accent: '#c084fc',
  gradientBg: {
    from: '#0f172a',
    to: '#1e1b4b',
  },
  cardBg: 'rgba(30, 31, 38, 0.6)',
  border: 'rgba(139, 92, 246, 0.2)',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  textPrimary: '#f3f4f6',
  textMuted: '#9ca3af',
};

export const typography = {
  h1: 'text-[32px] font-bold tracking-tight font-sans',
  h2: 'text-[24px] font-semibold font-sans',
  h3: 'text-[18px] font-semibold font-sans',
  body: 'text-[16px] font-normal leading-relaxed font-sans',
  small: 'text-[14px] font-normal font-sans',
  label: 'text-[12px] font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-400 font-sans',
  number: 'font-mono tabular-nums',
};

export const spacing = {
  cardPadding: 'p-6', // 24px
  sectionSpacing: 'space-y-8', // 32px
  buttonPadding: 'px-6 py-3', // 12px 24px
};

export const radius = {
  card: 'rounded-2xl', // 16px
  pill: 'rounded-full', // 40px
  button: 'rounded-xl', // 12px
  input: 'rounded-xl', // 12px
};

export default {
  colors,
  typography,
  spacing,
  radius,
};
