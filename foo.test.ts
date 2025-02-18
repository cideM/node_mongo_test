import assert from "node:assert"
import test from "node:test"
import { getTestDb, MongoMemoryInstance } from "./lib.ts";

test.after(async () => {
  const instance = await MongoMemoryInstance.getInstance();
  await instance.cleanup();
});

test("foo", async () => {
  const db = await getTestDb();

  const collection = db.collection('users');
  await collection.insertOne({ name: 'John', email: 'john@example.com' });

  // Used in other test in this file
  await collection.deleteOne({ name: 'Foo', email: 'Foo@example.com' });

  // Used in other test in other file
  await collection.deleteOne({ name: 'Jane', email: 'Jane@example.com' });
  await collection.deleteOne({ name: 'Jona', email: 'Jona@example.com' });

  const user = await collection.findOne({ name: 'John' });
  assert.strictEqual(user!.email, 'john@example.com');

  const count = await collection.countDocuments()
  assert.strictEqual(count, 1)
})

test("bar", async () => {
  const db = await getTestDb();

  const collection = db.collection('users');
  await collection.insertOne({ name: 'Foo', email: 'Foo@example.com' });

  // Used in other test in this file
  await collection.deleteOne({ name: 'John', email: 'john@example.com' });

  // Used in other test in other file
  await collection.deleteOne({ name: 'Jane', email: 'Jane@example.com' });
  await collection.deleteOne({ name: 'Jona', email: 'Jona@example.com' });

  const user = await collection.findOne({ name: 'Foo' });

  const count = await collection.countDocuments()
  assert.strictEqual(count, 1)

  assert.strictEqual(user!.email, 'Foo@example.com');
})
