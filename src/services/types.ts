import { BeneficiaryRequiredFieldsItem } from "@routefusion";

export type Route = {
  bankCountry: string;
  beneficiaryCountry: string;
  currency: string;
};

export type RouteRequirements = {
  route: Route;
  fields: BeneficiaryRequiredFieldsItem[];
};

export type RouteFieldReport = {
  name: string;
  condition: string;
};

export type RouteReport = {
  route: Route;
  valid: boolean;
  fields: RouteFieldReport[];
};

export type PendingTransfer = {
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  purpose: string;
  reference: string;
};

export type Corridor = {
  userId: string;
  entityId: string;
  walletId: string;
  beneficiaryId: string;
};
