import React from "react";
import clsx from "clsx";
import c from "./MenuList.module.scss";

export type MenuListItem = {
  key?: React.Key;
  label: React.ReactNode;
  onSelect?: () => void;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  disabled?: boolean;
  tone?: "default" | "danger";
};

export interface MenuListProps {
  items: MenuListItem[];
  role?: "menu" | "listbox" | "list";
  ariaLabel?: string;
  listId?: string;
  className?: string;
}

const getItemRole = (role: MenuListProps["role"]) => {
  if (role === "menu") return "menuitem";
  if (role === "listbox") return "option";
  return undefined;
};

export default function MenuList({
  items,
  role = "menu",
  ariaLabel = "Menu",
  listId,
  className,
}: MenuListProps) {
  if (!items || items.length === 0) return null;

  const itemRole = getItemRole(role);
  const renderIcon = (icon: React.ReactNode, className: string) => {
    if (React.isValidElement<{ className?: string }>(icon)) {
      const prev = icon.props.className;
      return React.cloneElement(icon, { className: clsx(className, prev) });
    }
    return (
      <span className={className} aria-hidden>
        {icon}
      </span>
    );
  };

  return (
    <ul className={clsx(c.list, className)} role={role} aria-label={ariaLabel} id={listId}>
      {items.map((item, idx) => {
        const key = item.key ?? idx;
        const disabled = !!item.disabled;
        const onSelect = () => {
          if (disabled) return;
          item.onSelect?.();
        };

        return (
          <li
            key={key}
            className={clsx(
              c.list__item,
              item.tone === "danger" && c.danger,
              disabled && c.disabled
            )}
            role={itemRole}
            aria-disabled={disabled || undefined}
            tabIndex={disabled ? -1 : 0}
            onClick={onSelect}
            onKeyDown={(e) => {
              if (disabled) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect();
              }
            }}
          >
            {item.iconLeft && renderIcon(item.iconLeft, c["list__item--icon-left"])}
            <span className={c["list__item--label"]}>{item.label}</span>
            {item.iconRight && renderIcon(item.iconRight, c["list__item--icon-right"])}
          </li>
        );
      })}
    </ul>
  );
}
