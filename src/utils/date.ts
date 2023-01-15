function toIsoString(date: Date): string {
  const tzo = -date.getTimezoneOffset()
  const dif = tzo >= 0 ? '+' : '-'
  const pad = function (num: any): string {
    return String(num).toString().padStart(2, '0')
  }

  return (
    date.getFullYear().toString() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds()) +
    dif +
    pad(Math.floor(Math.abs(tzo) / 60)) +
    ':' +
    pad(Math.abs(tzo) % 60)
  )
}

export function getCurrentDateTimeIso(): string {
  return toIsoString(new Date())
}

export function getCurrentDate(): string {
  return new Date().toLocaleDateString('sv')
}
