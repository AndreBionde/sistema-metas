const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

export const formatCurrency = (value) =>
  currencyFormatter.format(Number.isFinite(Number(value)) ? Number(value) : 0);

export const formatPercent = (value) =>
  `${(Number.isFinite(Number(value)) ? Number(value) : 0).toFixed(1)}%`;

export const formatDateTime = (value) => {
  if (!value) {
    return "Aguardando salvamento";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

export const formatMonthProjection = (value) => {
  if (value === null) {
    return "Sem ritmo suficiente";
  }

  if (value === 0) {
    return "Meta conclu\u00EDda";
  }

  return `${value} ${value === 1 ? "m\u00EAs" : "meses"}`;
};
