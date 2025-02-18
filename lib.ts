import { MongoClient } from "mongodb"
import { MongoMemoryServer } from "mongodb-memory-server"

export class MongoMemoryInstance {
  private static instance: MongoMemoryInstance | null = null;
  private static initializationPromise: Promise<MongoMemoryInstance> | null = null;

  private mongoServer: MongoMemoryServer | null = null;
  private client: MongoClient | null = null;
  private uri: string = '';

  private constructor() { }

  public static async getInstance(): Promise<MongoMemoryInstance> {
    // If we already have an instance, return it
    if (MongoMemoryInstance.instance) {
      return MongoMemoryInstance.instance;
    }

    // If initialization is in progress, return the promise
    if (MongoMemoryInstance.initializationPromise) {
      return MongoMemoryInstance.initializationPromise;
    }

    // Start initialization and store the promise
    MongoMemoryInstance.initializationPromise = (async () => {
      // Create the instance
      const instance = new MongoMemoryInstance();

      try {
        // Start MongoDB Memory Server
        instance.mongoServer = await MongoMemoryServer.create();
        instance.uri = instance.mongoServer.getUri();

        // Create a shared client
        instance.client = new MongoClient(instance.uri);
        await instance.client.connect();

        // Store the fully initialized instance
        MongoMemoryInstance.instance = instance;
        return instance;
      } catch (error) {
        // Clear the initialization promise on error so future calls can retry
        MongoMemoryInstance.initializationPromise = null;
        throw error;
      }
    })();

    return MongoMemoryInstance.initializationPromise;
  }

  public getUri(): string {
    if (!this.mongoServer) {
      throw new Error('MongoMemoryInstance not initialized');
    }
    return this.uri;
  }

  public getClient(): MongoClient {
    if (!this.client) {
      throw new Error('MongoMemoryInstance client not initialized');
    }
    return this.client;
  }

  public async cleanup(): Promise<void> {
    if (!this.mongoServer) return;

    try {
      if (this.client) {
        await this.client.close();
        this.client = null;
      }

      await this.mongoServer.stop();
      this.mongoServer = null;

      // Reset the static instance and promise
      MongoMemoryInstance.instance = null;
      MongoMemoryInstance.initializationPromise = null;
    } catch (err) {
      console.error(`Error during cleanup: ${(err as Error).message}`);
    }
  }
}

// Function to get a dedicated test database
export async function getTestDb() {
  const instance = await MongoMemoryInstance.getInstance();

  // Create a unique database name
  const dbName = `test_db_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  // Get client from the singleton
  const client = instance.getClient();
  const db = client.db(dbName);

  return db;
}
