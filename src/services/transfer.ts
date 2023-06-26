import { parse } from "csv-parse/sync";
import { readFile } from "node:fs/promises";
import { setTimeout } from "node:timers/promises";

import {
  Account,
  Beneficiary,
  Transfer,
  Wallet,
  createBeneficiary,
  createEntity,
  createTransfer,
  createWallet,
  finalizeTransfer,
  getEntityBeneficiaries,
  getEntityWallets,
  getTransfers,
  getUserEntities,
  getUsers,
  quoteTransfer,
} from "@routefusion";

import { verifyAccount } from "./beneficiary";
import { Corridor, PendingTransfer } from "./types";

export async function upsertEntity(
  userId: string,
  account: Account
): Promise<string> {
  //retrieve the entities for this user from RouteFusion
  //TODO:
  // sample implementation uses first account and fake birthday
  // production may create entities with a different method
  const entities = await getUserEntities(userId);
  if (entities.length === 0) {
    const entityId = await createEntity({
      ...account,
      user_id: userId,
      birth_date: new Date("1980-01-01").toISOString(),
      accept_terms_and_conditions: true,
    });
    if (!entityId) {
      throw new Error("Unable to create entity");
    }
    console.log(
      `Created new entity: ${entityId}\nWaiting 2 seconds for background tasks...\n`
    );
    await setTimeout(2000);
    return entityId;
  } else {
    const { id } = entities[0];
    return id;
  }
}

export async function upsertCorridor(
  userId: string,
  entityId: string,
  accounts: Account[],
  transfer: PendingTransfer
): Promise<Corridor> {
  //retrieve the existing wallets
  //TODO:
  // sample implementation retrieves wallets each iteration to ensure no duplicate wallets are created
  // production may create a network optimized implementation
  const wallets = await getEntityWallets(entityId);
  const wallet = wallets.find(
    (w: Wallet) => w.currency === transfer.fromCurrency
  );
  //assign existing wallet or create a new one
  const walletId = wallet
    ? wallet.id
    : await createWallet({
        entityId: entityId,
        currency: transfer.fromCurrency,
      });

  if (!walletId) {
    throw new Error(
      `Unable to create wallet for source currency: ${transfer.fromCurrency}`
    );
  }

  //retrieve the existing beneficiaries
  //TODO:
  // sample implementation retrieves beneficiaries each iteration to ensure no duplicate beneficiaries are created
  // production may create a network optimized implementation
  const account = accounts.find(
    (a: Account) => a.currency === transfer.toCurrency
  );

  const beneficiaries = await getEntityBeneficiaries(entityId);
  const beneficiary = beneficiaries.find(
    (b: Beneficiary) => b.currency === transfer.toCurrency
  );

  //validate the account if a beneficiary does not already exist
  //TODO:
  // sample implementation validates accounts when required
  // production may use pre-validated accounts
  if (!beneficiary) {
    const verification = await verifyAccount(account!);
    if (!verification.valid) {
      throw new Error(
        `Invalid account details for destination currency: ${transfer.toCurrency}`
      );
    }
  }

  //assign existing beneficiary or create a new one
  const beneficiaryId = beneficiary
    ? beneficiary.id
    : await createBeneficiary({
        ...account,
        user_id: userId,
        entity_id: entityId,
      });

  if (!beneficiaryId) {
    throw new Error(
      `Unable to create beneficiary for destination currency: ${transfer.toCurrency}`
    );
  }

  return { userId, entityId, walletId, beneficiaryId };
}

export async function transferCorridor(
  corridor: Corridor,
  transfer: PendingTransfer
): Promise<string> {
  //create the transfer
  const { amount, purpose, reference } = transfer;
  const transferId = await createTransfer({
    ...corridor,
    amount,
    purpose,
    reference,
  });
  if (!transferId) {
    throw new Error("Unable to create transfer, please try again");
  }
  console.log(
    `\nCreating transfer: ${transferId} for:\n${JSON.stringify(
      transfer,
      null,
      2
    )}`
  );

  //lock in a quote for the transfer
  const quote = await quoteTransfer(transferId);
  console.log(`\nQuote provided:\n${JSON.stringify(quote, null, 2)}`);

  //finalize the transfer for processing
  await finalizeTransfer(transferId);
  console.log(`\nTransfer finalized`);

  return transferId;
}

export async function processTransfer(
  userId: string,
  entityId: string,
  accounts: Account[],
  transfer: PendingTransfer
): Promise<string> {
  //because there are additional checks in the transfer process
  //but some transfers may complete successfully
  //we detect any failures and report them in the transferIds
  //to be examined after the successful transfers
  try {
    //retrieve a corridor via upsert
    const corridor = await upsertCorridor(userId, entityId, accounts, transfer);
    //create the transfer
    return await transferCorridor(corridor, transfer);
  } catch (e: any) {
    console.error(e);
    return `Not processed: ${transfer.reference}`;
  }
}

export async function transfer(): Promise<Transfer[]> {
  //transfer is safe to run repeatedly because we check reference numbers to ensure idempotency
  //for this reason all references must be unique to ensure they get processed
  console.log("\nRunning Transfers\n");
  try {
    //retrieve the users from RouteFusion
    const users = await getUsers();
    if (users.length === 0) {
      throw new Error(
        "No users exist, please create or request one from engineering@routefusion.com"
      );
    }
    //TODO:
    // sample implementation assumes single user
    // production may add user selection
    const { id: userId } = users[0];

    //retrieve the possible beneficiary bank accounts
    //TODO:
    // sample implementation has accounts stored within a json file
    // production may use a database, secrets, or load this data from the application
    const accountsFile = await readFile("./data/accounts.json");
    const accounts: Account[] = JSON.parse(accountsFile.toString());

    //TODO:
    // sample implementation assumes single entity for user,
    // creating it from first definition in accounts.json if neccessary
    // production may add entity selection
    const entityId = await upsertEntity(userId, accounts[0]);

    //retrieve the transfers to execute
    //TODO:
    // sample implementation uses a csv file with a list of transfers
    // production may have a database, CLI argument, or other mechanism
    const transfersFile = await readFile("./data/transfers.csv");
    const pendingTransfers = parse(transfersFile, { columns: true });

    //retrieve the existing transfers
    //TODO:
    // sample implementation retrieves 100 transfers
    // production may add search and other criteria
    const existingTransfers = await getTransfers(100);

    //filter pending transfers against existing transfers
    //TODO:
    // sample implementation assumes references are unique
    // production may utilize some other criteria
    const remainingTransfers = pendingTransfers.filter(
      (transfer: PendingTransfer) =>
        existingTransfers.find(
          (t: Transfer) => t.reference === transfer.reference
        ) === undefined
    );

    //check if there are any transfers to process
    if (remainingTransfers.length === 0) {
      console.log("No transfers to process\n\n");
      return [];
    }

    //check for invalid currency pairs
    //TODO:
    // sample implementation only validates currency
    // production may utilize additional validations
    for (const transfer of remainingTransfers) {
      const fromFound =
        accounts.find((a: Account) => a.currency === transfer.fromCurrency) !==
        undefined;
      const toFound =
        accounts.find((a: Account) => a.currency === transfer.toCurrency) !==
        undefined;

      if (!fromFound || !toFound) {
        throw new Error(
          `Invalid currency found in transfers.csv:\n${JSON.stringify(
            transfer,
            null,
            2
          )}`
        );
      }
    }

    //execute the transfers
    //TODO:
    // sample implementation performs transfers in order to ensure upsert
    // production may perform this in parallel in other conditions
    const transferIds: string[] = [];
    for (const transfer of remainingTransfers) {
      const transferId = await processTransfer(
        userId,
        entityId,
        accounts,
        transfer
      );
      transferIds.push(transferId);
    }

    //retrieve transfer information
    const currentTransfers = await getTransfers();
    const finalizedTransfers = currentTransfers.filter((t: Transfer) =>
      transferIds.includes(t.id)
    );

    //display transfer information
    console.log(`\nTransfer ids:\n${JSON.stringify(transferIds, null, 2)}`);
    console.log(
      `\nTransfer details:\n${JSON.stringify(finalizedTransfers, null, 2)}`
    );
    console.log("\nTransfers complete\n\n");

    return finalizedTransfers;
  } catch (e: any) {
    console.error("Unable to process transfers");
    console.error(e);
    return [];
  }
}
