const DAY_MS = 24 * 60 * 60 * 1000;

export function canCompleteTrial(endsAt: string | Date, now: Date = new Date()) {
  const end = endsAt instanceof Date ? endsAt : new Date(endsAt);
  return !Number.isNaN(end.getTime()) && now.getTime() >= end.getTime();
}

export function getTrialDaysRemaining(endsAt: string | Date, now: Date = new Date()) {
  const end = endsAt instanceof Date ? endsAt : new Date(endsAt);
  if (Number.isNaN(end.getTime())) return 0;
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / DAY_MS));
}
