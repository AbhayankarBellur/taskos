import bcrypt from "bcryptjs";

const ROUNDS = 12;
let dummyHash;

export const passwordService = {
  hash: (password) => bcrypt.hash(password, ROUNDS),

  async verify(password, hash) {
    dummyHash ??= await bcrypt.hash("taskos-timing-guard", ROUNDS);
    const matches = await bcrypt.compare(password, hash ?? dummyHash);
    return Boolean(hash) && matches;
  }
};
