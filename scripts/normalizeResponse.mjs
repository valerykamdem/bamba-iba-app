import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('.tmp/login-response.json','utf8'));

function get(obj, ...keys) {
  for (const k of keys) {
    if (!obj) continue;
    // support nested dot paths like 'data.token'
    if (k.includes('.')) {
      const parts = k.split('.');
      let cur = obj;
      let ok = true;
      for (const p of parts) {
        if (cur && Object.prototype.hasOwnProperty.call(cur, p) && cur[p] != null) {
          cur = cur[p];
        } else { ok = false; break; }
      }
      if (ok) return cur;
    } else {
      if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] != null) return obj[k];
    }
  }
  return undefined;
}

function mapRolesToRole(roles) {
  if (!roles) return 'user';
  if (Array.isArray(roles)) {
    const lowered = roles.map(r => String(r).toLowerCase());
    if (lowered.includes('admin') || lowered.includes('administrator')) return 'admin';
    if (lowered.includes('moderator')) return 'moderator';
    return 'user';
  }
  const r = String(roles).toLowerCase();
  if (r.includes('admin')) return 'admin';
  if (r.includes('moderator')) return 'moderator';
  return 'user';
}

function normalizeUser(userData) {
  return {
    id: userData.id || userData.userId || 'unknown',
    username: userData.username || userData.name || (userData.email && userData.email.split('@')[0]) || 'User',
    email: userData.email || '',
    avatar: userData.avatar || userData.profileImage || userData.profile_image || '',
    role: userData.role || mapRolesToRole(userData.roles) || 'user',
  };
}

function normalizeAuthResponse(data) {
  // token detection
  const token = get(data, 'token', 'accessToken', 'access_Token', 'data.token', 'data.accessToken', 'data.access_Token') || '';
  const refreshToken = get(data, 'refreshToken', 'refresh_token', 'refresh_Token', 'data.refreshToken', 'data.refresh_token', 'data.refresh_Token') || undefined;

  if (data.user || (data.data && data.data.user)) {
    const rawUser = data.user || data.data.user;
    const user = normalizeUser(rawUser);
    return { user, token: token || '', refreshToken };
  }

  const flat = data.data || data;
  const rawUser = {
    id: get(flat, 'userId', 'id', 'sub'),
    email: get(flat, 'email', 'prefferred_username', 'preferred_username'),
    username: get(flat, 'prefferred_username', 'preferred_username', 'username', 'email'),
    name: get(flat, 'name') || `${get(flat, 'given_name') || ''} ${get(flat, 'family_name') || ''}`.trim(),
    avatar: get(flat, 'avatar', 'profileImage', 'profile_image'),
    roles: get(flat, 'roles') || get(flat, 'role') || [],
  };

  const user = {
    id: rawUser.id || 'unknown',
    username: rawUser.username || rawUser.email || 'User',
    email: rawUser.email || '',
    avatar: rawUser.avatar || '',
    role: mapRolesToRole(rawUser.roles),
  };

  return { user, token: token || '', refreshToken };
}

const normalized = normalizeAuthResponse(raw);
console.log(JSON.stringify({ raw, normalized }, null, 2));
