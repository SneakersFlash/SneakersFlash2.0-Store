// src/features/auth/types/index.ts 
// (atau di src/types/user.types.ts jika Anda belum memindahkannya)

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "USER" | "ADMIN";
  provider?: "LOCAL" | "GOOGLE" | "APPLE"; // Tambahan untuk tracking OAuth
  createdAt: string;
}

export interface AuthTokens {
  access_token: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone: string; // Sekarang wajib (tidak ada tanda '?')
}

export interface OAuthLoginDto {
  token: string; // Token ID yang didapat dari Google/Apple SDK di frontend
}

export interface WelcomeVoucher {
  code: string;
  name: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minPurchaseAmount: number;
  expiresAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
  welcomeVoucher?: WelcomeVoucher;
}

export interface UserProfile {
  id: string; // atau number, tergantung parsing BigInt dari backend
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  customerTier: string;
  pointsBalance: number | any;
  createdAt: string;
  addresses?: UserAddress[]; // Alamat default
}

export interface UserAddress {
  id: number;
  label: string | null;
  recipientName: string;
  phone: string;
  addressLine: string;
  provinceId: number;
  cityId: number;
  districtId: number;
  subdistrictId: number | null;
  postalCode: string;
  isDefault: boolean;
  latitude?: number
  longitude?: number
  // Relasi (opsional, tergantung backend mengirimkannya atau tidak)
  province?: { id: number; name: string };
  city?: { id: number; name: string; type: string };
  district?: { id: number; name: string };
}

export interface CreateUserAddressDto extends Omit<UserAddress, 'id' | 'province' | 'city' | 'district'> {}
export interface UpdateUserAddressDto extends Partial<CreateUserAddressDto> {}