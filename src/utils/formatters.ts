export function formatHoras(h: number): string {
  const totalMinutos = Math.floor(h * 60);
  const hrs = Math.floor(totalMinutos / 60);
  const min = totalMinutos % 60;
  if (hrs === 0) return `${min} min`;
  if (min === 0) return `${hrs}h`;
  return `${hrs}h ${min}min`;
}
