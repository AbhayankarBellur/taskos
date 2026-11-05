export function formatResourceResult(uri, data) {
  const uriStr = typeof uri === "string" ? uri : (uri?.href || uri?.toString() || "");
  return {
    contents: [
      {
        uri: uriStr,
        mimeType: "application/json",
        text: JSON.stringify(data)
      }
    ]
  };
}
