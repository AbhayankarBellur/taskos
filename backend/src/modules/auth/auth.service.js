import { registerSchema, loginSchema } from "./auth.validation.js";
import { passwordService } from "./password.service.js";
import { sessionService } from "./session.service.js";
import { userService, toPublicUser } from "../users/user.service.js";
import { workspaceService } from "../workspaces/workspace.service.js";
import { unauthorized } from "../../utils/app-error.js";

export const authService = {
  async register(input) {
    const data = registerSchema.parse(input);
    const passwordHash = await passwordService.hash(data.password);
    const user = await userService.create({ name: data.name, email: data.email, passwordHash });
    try {
      const name = data.workspaceName ?? `${data.name}'s Workspace`;
      const workspace = await workspaceService.createForOwner(user._id, name);
      const session = await sessionService.create(user._id);
      return { user: toPublicUser(user), workspace, ...session };
    } catch (error) {
      await userService.remove(user._id);
      throw error;
    }
  },

  async login(input) {
    const { email, password } = loginSchema.parse(input);
    const user = await userService.findByEmail(email);
    const valid = await passwordService.verify(password, user?.passwordHash);
    if (!user || !valid) throw unauthorized("Invalid email or password");
    const session = await sessionService.create(user._id);
    return { user: toPublicUser(user), ...session };
  },

  logout: (sessionId) => sessionService.revoke(sessionId),

  me: ({ user, csrfToken }) => ({ user: toPublicUser(user), csrfToken })
};
