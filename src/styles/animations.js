// Framer Motion animation variants & transitions matching the FluxPay animation spec

export const pageTransitionVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } },
};

export const modalVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.15, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.1, ease: 'easeIn' } },
};

export const buttonMotion = {
  whileHover: { scale: 1.02, transition: { duration: 0.15 } },
  whileTap: { scale: 0.98, transition: { duration: 0.1 } },
};

export const listItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.2,
      ease: 'easeOut',
    },
  }),
};

export const toastVariants = {
  initial: { opacity: 0, x: 50, scale: 0.95 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, x: 40, scale: 0.95, transition: { duration: 0.2, ease: 'easeIn' } },
};

export default {
  pageTransitionVariants,
  modalVariants,
  buttonMotion,
  listItemVariants,
  toastVariants,
};
