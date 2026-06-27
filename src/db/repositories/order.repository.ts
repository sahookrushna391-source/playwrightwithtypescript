import { Collection, Db } from 'mongodb';
import { OrderRecord } from '../../types';

export class OrderRepository {
  private readonly collection: Collection<OrderRecord>;

  constructor(db: Db) {
    this.collection = db.collection<OrderRecord>('orders');
  }

  async insert(order: OrderRecord): Promise<void> {
    await this.collection.insertOne({ ...order });
  }

  async findByOrderId(orderId: string): Promise<OrderRecord | null> {
    return this.collection.findOne({ orderId });
  }

  async findByUsername(username: string): Promise<OrderRecord[]> {
    return this.collection.find({ username }).toArray();
  }

  async count(): Promise<number> {
    return this.collection.countDocuments();
  }

  async deleteAll(): Promise<void> {
    await this.collection.deleteMany({});
  }
}
