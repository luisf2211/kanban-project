export function cleanPayload(payload: any) {
  const cleaned: any = {};
  for (const key in payload) {
    const val = payload[key];

    if (val === undefined || val === null || val === "") continue;

    // Drizzle NO acepta numbers si la columna es string/text
    if (key === "value") {
      cleaned[key] = String(val);
      continue;
    }

    cleaned[key] = val;
  }

  return cleaned;
}