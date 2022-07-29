export function useInterval(params) {
  const days = params['duration.days'] ? `${params['duration.days']}d ` : '';
  const hours = params['duration.hours'] ? `${params['duration.hours']}h ` : '';
  const minutes = params['duration.minutes'] ? `${params['duration.minutes']}m` : '';
  return `${days}${hours}${minutes}`.trim();
}
