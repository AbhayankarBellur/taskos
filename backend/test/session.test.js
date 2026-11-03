import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import { startServer, client, uniqueEmail, getDB } from "./helpers.js";

let ctx;
before(async () => { ctx = await startServer(); });
after(() => ctx.stop());

test("expired session is rejected and missing cookie is 401", async () => {
  const kim = client(ctx.base);
  const res = await kim.request("POST", "/auth/register", { name: "Kim", email: uniqueEmail("kim"), password: "password123" });
  await getDB().collection("sessions").updateMany(
    { userId: new ObjectId(res.body.data.user.id) }, { $set: { expiresAt: new Date(Date.now() - 1000) } });
  assert.equal((await kim.request("GET", "/auth/me")).status, 401);
  assert.equal((await client(ctx.base).request("GET", "/auth/me")).status, 401);
});
