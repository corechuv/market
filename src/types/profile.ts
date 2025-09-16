// src/types/profile.ts
export type Profile = {
  avatar?: string; // dataURL
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthday?: string; // yyyy-mm-dd
};
