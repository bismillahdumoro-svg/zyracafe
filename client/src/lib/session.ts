// Session persistence - keep user logged in across app minimize/lock
import { User, Shift } from "@/lib/types";

const SESSION_STORAGE_KEY = "pos_session";
const SESSION_EXPIRY_HOURS = 24;

export interface StoredSession {
  user: User;
  shift: Shift | null;
  savedAt: string;
}

// Save session to localStorage saat login
export function saveSession(user: User, shift: Shift | null = null) {
  const session: StoredSession = {
    user,
    shift,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  console.log("[Session] Saved session untuk", user.username);
}

// Load session dari localStorage saat app start
export function loadSession(): StoredSession | null {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;

    const session: StoredSession = JSON.parse(stored);
    
    // Check if session sudah expired (24 jam)
    const savedTime = new Date(session.savedAt);
    const now = new Date();
    const hoursPassed = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursPassed > SESSION_EXPIRY_HOURS) {
      console.log("[Session] Session expired - lebih dari 24 jam");
      clearSession();
      return null;
    }

    // Convert shift dates back to Date objects
    if (session.shift) {
      session.shift.startTime = new Date(session.shift.startTime);
      if (session.shift.endTime) {
        session.shift.endTime = new Date(session.shift.endTime);
      }
    }

    console.log("[Session] Restored session untuk", session.user.username);
    return session;
  } catch (error) {
    console.error("[Session] Failed to load session:", error);
    return null;
  }
}

// Clear session dari localStorage saat logout
export function clearSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  console.log("[Session] Cleared session");
}

// Update shift di session (saat shift dimulai/berhenti)
export function updateSessionShift(shift: Shift | null) {
  const stored = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!stored) return;

  try {
    const session: StoredSession = JSON.parse(stored);
    session.shift = shift;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    console.log("[Session] Updated shift");
  } catch (error) {
    console.error("[Session] Failed to update shift:", error);
  }
}
