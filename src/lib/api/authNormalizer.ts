import { User } from '@/store/useAuthStore';

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

/**
 * Normalise la réponse de l'API d'authentification
 * Gère différents formats de réponse du backend
 */
export function normalizeAuthResponse(data: any): AuthResponse {
  console.log('Raw API response:', data);

  // Helper to read nested possibilities
  const get = (obj: any, ...keys: string[]) => {
    for (const k of keys) {
      if (obj && Object.prototype.hasOwnProperty.call(obj, k) && obj[k] != null) return obj[k];
    }
    return undefined;
  };

  // token / refreshToken detection (snake_case or camelCase)
  const token = get(data, 'token', 'accessToken', 'access_Token', 'data.token', 'data.accessToken', 'data.access_Token') || '';
  const refreshToken = get(data, 'refreshToken', 'refresh_token', 'refresh_Token', 'data.refreshToken', 'data.refresh_token', 'data.refresh_Token') || undefined;

  // If backend already returns { user, token }
  if (data.user || data.data?.user) {
    const rawUser = data.user || data.data.user;
    const user = normalizeUser(rawUser);
    const out: AuthResponse = {
      user,
      token: token || data.user?.token || data.data?.token || '',
      refreshToken,
    };
    console.log('Normalized auth response (user object):', out);
    return out;
  }

  // Backend sends flattened user fields (observed shape)
  const flat = data.data || data;
  const rawUser = {
    id: get(flat, 'userId', 'id', 'sub'),
    email: get(flat, 'email', 'prefferred_username', 'preferred_username'),
    username: get(flat, 'prefferred_username', 'preferred_username', 'username', 'email'),
    name: get(flat, 'name') || `${get(flat, 'given_name') || ''} ${get(flat, 'family_name') || ''}`.trim(),
    avatar: get(flat, 'avatar', 'profileImage', 'profile_image'),
    roles: get(flat, 'roles') || get(flat, 'role') || [],
  };

  const user: User = {
    id: rawUser.id || 'unknown',
    username: rawUser.username || rawUser.email || 'User',
    email: rawUser.email || '',
    avatar: rawUser.avatar || '',
    role: mapRolesToRole(rawUser.roles),
  };

  const out: AuthResponse = {
    user,
    token: token || '',
    refreshToken,
  };

  console.log('Normalized auth response (flattened):', out);
  return out;
}

/**
 * Normalise les données utilisateur
 */
export function normalizeUser(userData: any): User {
  return {
    id: userData.id || userData.userId || 'unknown',
    username: userData.username || userData.name || userData.email?.split('@')[0] || 'User',
    email: userData.email || '',
    avatar: userData.avatar || userData.profileImage || userData.profile_image || '',
    role: userData.role || mapRolesToRole(userData.roles) || 'user',
  };
}

function mapRolesToRole(roles: any): User['role'] {
  if (!roles) return 'user';
  if (Array.isArray(roles)) {
    const lowered = roles.map((r) => String(r).toLowerCase());
    if (lowered.includes('admin') || lowered.includes('administrator')) return 'admin';
    if (lowered.includes('moderator')) return 'moderator';
    return 'user';
  }
  const r = String(roles).toLowerCase();
  if (r.includes('admin')) return 'admin';
  if (r.includes('moderator')) return 'moderator';
  return 'user';
}
