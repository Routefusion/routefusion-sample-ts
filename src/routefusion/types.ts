//TODO: move this to internal? use beneficiary instead?
export type Account = {
  account_number: string;
  address1: string;
  bank_address1: string;
  bank_city: string;
  bank_country: string;
  bank_name: string;
  bank_postal_code: string;
  bank_state_province_region: string;
  city: string;
  country: string;
  currency: string;
  email: string;
  first_name: string;
  last_name: string;
  postal_code: string;
  routing_code: string;
  state_province_region: string;
  swift_bic: string;
};

export type Entity = {
  id: string;
  type: string;
  business_name: string;
  first_name: string;
  last_name: string;
  state: string;
  email: string;
  phone: string;
  phone_country: string;
  address1: string;
  address2: string;
  city: string;
  state_province_region: string;
  postal_code: string;
  country: string;
  creator: UserAccount;
  users: UserAccount[];
};

export type Beneficiary = {
  id: string;
  entity: Entity;
  organization: Organization;
  type: string;
  email: string;
  phone: string;
  phone_country: string;
  tax_number: string;

  first_name: string;
  last_name: string;
  address1: string;
  address2: string;
  city: string;
  state_province_region: string;
  postal_code: string;
  country: string;

  contact_first_name: string;
  contact_last_name: string;
  business_name: string;

  name_on_bank_account: string;
  swift_bic: string;
  account_number: string;
  routing_code: string;
  currency: string;
  bank_name: string;
  branch_name: string;
  bank_address1: string;
  bank_address2: string;
  bank_city: string;
  bank_state_province_region: string;
  bank_postal_code: string;
  bank_country: string;
};

export type Wallet = {
  id: string;
  created_date: string;
  organization: Organization;
  entity: Entity;
  currency: string;
  balance: string;
  available_balance: string;
};

export type EntityWallets = {
  entity_id: string;
  entity_name: string;
  wallets: Wallet[];
};

export type Organization = {
  id: string;
  identifier: string;
  admin: boolean;
  restricted: boolean;
  enabled: boolean;
};

export type UserAccount = {
  id: string;
  identifier: string;
  email: string;
  first_name: string;
  last_name: string;
  admin: boolean;
  organization: Organization;
};

export type Transfer = {
  id: string;
  state: string;
  user: UserAccount;
  creator: UserAccount;
  beneficiary: Beneficiary;
  entity: Entity;
  fee: string;
  source_amount: string;
  source_currency: string;
  destination_amount: string;
  destination_currency: string;
  purpose_of_payment: string;
  rate: string;
  reference: string;
  created_date: string;
};

export type TransferQuote = {
  rate: string;
  inverted_rate: string;
  source_amount: string;
  destination_amount: string;
  source_currency: string;
  destination_currency: string;
  fee: string;
  fee_usd: string;
};

export type FieldRequirement = {
  variable: string;
  regex: string | null;
  variable_sub_type: string | null;
  example: string | null;
};

export type BeneficiaryRequiredFieldsItem = {
  variable: string;
  regex: string;
  variable_sub_type: string;
  example: string;
};
export type BeneficiaryRequiredFields = {
  personal: BeneficiaryRequiredFieldsItem[];
  business: BeneficiaryRequiredFieldsItem[];
};
