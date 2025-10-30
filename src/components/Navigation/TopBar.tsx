// src/components/Navigation/TopBar.tsx
import React from "react";
import c from "./TopBar.module.scss";

type C = {
  id: string;
  name: string;
  link: string;
};

const items: C[] = [
  { id: "1", name: "CPU", link: "CPU" },
  { id: "2", name: "GPU", link: "GPU" },
  { id: "3", name: "IPhone", link: "IPhone" },
];

export const TopBar: React.FC = () => {
  return (
    <div className={c.n}>
      {items.map((item) => (
        <div key={item.id} className={c.n__i}>
          <span className={c["n__i--cl"]}>{item.name}</span>
        </div>
      ))}
    </div>
  );
};

export default TopBar;
