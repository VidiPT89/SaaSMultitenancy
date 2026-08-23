export function activityCsv(
  rows: { createdAt: string; kind: string; message: string; messageEn: string }[],
  locale: 'pt' | 'en',
) {
  const header = 'when,kind,message'
  const lines = rows.map((row) => {
    const message = (locale === 'pt' ? row.message : row.messageEn).replaceAll('"', "'")
    return `${row.createdAt},${row.kind},"${message}"`
  })
  return [header, ...lines].join('\n')
}
