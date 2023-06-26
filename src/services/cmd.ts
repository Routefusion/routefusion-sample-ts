import { writeFile } from "node:fs/promises";

import {
  getOrganizationBeneficiaries,
  getOrganizationEntities,
  getOrganizationWallets,
  getTransfers,
  getUsers,
} from "@routefusion";

import { getRequirements, transfer, verifyAccounts } from "@services";

type DataMethod = (limit?: number, offset?: number) => Promise<any>;
type DataMethodList = {
  [type: string]: DataMethod;
};
type DataMethodResult = {
  type: string;
  data: any;
};
type DataResult = {
  [type: string]: any;
};

const dataFunctions: DataMethodList = {
  users: getUsers,
  entities: getOrganizationEntities,
  wallets: getOrganizationWallets,
  beneficiaries: getOrganizationBeneficiaries,
  transfers: getTransfers,
};

//TODO:
// sample implementation retrieves 100 records
// production may use pagination and limits for more data
async function getData(
  type: string,
  method: DataMethod
): Promise<DataMethodResult> {
  return { type, data: await method(100) };
}

export async function dataCmd(): Promise<void> {
  const types = Object.keys(dataFunctions);

  const argIndex: number = process.argv.indexOf(
    process.argv.filter((a) => a.includes("types=")).shift()!
  );

  const allTypes = argIndex === -1;

  const args: string[] = !allTypes
    ? process.argv
        .slice(argIndex)
        .join("")
        .toLocaleLowerCase()
        .replace("types=", "")
        .replace("s+", "")
        .split(",")
    : [];

  args.forEach((arg: string) => {
    if (!types.includes(arg)) {
      throw new Error(
        `Invalid types argument provided: ${arg}. You may exclude the types argument, or acceptable types are: ${types.join()}`
      );
    }
  });

  const tasks: Promise<DataMethodResult>[] = [];
  types.forEach((type: string) => {
    if (allTypes || args.includes(type)) {
      tasks.push(getData(type, dataFunctions[type]));
    }
  });

  const taskResults = await Promise.all(tasks);
  const results: DataResult = {};
  taskResults.forEach((result: DataMethodResult) => {
    results[result.type] = result.data;
  });

  const filename = `orgdata-${Date.now()}.json`;
  await writeFile(`./data/${filename}`, JSON.stringify(results, null, 2));

  console.log(`Organizational data written to: data/${filename}`);
}

export async function requirementsCmd(): Promise<void> {
  const country = process.argv
    .filter((a) => a.includes("country="))
    .shift()
    ?.replace("country=", "");
  const bankCountry = process.argv
    .filter((a) => a.includes("bank="))
    .shift()
    ?.replace("bank=", "");
  const currency = process.argv
    .filter((a) => a.includes("currency="))
    .shift()
    ?.replace("currency=", "");

  if (!country || !currency) {
    throw new Error(
      `Require country and currency to be set, e.g. 'currency=USD country=US bank=US`
    );
  }

  const route = {
    currency: currency || "",
    bankCountry: bankCountry || country || "",
    beneficiaryCountry: country || "",
  };

  const fields = await getRequirements(route);

  const filename = `fields-${Date.now()}.json`;
  await writeFile(`./data/${filename}`, JSON.stringify(fields, null, 2));

  console.log(`Benefificiary requirement data written to: data/${filename}`);
}

export async function transferCmd(): Promise<void> {
  const results = await transfer();

  if (results && results.length > 0) {
    const filename = `transfers-${Date.now()}.json`;
    await writeFile(`./data/${filename}`, JSON.stringify(results, null, 2));

    console.log(`Transfers data written to: data/${filename}`);
  }
}

export async function verifyCmd(): Promise<void> {
  const results = await verifyAccounts();

  const filename = `verification-${Date.now()}.json`;
  await writeFile(`./data/${filename}`, JSON.stringify(results, null, 2));

  console.log(`Verification data written to: data/${filename}`);
}
