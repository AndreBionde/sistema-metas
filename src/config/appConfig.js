const nodeEnvironment = process.env.NODE_ENV || "development";

export const appConfig = {
  appName: process.env.REACT_APP_NAME || "PlanoMeta",
  // Mantemos apenas a chave funcional do PWA. A interface nao diferencia mais
  // ambientes ou branches no topo do produto.
  enablePwa: process.env.REACT_APP_ENABLE_PWA !== "false",
};

export const isProduction = nodeEnvironment === "production";
