import fusion, { gql } from "./client";
import { TransferQuote } from "./types";

type CreateTransferParams = {
  userId: string;
  entityId: string;
  walletId: string;
  beneficiaryId: string;
  amount: string;
  purpose: string;
  reference: string;
};

type CreateWalletParams = {
  entityId: string;
  currency: string;
};

export async function createBeneficiary(params: any): Promise<string> {
  const query = gql`
    mutation createPersonalBeneficiary(
      $user_id: UUID!
      $entity_id: UUID!
      $email: Email!
      $phone: String
      $phone_country: String
      $first_name: String!
      $last_name: String!
      $address1: String
      $address2: String
      $city: String
      $state_province_region: String
      $postal_code: PostalCode
      $country: ISO3166_1!
      $tax_number: TaxNumber
      $name_on_bank_account: String
      $swift_bic: SwiftBic
      $account_number: BankAccountNumber
      $routing_code: BankRoutingCode
      $currency: ISO4217!
      $bank_name: String
      $branch_name: String
      $bank_address1: String
      $bank_address2: String
      $bank_city: String
      $bank_state_province_region: String
      $bank_postal_code: PostalCode
      $bank_country: ISO3166_1!
    ) {
      createPersonalBeneficiary(
        user_id: $user_id
        entity_id: $entity_id
        email: $email
        phone: $phone
        phone_country: $phone_country
        first_name: $first_name
        last_name: $last_name
        address1: $address1
        address2: $address2
        city: $city
        state_province_region: $state_province_region
        postal_code: $postal_code
        country: $country
        tax_number: $tax_number
        name_on_bank_account: $name_on_bank_account
        swift_bic: $swift_bic
        account_number: $account_number
        routing_code: $routing_code
        currency: $currency
        bank_name: $bank_name
        branch_name: $branch_name
        bank_address1: $bank_address1
        bank_address2: $bank_address2
        bank_city: $bank_city
        bank_state_province_region: $bank_state_province_region
        bank_postal_code: $bank_postal_code
        bank_country: $bank_country
      )
    }
  `;

  return await fusion("createPersonalBeneficiary", query, params);
}

export async function createEntity(params: any): Promise<string> {
  const query = gql`
    mutation createPersonalEntity(
      $user_id: UUID!
      $email: Email!
      $phone: String
      $phone_country: String
      $first_name: String!
      $last_name: String!
      $address1: String!
      $address2: String
      $city: String
      $state_province_region: String
      $postal_code: PostalCode
      $country: ISO3166_1!
      $tax_number: TaxNumber
      $birth_date: DateTime!
      $accept_terms_and_conditions: Boolean!
    ) {
      createPersonalEntity(
        user_id: $user_id
        email: $email
        phone: $phone
        phone_country: $phone_country
        first_name: $first_name
        last_name: $last_name
        address1: $address1
        address2: $address2
        city: $city
        state_province_region: $state_province_region
        postal_code: $postal_code
        country: $country
        tax_number: $tax_number
        birth_date: $birth_date
        accept_terms_and_conditions: $accept_terms_and_conditions
      )
    }
  `;

  return await fusion("createPersonalEntity", query, params);
}

export async function createTransfer(
  params: CreateTransferParams
): Promise<string> {
  const query = gql`
    mutation createTransfer(
      $user_id: UUID!
      $entity_id: UUID!
      $source_amount: String
      $wallet_id: UUID!
      $destination_amount: String
      $beneficiary_id: UUID!
      $purpose_of_payment: String!
      $reference: String
    ) {
      createTransfer(
        user_id: $user_id
        entity_id: $entity_id
        source_amount: $source_amount
        wallet_id: $wallet_id
        destination_amount: $destination_amount
        beneficiary_id: $beneficiary_id
        purpose_of_payment: $purpose_of_payment
        reference: $reference
      )
    }
  `;

  const variables = {
    user_id: params.userId,
    entity_id: params.entityId,
    source_amount: params.amount,
    wallet_id: params.walletId,
    beneficiary_id: params.beneficiaryId,
    purpose_of_payment: params.purpose,
    reference: params.reference,
  };

  return await fusion("createTransfer", query, variables);
}

export async function quoteTransfer(
  transferId: string
): Promise<TransferQuote> {
  const query = gql`
    mutation getTransferQuote($transfer_id: UUID!) {
      getTransferQuote(transfer_id: $transfer_id) {
        rate
        inverted_rate
        source_amount
        destination_amount
        source_currency
        destination_currency
        fee
        fee_usd
      }
    }
  `;

  const variables = { transfer_id: transferId };

  return await fusion("getTransferQuote", query, variables);
}

export async function finalizeTransfer(transferId: string): Promise<string> {
  const query = gql`
    mutation finalizeTransfer($transfer_id: UUID!) {
      finalizeTransfer(transfer_id: $transfer_id)
    }
  `;

  const variables = { transfer_id: transferId };

  return await fusion("finalizeTransfer", query, variables);
}

export async function createWallet(
  params: CreateWalletParams
): Promise<string> {
  const query = gql`
    mutation ($entity_id: UUID!, $currency: ISO4217!) {
      createWallet(entity_id: $entity_id, currency: $currency)
    }
  `;

  const variables = {
    entity_id: params.entityId,
    currency: params.currency,
  };

  return await fusion("createWallet", query, variables);
}
