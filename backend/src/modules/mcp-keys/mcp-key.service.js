import crypto from "node:crypto";
import { mcpKeyRepository } from "./mcp-key.repository.js";
import { validateCreateKey } from "./mcp-key.validation.js";
import { memberRepository } from "../workspaces/member.repository.js";
import { toObjectId, idString } from "../../utils/object-id.js";
import { forbidden, notFound } from "../../utils/app-error.js";

const toDTO = ({ _id, keyHash, ...k }) => ({
  ...k, id: idString(_id), workspaceId: idString(k.workspaceId), createdBy: idString(k.createdBy)
});

export const mcpKeyService = {
  async createKey(ctx, input) {
    const data = validateCreateKey(input);
    const wsId = toObjectId(data.workspaceId);
    const mem = await memberRepository.find(wsId, toObjectId(ctx.userId));
    if (!mem) throw forbidden("Not a member of this workspace");

    const raw = crypto.randomBytes(32).toString("hex");
    const secret = `taskos_live_${raw}`;
    const keyHash = crypto.createHash("sha256").update(secret).digest("hex");
    const doc = {
      name: data.name, keyPrefix: secret.slice(0, 16), keyHash,
      createdBy: toObjectId(ctx.userId), workspaceId: wsId,
      scopes: data.scopes, createdAt: new Date(),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      lastUsedAt: null, revokedAt: null
    };
    const { insertedId } = await mcpKeyRepository.create(doc);
    return { ...toDTO({ _id: insertedId, ...doc }), apiKey: secret };
  },

  async listKeys(ctx, workspaceId) {
    const wsId = toObjectId(workspaceId);
    const mem = await memberRepository.find(wsId, toObjectId(ctx.userId));
    if (!mem) throw forbidden("Not a member of this workspace");
    const keys = await mcpKeyRepository.listByUser(ctx.userId, wsId);
    return keys.map(toDTO);
  },

  async revokeKey(ctx, keyId) {
    const res = await mcpKeyRepository.revoke(keyId, ctx.userId);
    if (!res) throw notFound("API key");
    return { success: true };
  }
};
