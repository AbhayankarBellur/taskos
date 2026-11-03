export function formatMcpError(err) {
  const is404 = err?.statusCode === 404;
  const is403 = err?.statusCode === 403 || err?.code === "FORBIDDEN";
  const isBson = err?.name === "BSONError" || err?.message?.includes("Invalid ObjectId");
  const msg = is404 ? (err.message || "Resource not found")
    : is403 ? "Access denied: insufficient permissions"
    : isBson ? `Invalid ID format: ${err.message}`
    : (err?.message || "Internal server error");

  return {
    isError: true,
    content: [{ type: "text", text: `Error: ${msg}` }],
    structuredContent: { success: false, error: msg }
  };
}
