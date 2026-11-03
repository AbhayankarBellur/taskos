import { userRepository } from "./user.repository.js";
import { conflict, isDuplicateKey } from "../../utils/app-error.js";

export const toPublicUser = ({ _id, name, email, createdAt }) =>
  ({ id: _id.toString(), name, email, createdAt });

export const userService = {
  async create({ name, email, passwordHash }) {
    const now = new Date();
    const user = { name, email, passwordHash, createdAt: now, updatedAt: now };
    try {
      const { insertedId } = await userRepository.create({ ...user });
      return { _id: insertedId, ...user };
    } catch (error) {
      if (isDuplicateKey(error)) throw conflict("Email is already registered");
      throw error;
    }
  },

  findByEmail: (email) => userRepository.findByEmail(email),
  findById: (id) => userRepository.findById(id),
  findManyByIds: (ids) => userRepository.findManyByIds(ids),
  remove: (id) => userRepository.deleteById(id)
};
