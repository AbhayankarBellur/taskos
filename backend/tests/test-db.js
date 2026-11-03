import { MongoClient } from "mongodb";
import { createMemoryCollection } from "./memory-db.js";

let testClient;
let testDb;

export async function setupTestDB() {
  if (process.env.MONGODB_URI) {
    try {
      testClient = new MongoClient(process.env.MONGODB_URI);
      await testClient.connect();
      testDb = testClient.db("taskos_test");
      return testDb;
    } catch {
      testDb = null;
    }
  }

  const collections = {};
  testDb = {
    collection: (name) => {
      if (!collections[name]) collections[name] = createMemoryCollection();
      return collections[name];
    }
  };
  return testDb;
}

export function getTestDB() {
  return testDb;
}

export async function teardownTestDB() {
  if (testClient) {
    await testClient.close();
    testClient = null;
  }
}
