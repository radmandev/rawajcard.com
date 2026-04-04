export async function getUserSubscriptions(api, me) {
  if (!me?.id && !me?.email) return [];

  const subsByUserId = me?.id
    ? await api.entities.Subscription.filter({ created_by_user_id: me.id }, '-created_at')
    : [];

  const subsByEmail = me?.email
    ? await api.entities.Subscription.filter({ created_by: me.email }, '-created_at')
    : [];

  const userIdRows = Array.isArray(subsByUserId) ? subsByUserId : [];
  const emailRows = Array.isArray(subsByEmail) ? subsByEmail : [];

  const seen = new Set();
  return [...userIdRows, ...emailRows].filter((sub) => {
    const key = sub?.id || `${sub?.created_by_user_id || ''}:${sub?.created_by || ''}:${sub?.created_at || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function isWithinNewUserWindow(me, newUserWindowDays = 30) {
  const createdAt = me?.created_at || me?.created_date;
  if (!createdAt) return false;

  const parsedCreatedAt = new Date(createdAt).getTime();
  if (!Number.isFinite(parsedCreatedAt)) return false;

  return Date.now() - parsedCreatedAt <= Number(newUserWindowDays || 30) * 24 * 60 * 60 * 1000;
}

export function hasUsedPaidOrTrial(subscriptions = []) {
  const rows = Array.isArray(subscriptions)
    ? subscriptions
    : subscriptions
    ? [subscriptions]
    : [];

  return rows.some((sub) => {
    const plan = sub?.plan || sub?.plan_type || 'free';
    const metadata = sub?.metadata || {};

    return plan !== 'free' || Boolean(
      metadata.activated_at ||
      metadata.stripe_subscription_id ||
      metadata.stripe_session_id ||
      metadata.trial_started_at ||
      metadata.trial_used_at
    );
  });
}

export function isEligibleForIntroTrial({ me, subscriptions, newUserWindowDays }) {
  return isWithinNewUserWindow(me, newUserWindowDays) && !hasUsedPaidOrTrial(subscriptions);
}
