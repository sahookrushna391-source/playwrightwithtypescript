import { Collection, Db } from 'mongodb';
import { UserSessionRecord } from '../../types';

export class UserSessionRepository {
  private readonly collection: Collection<UserSessionRecord>;

  constructor(db: Db) {
    this.collection = db.collection<UserSessionRecord>('user_sessions');
  }

  async upsert(session: UserSessionRecord): Promise<void> {
    await this.collection.replaceOne(
      { username: session.username },
      { ...session },
      { upsert: true }
    );
  }

  async findByUsername(username: string): Promise<UserSessionRecord | null> {
    return this.collection.findOne({ username });
  }

  async updateLastLogin(username: string, lastLogin: Date): Promise<void> {
    await this.collection.updateOne(
      { username },
      { $set: { lastLogin } }
    );
  }

  async deleteByUsername(username: string): Promise<void> {
    await this.collection.deleteOne({ username });
  }

  async count(): Promise<number> {
    return this.collection.countDocuments();
  }
}
