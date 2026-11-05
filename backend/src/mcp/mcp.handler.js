import { createMcpHandler } from "@modelcontextprotocol/server";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { createServerInstance } from "./mcp.server.js";

const handler = createMcpHandler(() => createServerInstance());
const nodeHandler = toNodeHandler(handler);

export function handleMcpRequest(req, res) {
  return nodeHandler(req, res, req.body);
}

export function closeMcpHandler() {
  return handler.close();
}
