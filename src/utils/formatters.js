const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

const decimalFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export const formatCurrency = (value) =>
  currencyFormatter.format(Number.isFinite(Number(value)) ? Number(value) : 0);

export const formatCurrencyCompact = (value) =>
  compactCurrencyFormatter.format(
    Number.isFinite(Number(value)) ? Number(value) : 0
  );

export const formatCurrencyAdaptive = (value, threshold = 1000000) => {
  const numericValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  return Math.abs(numericValue) >= threshold
    ? formatCurrencyCompact(numericValue)
    : formatCurrency(numericValue);
};

export const formatAmountShort = (value, { currency = true } = {}) => {
  const numericValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const absoluteValue = Math.abs(numericValue);
  const prefix = numericValue < 0 ? "-" : "";
  const currencyPrefix = currency ? "R$ " : "";

  if (absoluteValue >= 1_000_000_000_000) {
    return `${prefix}${currencyPrefix}${decimalFormatter.format(
      absoluteValue / 1_000_000_000_000
    )} tri`;
  }

  if (absoluteValue >= 1_000_000_000) {
    return `${prefix}${currencyPrefix}${decimalFormatter.format(
      absoluteValue / 1_000_000_000
    )} bi`;
  }

  if (absoluteValue >= 1_000_000) {
    return `${prefix}${currencyPrefix}${decimalFormatter.format(
      absoluteValue / 1_000_000
    )} mi`;
  }

  if (absoluteValue >= 1_000) {
    return `${prefix}${currencyPrefix}${decimalFormatter.format(
      absoluteValue / 1_000
    )} mil`;
  }

  return currency ? formatCurrency(numericValue) : decimalFormatter.format(numericValue);
};

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
