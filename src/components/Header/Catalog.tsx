// Catalog.tsx – desktop dropdown + mobile drawer (обновлено "категории → товары" свайп)
import React, {
    useState,
    useCallback,
    useMemo,
    useEffect,
    type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import cls from "./Catalog.module.scss";
import CloseIcon from "../Icons/CloseIcon";
import HamburgerIcon from "../Icons/HamburgerIcon";
import Modal from "../Modal/Modal";
import ChevronRightIcon from "../Icons/ChevronRightIcon";
import ChevronLeftIcon from "../Icons/ChevronLeftIcon";
import Logo from "../logo/Logo";

import { createPortal } from "react-dom";
import SunIcon from "../Icons/SunIcon";
import MoonIcon from "../Icons/MoonIcon";

function Overlay({ visible, onClick }: { visible: boolean; onClick?: () => void }) {
    return createPortal(
        <div
            className={`${cls.overlay} ${visible ? cls.overlayVisible : ""}`}
            onClick={onClick}
            aria-hidden={!visible}
        />,
        document.body
    );
}

interface Category {
    id: string;
    label: string;
    path: string;
    items: string[];
}

// Категории: 4 колонки × 5 позиций каждая
const categories: Category[] = [
    {
        id: "electronics",
        label: "Electronics",
        path: "/category/electronics",
        items: [
            "Smartphone",
            "Laptop",
            "Tablet",
            "Smartwatch",
            "Wireless Earbuds",
            "Bluetooth Speaker",
            "Camera",
            "Drone",
            "Gaming Console",
            "Portable Charger",
            "Smart TV",
            "Action Camera",
            "VR Headset",
            "Router",
            "External SSD",
            "Smart Home Hub",
            "E-reader",
            "Projector",
            "Desktop PC",
            "Fitness Tracker",
        ],
    },
    {
        id: "fashion",
        label: "Fashion",
        path: "/category/fashion",
        items: [
            "T-Shirt",
            "Jeans",
            "Sneakers",
            "Leather Jacket",
            "Dress",
            "Skirt",
            "Suit",
            "Blouse",
            "Sweater",
            "Boots",
            "Sunglasses",
            "Watch",
            "Handbag",
            "Scarf",
            "Hat",
            "Belt",
            "Coat",
            "Heels",
            "Polo Shirt",
            "Cardigan",
        ],
    },
    {
        id: "home-appliances",
        label: "Home Appliances",
        path: "/category/home-appliances",
        items: [
            "Refrigerator",
            "Washing Machine",
            "Microwave Oven",
            "Dishwasher",
            "Vacuum Cleaner",
            "Air Conditioner",
            "Water Purifier",
            "Induction Cooktop",
            "Electric Kettle",
            "Toaster",
            "Food Processor",
            "Coffee Maker",
            "Air Fryer",
            "Electric Grill",
            "Rice Cooker",
            "Steam Iron",
            "Robot Vacuum",
            "Dehumidifier",
            "Juicer",
            "Blender",
        ],
    },
    {
        id: "books",
        label: "Books",
        path: "/category/books",
        items: [
            "Mystery Novel",
            "Science-Fiction",
            "Historical Fiction",
            "Fantasy Saga",
            "Self-Help Guide",
            "Biography",
            "Business Strategy",
            "Cookbook",
            "Travelogue",
            "Poetry Collection",
            "Graphic Novel",
            "Children's Picture Book",
            "Classic Literature",
            "Thriller",
            "Young Adult",
            "Philosophy Text",
            "Science Textbook",
            "Comedy Anthology",
            "Romance Novel",
            "Art Monograph",
        ],
    },
    {
        id: "sports",
        label: "Sports & Outdoors",
        path: "/category/sports",
        items: [
            "Mountain Bike",
            "Running Shoes",
            "Yoga Mat",
            "Camping Tent",
            "Hiking Backpack",
            "Basketball",
            "Soccer Ball",
            "Tennis Racket",
            "Fitness Band",
            "Swim Goggles",
            "Climbing Rope",
            "Kayak",
            "Skateboard",
            "Resistance Bands",
            "Dumbbells",
            "Fishing Rod",
            "Ski Helmet",
            "Boxing Gloves",
            "Golf Clubs",
            "Surfboard",
        ],
    },
];

function chunkArray<T>(arr: T[], size: number): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

interface CatalogProps {
    trigger?: "click" | "hover";
    initialActiveId?: string;
    showCloseButton?: boolean;
    onSelect?: (id: string | null) => void;
    className?: string;
    children?: ReactNode;

    // НОВОЕ:
    mobileDrawerOpen?: boolean;                         // внешнее управление open/close
    onMobileDrawerOpenChange?: (open: boolean) => void; // колбэк при изменении
    renderMobileHamburger?: boolean;                    // по умолчанию true (для обратной совместимости)
}

export default function Catalog({
    trigger = "click",
    initialActiveId,
    showCloseButton = trigger === "click",
    onSelect,
    className = "",
    children,
    mobileDrawerOpen,
    onMobileDrawerOpenChange,
    renderMobileHamburger = true,
}: CatalogProps) {
    const nav = useNavigate();

    const [isHover, setIsHover] = useState(false);

    /* ---------- viewport ---------- */
    const [isMobile, setIsMobile] = useState<boolean>(
        typeof window !== "undefined" ? window.innerWidth < 768 : false
    );
    useEffect(() => {
        const h = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", h);
        return () => window.removeEventListener("resize", h);
    }, []);

    /* ---------- desktop dropdown ---------- */
    const initialActive = useMemo<Category | null>(
        () => categories.find((c) => c.id === initialActiveId) ?? null,
        [initialActiveId]
    );
    const [active, setActive] = useState<Category | null>(initialActive);

    const select = useCallback(
        (cat: Category | null) => {
            setActive(cat);
            onSelect?.(cat ? cat.id : null);
        },
        [onSelect]
    );
    const toggle = useCallback(
        (cat: Category) => select(active?.id === cat.id ? null : cat),
        [active, select]
    );

    /* ---------- mobile drawer ---------- */
    const [internalOpen, setInternalOpen] = useState(false);
    const drawerOpen = mobileDrawerOpen ?? internalOpen;
    const setDrawerOpen = (open: boolean) => {
        onMobileDrawerOpenChange ? onMobileDrawerOpenChange(open) : setInternalOpen(open);
    };

    const [drawerCat, setDrawerCat] = useState<Category | null>(null);
    const [mobileStage, setMobileStage] = useState<"categories" | "items">(
        "categories"
    );

    // Esc-для закрытия
    useEffect(() => {
        if (!drawerOpen) return;
        const esc = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
        window.addEventListener("keydown", esc);
        return () => window.removeEventListener("keydown", esc);
    }, [drawerOpen]);

    /* ---------- handlers ---------- */
    const handleClick = useCallback(
        (cat: Category, e: React.MouseEvent<HTMLAnchorElement>) => {
            if (trigger !== "click") return;
            e.preventDefault();
            toggle(cat);
        },
        [trigger, toggle]
    );
    const handleMouseEnter = useCallback(
        (cat: Category) => trigger === "hover" && select(cat),
        [trigger, select]
    );
    const handleMouseLeave = () => trigger === "hover" && select(null);

    /* ---------- mobile specific ---------- */
    const openItems = (cat: Category) => {
        setDrawerCat(cat);
        setMobileStage("items");
    };
    const backToCats = () => setMobileStage("categories");
    const closeDrawer = () => {
        setDrawerOpen(false);
        setMobileStage("categories");
        setDrawerCat(null);
    };

    const overlayVisible = (trigger === "hover" && (isHover || !!active)) || (trigger === "click" && !!active);

    /* Инициализация темы и сохранение в localStorage */
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window === 'undefined') return 'light';
        const saved = (localStorage.getItem('theme') as 'light' | 'dark' | null);
        if (saved) return saved;
        return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    /* ---------- render ---------- */
    return (
        <>
            {/* оверлей снаружи header по DOM, но под ним по z-index */}
            <Overlay
                visible={overlayVisible && !isMobile}
                onClick={() => {
                    // при клике вне — закрываем только в click-режиме
                    if (trigger === "click") select(null);
                }}
            />
            <div
                className={`${cls.catalogContainer} ${active ? cls.isOpen : ""} ${isHover ? cls.isHover : ""}`}
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
            >
                <nav
                    className={`${cls.catalog} ${className}`}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* ---------- MOBILE HAMBURGER ---------- */}
                    {isMobile && renderMobileHamburger && (
                        <button
                            className={cls.hamburger}
                            aria-label="Open menu"
                            onClick={() => setDrawerOpen(true)}
                        >
                            <HamburgerIcon />
                        </button>
                    )}

                    {/* ---------- DESKTOP NAV ---------- */}
                    <ul className={cls.categories} aria-label="Catalog navigation">
                        {categories.map((cat) => (
                            <li key={cat.id} className={cls.categoryItem}>
                                <a
                                    href={cat.path}
                                    className={
                                        active?.id === cat.id
                                            ? `${cls.categoryLink} ${cls.categoryLinkActive}`
                                            : cls.categoryLink
                                    }
                                    onClick={(e) => handleClick(cat, e)}
                                    onMouseEnter={() => handleMouseEnter(cat)}
                                    aria-expanded={active?.id === cat.id}
                                >
                                    {cat.label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* ---------- DESKTOP DROPDOWN ---------- */}
                    {!isMobile && active && (
                        <div className={cls.panel} role="dialog" aria-modal="true">
                            <div className={cls.panel__content}>
                                {showCloseButton && (
                                    <button
                                        className={cls["panel__content--close"]}
                                        onClick={() => select(null)}
                                        aria-label="Close"
                                    >
                                        <CloseIcon />
                                    </button>
                                )}

                                <h2 className={cls.panelTitle}>{active.label}</h2>

                                <div className={cls.columns}>
                                    {chunkArray(active.items, 5).map((col, i) => (
                                        <ul key={i} className={cls.columnList}>
                                            {col.map((item) => (
                                                <li key={item} className={cls.columnItem}>
                                                    <a onClick={() => nav(`/catalog/${item}`)}>{item}</a>
                                                </li>
                                            ))}
                                        </ul>
                                    ))}
                                </div>

                                {children}
                            </div>
                        </div>
                    )}

                    {/* ---------- MOBILE DRAWER ---------- */}
                    {isMobile && (
                        <Modal
                            isOpen={drawerOpen}
                            onClose={closeDrawer}
                            variant="left"
                            sideWidth={300}
                            headerBorder={false}
                            header={<Logo size={26} />}
                            className={cls.mobileDrawer}
                        >
                            {/* ---------- CATEGORIES SCREEN ---------- */}
                            <div
                                className={
                                    mobileStage === "categories"
                                        ? cls.screenActive
                                        : cls.screenHiddenLeft
                                }
                            >
                                <ul className={cls.mobileCategories}>
                                    {categories.map((cat) => (
                                        <li key={cat.id} className={cls.mobileCategoryItem}>
                                            <button
                                                className={cls.mobileCatBtn}
                                                onClick={() => openItems(cat)}
                                            >
                                                {cat.label}
                                                <ChevronLeftIcon className={cls.mobileChevron} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <div className={cls.mobileFooter}>
                                    <a>Help</a>
                                    <a>Contact Us</a>
                                </div>
                                <div className={cls.themeSwitch}>
                                    <button className={cls.switchBtn} onClick={() => { setTheme('light'); }}>
                                        <SunIcon />
                                    </button>
                                    <button className={cls.switchBtn} onClick={() => { setTheme('dark'); }}>
                                        <MoonIcon />
                                    </button>
                                </div>
                                <div className={cls.languageSwitch}>
                                    <span>Language:</span>
                                    <a href="/en" className={cls.languageLink}>English</a>
                                </div>
                            </div>

                            {/* ---------- ITEMS SCREEN ---------- */}
                            <div
                                className={
                                    mobileStage === "items"
                                        ? cls.screenActive
                                        : cls.screenHiddenRight
                                }
                            >
                                <button
                                    className={cls.backBtn}
                                    onClick={backToCats}
                                    aria-label="Назад к категориям"
                                >
                                    <ChevronRightIcon />
                                    Back
                                </button>

                                {drawerCat && (
                                    <>
                                        <h2 className={cls.panelTitle}>{drawerCat.label}</h2>
                                        <div className={cls.mobileColumns}>
                                            {chunkArray(drawerCat.items, 5).map((col, i) => (
                                                <ul key={i} className={cls.columnList}>
                                                    {col.map((item) => (
                                                        <li key={item} className={cls.columnItem}>
                                                            <a
                                                                onClick={() => {
                                                                    closeDrawer();
                                                                    nav(`/catalog/${item}`);
                                                                }}
                                                            >
                                                                {item}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </Modal>
                    )}
                </nav>
            </div>
        </>
    );
}