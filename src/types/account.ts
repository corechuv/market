// src/types/account.ts
import type { Address } from "./address";
/*import type { Order } from "./order";*/
import type { Profile } from "./profile";
import type { ReturnRequest } from "./return";
import type { Settings } from "./settings";

export type Account = {
  profile: Profile;
  addresses: Address[];
  /*orders: Order[];*/
  returns: ReturnRequest[];
  settings: Settings;
};
