import {
  BriefcaseBusiness,
  Dumbbell,
  GraduationCap,
  HandCoins,
  HeartHandshake,
  Home,
  Landmark,
  PiggyBank,
  Plane,
  ReceiptText,
  Sparkles,
  TrendingUp,
  WalletCards,
} from "lucide-react";

export const CATEGORY_META = {
  Essenciais: {
    label: "Essenciais",
    className: "essential",
    icon: ReceiptText,
  },
  Moradia: {
    label: "Moradia",
    className: "housing",
    icon: Home,
  },
  Saude: {
    label: "Saude",
    className: "health",
    icon: Dumbbell,
  },
  Educacao: {
    label: "Educacao",
    className: "education",
    icon: GraduationCap,
  },
  Viagem: {
    label: "Viagem",
    className: "travel",
    icon: Plane,
  },
  Familia: {
    label: "Familia",
    className: "family",
    icon: HeartHandshake,
  },
  Reserva: {
    label: "Reserva",
    className: "reserve",
    icon: PiggyBank,
  },
  Investimentos: {
    label: "Investimentos",
    className: "investments",
    icon: TrendingUp,
  },
  Carreira: {
    label: "Carreira",
    className: "career",
    icon: BriefcaseBusiness,
  },
  Negocio: {
    label: "Negocio",
    className: "business",
    icon: HandCoins,
  },
  Lazer: {
    label: "Lazer",
    className: "leisure",
    icon: Sparkles,
  },
  Patrimonio: {
    label: "Patrimonio",
    className: "assets",
    icon: Landmark,
  },
  Outros: {
    label: "Outros",
    className: "other",
    icon: WalletCards,
  },
};

export const getCategoryMeta = (category) =>
  CATEGORY_META[category] || CATEGORY_META.Outros;

