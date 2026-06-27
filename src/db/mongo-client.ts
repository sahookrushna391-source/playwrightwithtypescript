import { MongoClient, Db } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * Manages an in-memory MongoDB instance for test isolation.
 * Uses mongodb-memory-server — no external cluster required.
 * Call start() in beforeAll, stop() in afterAll.
 */
export class MongoDBManager {
  private static mongod: MongoMemoryServer | null = null;
  private static client: MongoClient | null = null;
  private static db: Db | null = null;

  static async start(dbName = 'saucedemo_test'): Promise<Db> {
    this.mongod = await MongoMemoryServer.create();
    const uri = this.mongod.getUri();
    this.client = new MongoClient(uri);
    await this.client.connect();
    this.db = this.client.db(dbName);
    return this.db;
  }

  static getDb(): Db {
    if (!this.db) {
      throw new Error('MongoDB not started — call MongoDBManager.start() in beforeAll()');
    }
    return this.db;
  }

  static async stop(): Promise<void> {
    await this.client?.close();
    await this.mongod?.stop();
    this.client = null;
    this.db = null;
    this.mongod = null;
  }
}
