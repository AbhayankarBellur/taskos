export interface McpKey {
  id: string;
  name: string;
  keyPrefix: string;
  workspaceId: string;
  scopes: string[];
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export interface CreatedMcpKey extends McpKey {
  apiKey: string;
}
