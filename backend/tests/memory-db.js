import { ObjectId } from "mongodb";

function matchDoc(doc, query = {}) {
  for (const [k, v] of Object.entries(query)) {
    if (k === "$or") return v.some((q) => matchDoc(doc, q));
    if (v?.$in) return v.$in.some((item) => (doc[k] || []).includes(item));
    const val = doc[k] instanceof ObjectId ? doc[k].toString() : doc[k];
    const target = v instanceof ObjectId ? v.toString() : v;
    if (val !== target) return false;
  }
  return true;
}

export function createMemoryCollection() {
  const docs = [];
  return {
    async insertOne(d) {
      const _id = d._id || new ObjectId();
      docs.push({ ...d, _id });
      return { insertedId: _id };
    },
    find(q = {}) {
      const res = docs.filter((d) => matchDoc(d, q));
      const cursor = { sort: () => cursor, skip: () => cursor, limit: () => cursor, toArray: async () => [...res].reverse() };
      return cursor;
    },
    async findOne(q = {}, opts = {}) {
      const res = docs.filter((d) => matchDoc(d, q));
      if (opts?.sort?.createdAt === -1) res.reverse();
      return res[0] || null;
    },
    async findOneAndUpdate(q, u) {
      const doc = docs.find((d) => matchDoc(d, q));
      if (!doc) return null;
      if (u.$inc) for (const [k, v] of Object.entries(u.$inc)) doc[k] = (doc[k] || 0) + v;
      if (u.$set) Object.assign(doc, u.$set);
      return { ...doc };
    },
    async updateOne(q, u) { return this.findOneAndUpdate(q, u); },
    async deleteOne(q) {
      const idx = docs.findIndex((d) => matchDoc(d, q));
      if (idx !== -1) docs.splice(idx, 1);
      return { deletedCount: idx !== -1 ? 1 : 0 };
    },
    async countDocuments(q = {}) { return docs.filter((d) => matchDoc(d, q)).length; }
  };
}
