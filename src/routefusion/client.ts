import axios from "axios";
import "dotenv/config";

const apiURL = process.env.RF_API_URL || "";
const apiKey = process.env.RF_API_KEY || "";

export function gql(literals: string | readonly string[], ...args: any[]) {
  return literals[0];
}

export default async function fusion(
  name: string,
  query: any,
  variables: any = {}
): Promise<any> {
  if (apiURL === "") {
    throw new Error("No RF_API_URL defined in .env or environment");
  }
  if (apiKey === "") {
    throw new Error(
      "No RF_API_KEY defined in .env or environment. Request a token from engineering@routefusion.com"
    );
  }
  const req = {
    data: JSON.stringify({ query, variables }),
    method: "POST",
    url: apiURL,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  };
  try {
    const { data } = (await axios(req)).data;
    return data[name];
  } catch (e: any) {
    console.log(JSON.stringify(e.response.data.errors, null, 2));
    throw new Error("Failed to perform query");
  }
}
