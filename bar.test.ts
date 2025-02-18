import assert from "node:assert"
import test from "node:test"
import { getTestDb, MongoMemoryInstance } from "./lib.ts";

test.after(async () => {
  const instance = await MongoMemoryInstance.getInstance();
  await instance.cleanup();
});

test("foo 2", async () => {
  const db = await getTestDb();

  const collection = db.collection('users');
  await collection.insertOne({ name: 'Jane', email: 'Jane@example.com' });

  const user = await collection.findOne({ name: 'Jane' });
  assert.strictEqual(user!.email, 'Jane@example.com');

  const count = await collection.countDocuments()
  assert.strictEqual(count, 1)
})

test("bar 2", async () => {
  const db = await getTestDb();

  const collection = db.collection('users');
  await collection.insertOne({ name: 'Jona', email: 'Jona@example.com' });

  const user = await collection.findOne({ name: 'Jona' });
  assert.strictEqual(user!.email, 'Jona@example.com');

  const count = await collection.countDocuments()
  assert.strictEqual(count, 1)
})
