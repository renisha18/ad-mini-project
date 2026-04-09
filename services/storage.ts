import AsyncStorage from "@react-native-async-storage/async-storage";

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

export type StoredUser = {
  username: string;
  password: string;
  friends: string[];
  streaks: Record<string, number>;
  lastActive: Record<string, string>;
};

function normalize(username: string): string {
  return username.trim().toLowerCase();
}

async function readUsers(): Promise<StoredUser[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[]): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function signupUser(username: string, password: string): Promise<{ ok: boolean; message?: string }> {
  const cleanUsername = username.trim();
  if (!cleanUsername || !password) return { ok: false, message: "Invalid input" };

  const users = await readUsers();
  const exists = users.some((u) => normalize(u.username) === normalize(cleanUsername));
  if (exists) return { ok: false, message: "Username already exists" };

  const newUser: StoredUser = {
    username: cleanUsername,
    password,
    friends: [],
    streaks: {},
    lastActive: {},
  };
  users.push(newUser);
  await writeUsers(users);
  await setCurrentUser(cleanUsername);
  return { ok: true };
}

export async function loginUser(username: string, password: string): Promise<{ ok: boolean; message?: string }> {
  const users = await readUsers();
  const found = users.find((u) => normalize(u.username) === normalize(username));
  if (!found || found.password !== password) {
    return { ok: false, message: "Invalid credentials" };
  }
  await setCurrentUser(found.username);
  return { ok: true };
}

export async function getCurrentUser(): Promise<string | null> {
  return AsyncStorage.getItem(CURRENT_USER_KEY);
}

export async function setCurrentUser(username: string): Promise<void> {
  await AsyncStorage.setItem(CURRENT_USER_KEY, username);
}

export async function logoutUser(): Promise<void> {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
}

export async function getUserByUsername(username: string): Promise<StoredUser | null> {
  const users = await readUsers();
  const found = users.find((u) => normalize(u.username) === normalize(username));
  return found ?? null;
}

export async function addFriendToCurrentUser(friendUsername: string): Promise<{ ok: boolean; message?: string }> {
  const current = await getCurrentUser();
  if (!current) return { ok: false, message: "No current user" };

  const cleanFriend = friendUsername.trim();
  if (!cleanFriend) return { ok: false, message: "Invalid friend username" };
  if (normalize(cleanFriend) === normalize(current)) {
    return { ok: false, message: "Cannot add yourself" };
  }

  const users = await readUsers();
  const index = users.findIndex((u) => normalize(u.username) === normalize(current));
  if (index < 0) return { ok: false, message: "Current user not found" };

  const already = users[index].friends.some((f) => normalize(f) === normalize(cleanFriend));
  if (already) return { ok: false, message: "Friend already exists" };

  users[index].friends.push(cleanFriend);
  users[index].streaks[cleanFriend] = users[index].streaks[cleanFriend] ?? 0;
  users[index].lastActive[cleanFriend] = users[index].lastActive[cleanFriend] ?? "";

  await writeUsers(users);
  return { ok: true };
}

export async function removeFriendFromCurrentUser(friendUsername: string): Promise<void> {
  const current = await getCurrentUser();
  if (!current) return;
  const users = await readUsers();
  const index = users.findIndex((u) => normalize(u.username) === normalize(current));
  if (index < 0) return;

  users[index].friends = users[index].friends.filter((f) => normalize(f) !== normalize(friendUsername));
  delete users[index].streaks[friendUsername];
  delete users[index].lastActive[friendUsername];
  await writeUsers(users);
}

export async function getCurrentUserData(): Promise<StoredUser | null> {
  const current = await getCurrentUser();
  if (!current) return null;
  return getUserByUsername(current);
}

export async function updateFriendStreak(friendUsername: string, streak: number, activeDate: string): Promise<void> {
  const current = await getCurrentUser();
  if (!current) return;
  const users = await readUsers();
  const index = users.findIndex((u) => normalize(u.username) === normalize(current));
  if (index < 0) return;

  users[index].streaks[friendUsername] = streak;
  users[index].lastActive[friendUsername] = activeDate;
  await writeUsers(users);
}

