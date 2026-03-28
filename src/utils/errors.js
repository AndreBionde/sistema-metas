export const reportRuntimeError = (label, error, context = {}) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[runtime] ${label}`, error, context);
  }
};
