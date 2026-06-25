export function generateNextCode(
  existingCodes: (string | undefined)[],
  prefix: string,
  digits: number = 3
): string {
  let maxNum = 0;
  const regex = new RegExp(`^${prefix}-(\\d{${digits}})$`);
  for (const code of existingCodes) {
    if (code) {
      const match = code.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
  }
  return `${prefix}-${String(maxNum + 1).padStart(digits, '0')}`;
}
