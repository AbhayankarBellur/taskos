export function formatMcpSuccess(data, summaryText) {
  return {
    content: [{ type: "text", text: summaryText || JSON.stringify(data, null, 2) }],
    structuredContent: { success: true, data }
  };
}
