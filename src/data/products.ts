import type { Product } from "../types/product";

export const products: Product[] = [
  // ───────────────────────── CPUs (по одному варианту без опций) ─────────────────────────
  {
    id: "1",
    name: "Intel Core i9-14900KS",
    price: "691,89 €",
    imageUrl:
      "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
    link: "#",
    available: true,
    shortDescription: [
      "High-performance processor",
      "Exceptional speed and efficiency",
      "Ideal for gaming and multitasking",
      "Supports advanced cooling solutions",
      "Compatible with latest motherboards",
    ],
    description:
      "The Intel Core i9-14900KS is a high-performance processor designed for enthusiasts and gamers, offering exceptional speed and efficiency.",
    images: [
      "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
      "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
      "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
      "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
      "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
    ],
    categoryId: "cat-electronics-computers-cpu",
    attributes: [
      { code: "cpu.cores", value: 24 },
      { code: "cpu.threads", value: 32 },
      { code: "freq.base", value: 3.2 },
      { code: "freq.boost", value: 6.2 },
      { code: "compat.socket", value: "LGA1700" },
      { code: "gpu.integrated", value: "Intel UHD 770" },
      { code: "power.tdp", value: 150 },
      { code: "process.node", value: "Intel 7" },
      { code: "mem.support", value: "DDR5/DDR4" },
      { code: "pcie.version", value: "5.0" },
      { code: "bundle.cooler", value: false },
    ],
    // Для соответствия типу Product:
    options: [],
    variants: [
      {
        id: "1-base",
        sku: "I9-14900KS",
        options: {},
        price: "691,89 €",
        available: true,
        images: [
          "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
        ],
        attributes: [],
      },
    ],
    defaultVariantId: "1-base",
  },
  {
    id: "2",
    name: "Intel Xeon Silver 4",
    price: "1053,00 €",
    imageUrl:
      "https://hydraulic-cdn.com/productimages/8/9/7/1/5/1/6/8/1/6/6/4/1/0/8/3/5/7/7/0196b754-6cdd-729b-85bb-0359118bb75d_2880.avif",
    link: "#",
    available: true,
    shortDescription: [
      "High-performance processor",
      "Exceptional speed and efficiency",
      "Ideal for gaming and multitasking",
      "Supports advanced cooling solutions",
      "Compatible with latest motherboards",
    ],
    description:
      "The Intel Xeon Silver 4 is a powerful server-grade processor, ideal for data centers and enterprise applications, providing robust performance and reliability.",
    images: [
      "https://hydraulic-cdn.com/productimages/8/9/7/1/5/1/6/8/1/6/6/4/1/0/8/3/5/7/7/0196b754-6cdd-729b-85bb-0359118bb75d_2880.avif",
      "https://hydraulic-cdn.com/productimages/8/9/7/1/5/1/6/8/1/6/6/4/1/0/8/3/5/7/7/0196b754-6cdd-729b-85bb-0359118bb75d_2880.avif",
      "https://hydraulic-cdn.com/productimages/8/9/7/1/5/1/6/8/1/6/6/4/1/0/8/3/5/7/7/0196b754-6cdd-729b-85bb-0359118bb75d_2880.avif",
      "https://hydraulic-cdn.com/productimages/8/9/7/1/5/1/6/8/1/6/6/4/1/0/8/3/5/7/7/0196b754-6cdd-729b-85bb-0359118bb75d_2880.avif",
    ],
    categoryId: "cat-electronics-computers-cpu",
    options: [],
    variants: [
      {
        id: "2-base",
        sku: "XEON-SILVER-4",
        options: {},
        price: "1053,00 €",
        available: true,
        images: [
          "https://hydraulic-cdn.com/productimages/8/9/7/1/5/1/6/8/1/6/6/4/1/0/8/3/5/7/7/0196b754-6cdd-729b-85bb-0359118bb75d_2880.avif",
        ],
      },
    ],
    defaultVariantId: "2-base",
  },
  {
    id: "3",
    name: "Intel Core i9-14900KS",
    price: "691,89 €",
    imageUrl:
      "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
    link: "#",
    available: true,
    shortDescription: [
      "High-performance processor",
      "Exceptional speed and efficiency",
      "Ideal for gaming and multitasking",
      "Supports advanced cooling solutions",
      "Compatible with latest motherboards",
    ],
    description:
      "The Intel Core i9-14900KS is a high-performance processor designed for enthusiasts and gamers, offering exceptional speed and efficiency.",
    images: [
      "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
      "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
    ],
    categoryId: "cat-electronics-computers-cpu",
    options: [],
    variants: [
      {
        id: "3-base",
        sku: "I9-14900KS-3",
        options: {},
        price: "691,89 €",
        available: true,
        images: [
          "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
        ],
      },
    ],
    defaultVariantId: "3-base",
  },
  {
    id: "4",
    name: "Intel Core i9-14900KS",
    price: "691,89 €",
    imageUrl:
      "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
    link: "#",
    available: true,
    shortDescription: [
      "High-performance processor",
      "Exceptional speed and efficiency",
      "Ideal for gaming and multitasking",
      "Supports advanced cooling solutions",
      "Compatible with latest motherboards",
    ],
    description:
      "The Intel Core i9-14900KS is a high-performance processor designed for enthusiasts and gamers, offering exceptional speed and efficiency.",
    images: [
      "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
      "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
    ],
    categoryId: "cat-electronics-computers-cpu",
    options: [],
    variants: [
      {
        id: "4-base",
        sku: "I9-14900KS-4",
        options: {},
        price: "691,89 €",
        available: true,
      },
    ],
    defaultVariantId: "4-base",
  },
  {
    id: "5",
    name: "Intel Xeon Silver 4",
    price: "1053,00 €",
    imageUrl:
      "https://hydraulic-cdn.com/productimages/8/9/7/1/5/1/6/8/1/6/6/4/1/0/8/3/5/7/7/0196b754-6cdd-729b-85bb-0359118bb75d_2880.avif",
    link: "#",
    available: false,
    shortDescription: [
      "High-performance processor",
      "Exceptional speed and efficiency",
      "Ideal for gaming and multitasking",
      "Supports advanced cooling solutions",
      "Compatible with latest motherboards",
    ],
    description:
      "The Intel Xeon Silver 4 is a powerful server-grade processor, ideal for data centers and enterprise applications, providing robust performance and reliability.",
    images: [
      "https://hydraulic-cdn.com/productimages/8/9/7/1/5/1/6/8/1/6/6/4/1/0/8/3/5/7/7/0196b754-6cdd-729b-85bb-0359118bb75d_2880.avif",
    ],
    categoryId: "cat-electronics-computers-cpu",
    options: [],
    variants: [
      {
        id: "5-base",
        sku: "XEON-SILVER-4-5",
        options: {},
        price: "1053,00 €",
        available: false,
      },
    ],
    defaultVariantId: "5-base",
  },
  {
    id: "6",
    name: "Intel Core i9-14900KS",
    price: "691,89 €",
    imageUrl:
      "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
    link: "#",
    available: true,
    shortDescription: [
      "High-performance processor",
      "Exceptional speed and efficiency",
      "Ideal for gaming and multitasking",
      "Supports advanced cooling solutions",
      "Compatible with latest motherboards",
    ],
    description:
      "The Intel Core i9-14900KS is a high-performance processor designed for enthusiasts and gamers, offering exceptional speed and efficiency.",
    images: [
      "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
    ],
    categoryId: "cat-electronics-computers-cpu",
    options: [],
    variants: [
      {
        id: "6-base",
        sku: "I9-14900KS-6",
        options: {},
        price: "691,89 €",
        available: true,
      },
    ],
    defaultVariantId: "6-base",
  },

  // ───────────────────────── iPhones (варианты по цвету и цене) ─────────────────────────
  {
    id: "7",
    name: "Apple iPhone 15 Pro 256GB",
    price: "1 299,00 €", // базовая цена (можно мин. из вариантов)
    imageUrl:
      "https://img-resizer.cyberport.de/cp/images/1368x1368/230914165059100301900268D",
    link: "#",
    available: true,
    shortDescription: [
      "A17 Pro chip",
      "Pro camera system",
      "Titanium design",
    ],
    description:
      "iPhone 15 Pro with A17 Pro, titanium design and pro camera system.",
    images: [
      "https://img-resizer.cyberport.de/cp/images/1368x1368/230914165059100301900268D",
    ],
    categoryId: "cat-electronics-phones-smartphones",
    attributes: [
      { code: "screen.diagonal", label: "Диагональ", value: 6.1, unit: "дюйм", group: "Дисплей" },
      { code: "battery.capacity", label: "Батарея", value: 3274, unit: "мА·ч", group: "Аккумулятор" },
      { code: "os", label: "ОС", value: "iOS", group: "Общее" },
    ],
    options: [
      { name: "Color", values: ["Black Titanium", "Blue Titanium"] },
    ],
    variants: [
      {
        id: "7-bt",
        sku: "IP15P-256-BLACK",
        options: { Color: "Black Titanium" },
        price: "1 299,00 €",
        compareAtPrice: "1 349,00 €",
        available: true,
        images: ["https://img-resizer.cyberport.de/cp/images/1368x1368/230914163450900301900002F", "https://img-resizer.cyberport.de/cp/images/1368x1368/230914163450900301900002F"],
        attributes: [{ code: "color", label: "Цвет", value: "Black Titanium", group: "Общее", priority: 10 }],
      },
      {
        id: "7-blue",
        sku: "IP15P-256-BLUE",
        options: { Color: "Blue Titanium" },
        price: "1 349,00 €",
        available: true,
        images: ["https://img-resizer.cyberport.de/cp/images/1368x1368/230914165059100301900268D", "https://img-resizer.cyberport.de/cp/images/1368x1368/230914165059100301900268D"],
        attributes: [{ code: "color", label: "Цвет", value: "Blue Titanium", group: "Общее", priority: 10 }],
      },
    ],
    defaultVariantId: "7-bt",
  },
  {
    id: "8",
    name: "Apple iPhone 15 128GB",
    price: "949,00 €",
    imageUrl:
      "https://img-resizer.cyberport.de/cp/images/1368x1368/230913130342000801900004M",
    link: "#",
    available: true,
    shortDescription: [
      "A16 Bionic chip",
      "Advanced dual-camera system",
      "Dynamic Island",
    ],
    description:
      "iPhone 15 with A16 Bionic and advanced dual-camera system.",
    images: [
      "https://img-resizer.cyberport.de/cp/images/1368x1368/230913130342000801900004M",
    ],
    categoryId: "cat-electronics-phones-smartphones",
    attributes: [
      { code: "screen.diagonal", label: "Диагональ", value: 6.1, unit: "дюйм", group: "Дисплей" },
      { code: "battery.capacity", label: "Батарея", value: 3349, unit: "мА·ч", group: "Аккумулятор" },
      { code: "os", label: "ОС", value: "iOS", group: "Общее" },
    ],
    options: [
      { name: "Color", values: ["Black", "Blue"] },
    ],
    variants: [
      {
        id: "8-black",
        sku: "IP15-128-BLACK",
        options: { Color: "Black" },
        price: "949,00 €",
        available: true,
        images: ["https://img-resizer.cyberport.de/cp/images/1368x1368/230913130342000801900004M"],
        attributes: [{ code: "color", label: "Цвет", value: "Black", group: "Общее", priority: 10 }],
      },
      {
        id: "8-blue",
        sku: "IP15-128-BLUE",
        options: { Color: "Blue" },
        price: "979,00 €",
        available: true,
        images: ["https://img-resizer.cyberport.de/cp/images/1368x1368/230913133549100801900264H"],
        attributes: [{ code: "color", label: "Цвет", value: "Blue", group: "Общее", priority: 10 }],
      },
    ],
    defaultVariantId: "8-black",
  },
];
