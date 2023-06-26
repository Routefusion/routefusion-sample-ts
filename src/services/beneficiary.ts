import { readFile } from "node:fs/promises";

import {
  Account,
  BeneficiaryRequiredFieldsItem,
  getBeneficiaryFields,
} from "@routefusion";

import {
  Route,
  RouteFieldReport,
  RouteReport,
  RouteRequirements,
} from "./types";

type AccountObject = {
  [key: string]: string;
};

export async function getRequirements(
  route: Route
): Promise<RouteRequirements> {
  //retrieve beneficiary field requirements for a specific route
  try {
    const fields = await getBeneficiaryFields(route);
    return { route, fields: fields.personal };
  } catch (e: any) {
    throw new Error(
      `Unable to find validation fields for:\n${JSON.stringify(route, null, 2)}`
    );
  }
}

export async function verifyAccount(account: Account): Promise<RouteReport> {
  //create a route for a given account
  const route: Route = {
    bankCountry: account.bank_country,
    beneficiaryCountry: account.country,
    currency: account.currency,
  };
  //ignore fields that are set during creation
  const ignored = ["entity_id", "type"];
  //track overall validity
  let valid = true;
  //retrieve beneficiary requirements for a specific route
  const routeRequirements = await getRequirements(route);
  //compare the beneficiary requirements with the account fields
  const fields: RouteFieldReport[] = routeRequirements.fields.map(
    (f: BeneficiaryRequiredFieldsItem) => {
      const value = (account as AccountObject)[f.variable];
      if (ignored.includes(f.variable)) {
        return { name: f.variable, condition: "ignore" };
      }
      if (value === undefined) {
        valid = false; //set overall invalid
        return { name: f.variable, condition: "missing" };
      }
      if (f.regex && !new RegExp(f.regex).test(value)) {
        valid = false; //set overall invalid
        return { name: f.variable, condition: "invalid" };
      }
      return { name: f.variable, condition: "valid" };
    }
  );

  return { route, valid, fields };
}

export async function verifyAccounts(): Promise<RouteReport[]> {
  //retrieve the possible beneficiary bank accounts
  //TODO:
  // sample implementation has accounts stored within a json file
  // production may use a database, secrets, or load this data from the application
  const accountsFile = await readFile("./data/accounts.json");
  const accounts: Account[] = JSON.parse(accountsFile.toString());
  return await Promise.all(
    accounts.map(async (a: Account) => await verifyAccount(a))
  );
}
