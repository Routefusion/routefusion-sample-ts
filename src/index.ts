import { dataCmd, requirementsCmd, transferCmd, verifyCmd } from "@services";

export * from "@routefusion";
export * from "@services";

const cmd = process.env.RF_CMD || "data";

async function run(): Promise<void> {
  if (cmd === "data") {
    await dataCmd();
  }
  if (cmd === "requirements") {
    await requirementsCmd();
  }
  if (cmd === "transfer") {
    await transferCmd();
  }
  if (cmd === "verify") {
    await verifyCmd();
  }
}

run();
