// src/types/account.ts
import type { Address } from "./address";
import type { Order } from "./order";
import type { Profile } from "./profile";
import type { Settings } from "./settings";
import type { Wishlist } from "./wishlist";


export type Account = {
  profile: Profile;
  addresses: Address[];
  orders: Order[];
  wishlist: Wishlist[];
  settings: Settings;
};
