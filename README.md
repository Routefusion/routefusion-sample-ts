# Routefusion TS Sample Implementation

Please see the [documentation](https://routefusion.com/docs/#getting-started) for more detailed information about Routefusion's primary concepts.

This is a sample implementation that uses Typescript, NodeJS, and Apollo to manage entities, wallets and beneficiaries to create currency transfers for your organization.

Features include:

- Command line operations
- Importable functions and types
- Organization data reporting
- Beneficiary required fields reporting
- Wallet and Beneficiary validation
- Bulk creation of multi-currency, multi-beneficiary transfers

It should be noted that in all cases `personal` wallets and beneficiaries are used in the sample implementation rather than `business`.

## Requirements

This implementation requires `npm` and `node` to be installed on your environment.

Please see the [npm docs](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) for installation instructions.

## Get Started

For API access request a token from [engineering@routefusion.com](mailto:%20engineering@routefusion.com)

**Follow these steps to run the sample locally:**

1. Clone this repository.
2. Create a `.env` file in the root directory.
   You may use `.env.staging.sample` or `.env.prod.sample` as templates, where `RF_API_KEY` will be the API token provided to you by Routefusion.
3. Run `npm install` to install the required modules.
4. Modify `data/accounts.json` to suit your organization, or use the provided mock accounts
5. Modify `data/transfers.csv` to suit your actual transfers, or use the provided mock transfers
6. Ready to go!

## Usage

A simple command line interface is provided to perform various operations.

### Data Command

`npm run data`

`npm run data types=users,entities,wallets,beneficiaries,transfers`

Generates a json file in the `data` directory that contains all the data belonging to your organization.

The `types=` argument accepts a comma delimitated list of object types to include. Excluding this argument retrieves all object types.

### Requirements Command

`npm run requirements country=US currency=USD`

`npm run requirements country=US bank=US currency=USD`

Generates a json file in the `data` directory that contains the required fields to create a personal beneficiary for the provided country/currency tuple.

The `bank=` argument specifies the bank country, if different from the person country, otherwise they are assumed to be the same.

Countries must be provided in `ISO 3166` format (2 characters).
Currency must be provided in `ISO 4217` format (3 characters).

### Verify Command

`npm run verify`

Generates a json file in the `data` directory that indicates whether the beneficiary details contained in `data/accounts.json` are valid overall, and details on each field whether they are `valid`, `invalid`, `missing`, or `ignore`.

### Transfer Command

`npm run transfer`

Generates a json file in the `data` directory that contains the transfers that were created by the command.

This command iterates over the transfers defined in `data/transfers.csv` and confirms that the transfer does not already exist based on the `reference`.

This means for the purpose of this implementation the `reference` on each transfer must be unique to ensure it is created, while ensuring that no duplicate transfers are created by mistake.

The command uses from `fromCurrency` and `toCurrency` fields (in `ISO 4217`) to select a source wallet and destination beneficiary from those provided in `data/accounts.json`.

If an entity, wallet, or beneficiary do not yet exist within your organization they will be created automatically, and re-used for future transfers.

Due to the simplicity of this implementation, if multiple accounts are specified in `data/accounts.json` that utilize the same currency and country pair, only the first one will be used.
