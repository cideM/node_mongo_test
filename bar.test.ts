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
  await collection.insertOne({ name: 'John', email: 'john@example.com' });

  const user = await collection.findOne({ name: 'John' });
  assert.strictEqual(user!.email, 'john@example.com');
})

test("bar 2", async () => {
  const db = await getTestDb();

  const collection = db.collection('users');
  await collection.insertOne({ name: 'Foo', email: 'Foo@example.com' });

  const user = await collection.findOne({ name: 'Foo' });
  assert.strictEqual(user!.email, 'Foo@example.com');
})
