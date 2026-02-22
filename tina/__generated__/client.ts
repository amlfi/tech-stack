import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: '2bfa8a18cd256d770ea100c3f8cf19d92605fe9d', queries,  });
export default client;
  