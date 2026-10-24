export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000/api/v1";

export interface AuthUser {
  id?: string;
  publicId?: string;
  email: string;
  name: string;
  role: string;
  status?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

const TOKEN_KEY = "thaivista_admin_access_token";
const REFRESH_TOKEN_KEY = "thaivista_admin_refresh_token";
const USER_KEY = "thaivista_admin_user";

export function subscribeAuth(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("thaivista-auth-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("thaivista-auth-change", callback);
  };
}

export function dispatchAuthChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("thaivista-auth-change"));
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

let cachedUserRaw: string | null = null;
let cachedUserObj: AuthUser | null = null;

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    cachedUserRaw = null;
    cachedUserObj = null;
    return null;
  }
  if (raw === cachedUserRaw) {
    return cachedUserObj;
  }
  try {
    cachedUserRaw = raw;
    cachedUserObj = JSON.parse(raw) as AuthUser;
    return cachedUserObj;
  } catch {
    cachedUserRaw = null;
    cachedUserObj = null;
    return null;
  }
}

export function setAuthSession(session: {
  accessToken: string;
  refreshToken?: string;
  user?: AuthUser;
}): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, session.accessToken);
  if (session.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  }
  if (session.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  }
  dispatchAuthChange();
}

export async function clearFrontendCache(): Promise<void> {
  if (typeof window === "undefined") return;

  // 1. Clear LocalStorage
  try {
    localStorage.clear();
  } catch (e) {
    console.warn("Failed to clear localStorage:", e);
  }

  // 2. Clear SessionStorage
  try {
    sessionStorage.clear();
  } catch (e) {
    console.warn("Failed to clear sessionStorage:", e);
  }

  // 3. Clear CacheStorage API (service worker / browser cache)
  if ("caches" in window) {
    try {
      const keys = await window.caches.keys();
      await Promise.all(keys.map((k) => window.caches.delete(k)));
    } catch (e) {
      console.warn("Failed to clear CacheStorage:", e);
    }
  }

  // 4. Clear accessible browser cookies
  try {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      if (name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    }
  } catch (e) {
    console.warn("Failed to clear cookies:", e);
  }

  dispatchAuthChange();
}


export type PropertyStatus = "published" | "pending";

export interface PropertyItem {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  lineId?: string;
  intent: "sell" | "rentOut" | string;
  propertyType: "condo" | "house" | "villa" | "land" | "commercial" | string;
  buildingName: string;
  bedrooms: string;
  bathrooms: string;
  sizeSQM: string;
  price: string;
  status?: PropertyStatus | string;
  message?: string;
  photoPaths: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyInput {
  name: string;
  phone?: string;
  email?: string;
  lineId?: string;
  intent: "sell" | "rentOut" | string;
  propertyType: "condo" | "house" | "villa" | "land" | "commercial" | string;
  buildingName: string;
  bedrooms: string;
  bathrooms: string;
  sizeSQM: string;
  price: string;
  status?: PropertyStatus | string;
  message?: string;
  photoPaths?: string[];
}

export interface InquiryContact {
  name: string;
  phoneWhatsApp?: string;
  email?: string;
  lineId?: string;
}

export interface InquiryItem {
  _id: string;
  intent: "contact" | "buy" | "rent" | "invest" | string;
  propertyType?: string | null;
  preferredArea?: string | null;
  budget?: string | null;
  bedrooms?: string | null;
  timeline?: string | null;
  contact: InquiryContact;
  message?: string;
  status: "pending" | "resolved" | string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Properties CRUD
export async function fetchProperties(params?: {
  search?: string;
  status?: string;
}): Promise<{
  properties: PropertyItem[];
  total: number;
}> {
  try {
    const url = new URL(`${API_BASE_URL}/properties`);
    url.searchParams.set("limit", "100");
    if (params?.search) url.searchParams.set("search", params.search);
    if (params?.status && params.status !== "all") {
      url.searchParams.set("status", params.status);
    }

    const res = await fetch(url.toString(), {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const json: ApiResponse<PropertyItem[]> = await res.json();
    return {
      properties: json.data || [],
      total: json.meta?.total ?? json.data?.length ?? 0,
    };
  } catch (error) {
    console.warn("Failed to fetch properties from API:", error);
    return { properties: [], total: 0 };
  }
}

export async function createProperty(
  input: CreatePropertyInput
): Promise<{ success: boolean; data?: PropertyItem; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/properties`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!res.ok) {
      const errMsg = Array.isArray(json.message)
        ? json.message.join(", ")
        : json.message || "Failed to create property";
      return { success: false, error: errMsg };
    }
    return { success: true, data: json.data };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Network error";
    return { success: false, error: msg };
  }
}

export async function updateProperty(
  id: string,
  input: Partial<CreatePropertyInput>
): Promise<{ success: boolean; data?: PropertyItem; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!res.ok) {
      const errMsg = Array.isArray(json.message)
        ? json.message.join(", ")
        : json.message || "Failed to update property";
      return { success: false, error: errMsg };
    }
    return { success: true, data: json.data };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Network error";
    return { success: false, error: msg };
  }
}

export async function deleteProperty(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (error) {
    console.error("Failed to delete property:", error);
    return false;
  }
}

export async function updatePropertyStatus(
  id: string,
  status: PropertyStatus | string
): Promise<boolean> {
  return (await updateProperty(id, { status })).success;
}

export interface CreateInquiryInput {
  intent?: "contact" | "buy" | "rent" | "invest" | string;
  propertyType?: string | null;
  preferredArea?: string | null;
  budget?: string | null;
  bedrooms?: string | null;
  timeline?: string | null;
  contact: InquiryContact;
  message?: string;
  status?: string;
}

// Inquiries CRUD
export async function fetchInquiries(): Promise<{
  inquiries: InquiryItem[];
  total: number;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/property-inquiries?limit=100`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const json: ApiResponse<InquiryItem[]> = await res.json();
    return {
      inquiries: json.data || [],
      total: json.meta?.total ?? json.data?.length ?? 0,
    };
  } catch (error) {
    console.warn("Failed to fetch inquiries from API:", error);
    return { inquiries: [], total: 0 };
  }
}

export async function createInquiry(
  input: CreateInquiryInput
): Promise<{ success: boolean; data?: InquiryItem; error?: string }> {
  try {
    const payload = { ...input };
    if (!payload.status) {
      delete payload.status;
    }
    const res = await fetch(`${API_BASE_URL}/property-inquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      const errMsg = Array.isArray(json.message)
        ? json.message.join(", ")
        : json.message || "Failed to create enquiry";
      return { success: false, error: errMsg };
    }
    return { success: true, data: json.data };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Network error";
    return { success: false, error: msg };
  }
}

export async function updateInquiryStatus(
  id: string,
  status: string
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/property-inquiries/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch (error) {
    console.error("Failed to update inquiry status:", error);
    return false;
  }
}

export async function updateInquiry(
  id: string,
  input: Partial<CreateInquiryInput>
): Promise<{ success: boolean; data?: InquiryItem; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/property-inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!res.ok) {
      const errMsg = Array.isArray(json.message)
        ? json.message.join(", ")
        : json.message || "Failed to update requirement";
      return { success: false, error: errMsg };
    }
    return { success: true, data: json.data };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Network error";
    return { success: false, error: msg };
  }
}

export async function deleteInquiry(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/property-inquiries/${id}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (error) {
    console.error("Failed to delete inquiry:", error);
    return false;
  }
}

// Storage Usage (Cloudinary / AWS S3 agnostic via API)
export interface StorageUsageData {
  provider: string; // e.g. "Cloudinary" | "AWS S3"
  rawProvider: string; // e.g. "cloudinary" | "s3"
  usedFormatted: string; // e.g. "0.2 GB", "150 MB"
  limitFormatted?: string; // e.g. "20 GB", "25 GB"
  remainingFormatted?: string; // e.g. "19.8 GB"
  percentUsed: number;
  plan?: string;
  hasQuota: boolean;
}

export async function fetchStorageUsage(): Promise<StorageUsageData> {
  try {
    const res = await fetch(`${API_BASE_URL}/uploads/storage/usage`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      const data = json.data;
      if (data) {
        const rawProvider = (data.provider || "cloudinary").toLowerCase();
        const provider =
          rawProvider === "s3"
            ? "AWS S3"
            : rawProvider === "cloudinary"
            ? "Cloudinary"
            : rawProvider.toUpperCase();

        const storage = data.storage || {};
        const usedFormatted = storage.usedFormatted || "0 Bytes";
        const limitFormatted = storage.limitFormatted;
        const remainingFormatted = storage.remainingFormatted;
        const percentUsed =
          typeof storage.usedPercentage === "number"
            ? storage.usedPercentage
            : 0;

        return {
          provider,
          rawProvider,
          usedFormatted,
          limitFormatted,
          remainingFormatted,
          percentUsed,
          plan: data.plan,
          hasQuota: Boolean(limitFormatted),
        };
      }
    }
  } catch (err) {
    console.warn("Storage usage fetch from API failed:", err);
  }

  // Graceful default if API endpoint is unreachable
  return {
    provider: "Cloud Storage",
    rawProvider: "cloud",
    usedFormatted: "0 Bytes",
    limitFormatted: "20 GB",
    remainingFormatted: "20 GB",
    percentUsed: 0,
    hasQuota: true,
  };
}

// ==========================================
// Authentication APIs (Login, Change Password, Logout)
// ==========================================

export async function loginAdmin(
  email: string,
  password: string
): Promise<{ success: boolean; data?: AuthSession; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();
    if (!res.ok) {
      const errMsg = Array.isArray(json.message)
        ? json.message.join(", ")
        : json.message || "Failed to sign in";
      return { success: false, error: errMsg };
    }

    const sessionData: AuthSession = json.data;
    if (sessionData?.accessToken) {
      setAuthSession(sessionData);
    }

    return { success: true, data: sessionData };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Network error";
    return { success: false, error: msg };
  }
}

export async function changePassword(
  input: ChangePasswordInput,
  explicitToken?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const token = explicitToken || getAuthToken();
    if (!token) {
      return {
        success: false,
        error: "Authentication token is missing. Please sign in again.",
      };
    }

    const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      const errMsg = Array.isArray(json.message)
        ? json.message.join(", ")
        : json.message || "Failed to change password";
      return { success: false, error: errMsg };
    }

    return {
      success: true,
      message: json.message || "Password changed successfully",
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Network error";
    return { success: false, error: msg };
  }
}

export async function logoutAdmin(
  explicitToken?: string
): Promise<{ success: boolean; message?: string }> {
  const token = explicitToken || getAuthToken();

  // Invalidate session on backend if token exists
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.warn("Backend logout request failed, clearing frontend cache anyway:", err);
    }
  }

  // Clear all front-end cache (localStorage, sessionStorage, browser cache, cookies)
  await clearFrontendCache();

  return {
    success: true,
    message: "Logged out successfully and frontend cache cleared",
  };
}

