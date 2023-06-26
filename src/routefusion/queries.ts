import { Route } from "@services";

import fusion, { gql } from "./client";
import {
  Beneficiary,
  BeneficiaryRequiredFields,
  Entity,
  EntityWallets,
  Transfer,
  UserAccount,
  Wallet,
} from "./types";

export async function getUsers(
  limit: number = 0,
  offset: number = 0
): Promise<UserAccount[]> {
  const query = gql`
    query organizationUsers($listFilter: ListFilter) {
      organizationUsers(listFilter: $listFilter) {
        id
        identifier
        email
        first_name
        last_name
        admin
        organization {
          id
          identifier
          admin
          restricted
          enabled
        }
      }
    }
  `;

  const variables = { listFilter: { limit, offset } };

  return await fusion("organizationUsers", query, variables);
}

export async function getOrganizationEntities(
  limit: number = 0,
  offset: number = 0
): Promise<Entity[]> {
  const query = gql`
    query organizationEntities($search_terms: String, $listFilter: ListFilter) {
      organizationEntities(
        search_terms: $search_terms
        listFilter: $listFilter
      ) {
        id
        type
        business_name
        first_name
        last_name
        state
        email
        phone
        phone_country
        address1
        address2
        city
        state_province_region
        postal_code
        country
        creator {
          id
          identifier
          email
          first_name
          last_name
          admin
        }
        users {
          id
          identifier
          email
          first_name
          last_name
          admin
        }
      }
    }
  `;

  const variables = {
    search_terms: null,
    listFilter: { limit, offset },
  };

  return await fusion("organizationEntities", query, variables);
}

export async function getUserEntities(
  userId: string,
  limit: number = 0,
  offset: number = 0
): Promise<Entity[]> {
  const query = gql`
    query userEntities(
      $user_id: UUID!
      $search_terms: String
      $listFilter: ListFilter
    ) {
      userEntities(
        user_id: $user_id
        search_terms: $search_terms
        listFilter: $listFilter
      ) {
        id
        type
        business_name
        first_name
        last_name
        state
        email
        phone
        phone_country
        address1
        address2
        city
        state_province_region
        postal_code
        country
        creator {
          id
          identifier
          email
          first_name
          last_name
        }
        users {
          id
          identifier
          email
          first_name
          last_name
        }
      }
    }
  `;

  const variables = {
    user_id: userId,
    search_terms: null,
    listFilter: { limit, offset },
  };

  return await fusion("userEntities", query, variables);
}

export async function getEntityWallets(entityId: string): Promise<Wallet[]> {
  const query = gql`
    query ($entity_id: UUID!) {
      entityWallets(entity_id: $entity_id) {
        id
        created_date
        organization {
          id
        }
        entity {
          id
        }
        currency
        balance
        available_balance
      }
    }
  `;

  const variables = { entity_id: entityId };

  return await fusion("entityWallets", query, variables);
}

export async function getOrganizationWallets(
  limit: number = 0,
  offset: number = 0
): Promise<EntityWallets[]> {
  const query = gql`
    query ($listFilter: ListFilter) {
      organizationEntityWallets(listFilter: $listFilter) {
        entity_id
        entity_name
        wallets {
          id
          created_date
          organization {
            id
          }
          entity {
            id
          }
          currency
          balance
          available_balance
        }
      }
    }
  `;

  const variables = { listFilter: { limit, offset } };

  return await fusion("organizationEntityWallets", query, variables);
}

export async function getEntityBeneficiaries(
  entityId: string,
  limit: number = 0,
  offset: number = 0
): Promise<Beneficiary[]> {
  const query = gql`
    query entityBeneficiaries($entity_id: UUID!, $listFilter: ListFilter) {
      entityBeneficiaries(entity_id: $entity_id, listFilter: $listFilter) {
        id
        type
        email
        phone
        phone_country
        tax_number
        first_name
        last_name
        address1
        address2
        city
        state_province_region
        postal_code
        country
        contact_first_name
        contact_last_name
        business_name
        name_on_bank_account
        swift_bic
        account_number
        routing_code
        currency
        bank_name
        branch_name
        bank_address1
        bank_address2
        bank_city
        bank_state_province_region
        bank_postal_code
        bank_country
      }
    }
  `;

  const variables = {
    entity_id: entityId,
    listFilter: { limit, offset },
  };

  return await fusion("entityBeneficiaries", query, variables);
}

export async function getOrganizationBeneficiaries(
  limit: number = 0,
  offset: number = 0
): Promise<Beneficiary[]> {
  const query = gql`
    query organizationBeneficiaries($listFilter: ListFilter) {
      organizationBeneficiaries(listFilter: $listFilter) {
        id
        entity {
          id
        }
        creator {
          id
        }
        type
        email
        phone
        phone_country
        tax_number
        first_name
        last_name
        address1
        address2
        city
        state_province_region
        postal_code
        country
        contact_first_name
        contact_last_name
        business_name
        name_on_bank_account
        swift_bic
        account_number
        routing_code
        currency
        bank_name
        branch_name
        bank_address1
        bank_address2
        bank_city
        bank_state_province_region
        bank_postal_code
        bank_country
      }
    }
  `;

  const variables = { listFilter: { limit, offset } };

  return await fusion("organizationBeneficiaries", query, variables);
}

export async function getTransfers(
  limit: number = 0,
  offset: number = 0
): Promise<Transfer[]> {
  const query = gql`
    query transfers($search_terms: String, $listFilter: ListFilter) {
      transfers(search_terms: $search_terms, listFilter: $listFilter) {
        id
        state
        user {
          id
        }
        beneficiary {
          id
        }
        entity {
          id
        }
        fee
        source_amount
        source_currency
        destination_amount
        destination_currency
        purpose_of_payment
        rate
        reference
        created_date
      }
    }
  `;

  const variables = {
    search_terms: null,
    listFilter: { limit, offset },
  };

  return await fusion("transfers", query, variables);
}

export async function getBeneficiaryFields(
  route: Route
): Promise<BeneficiaryRequiredFields> {
  const query = gql`
    query beneficiaryRequiredFields(
      $bank_country: ISO3166_1!
      $currency: ISO4217!
      $beneficiary_country: ISO3166_1
    ) {
      beneficiaryRequiredFields(
        bank_country: $bank_country
        currency: $currency
        beneficiary_country: $beneficiary_country
      ) {
        personal {
          variable
          regex
          variable_sub_type
          example
        }
        business {
          variable
          regex
          variable_sub_type
          example
        }
      }
    }
  `;

  const variables = {
    bank_country: route.bankCountry,
    currency: route.currency,
    beneficiary_country: route.beneficiaryCountry,
  };

  return await fusion("beneficiaryRequiredFields", query, variables);
}
