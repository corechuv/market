import type { Category } from "../types/category";

const NOW = "2025-01-01T00:00:00.000Z";

export const categories: Category[] = [
  {
    id: "cat-electronics",
    name: "Электроника",
    slug: "electronics",
    fullSlug: "/electronics",
    description: "Вся потребительская электроника и гаджеты.",
    image: "/images/categories/electronics.jpg",
    icon: "DevicesIcon",
    parentId: null,
    isActive: true,
    sortOrder: 1,
    createdAt: NOW,
    updatedAt: NOW,
    children: [
      {
        id: "cat-electronics-computers",
        name: "Компьютеры и комплектующие",
        slug: "computers",
        fullSlug: "/electronics/computers",
        description: "ПК, ноутбуки, компоненты и периферия.",
        image: "/images/categories/computers.jpg",
        icon: "ComputerIcon",
        parentId: "cat-electronics",
        isActive: true,
        sortOrder: 1,
        createdAt: NOW,
        updatedAt: NOW,
        // третий уровень (листья каталога)
        children: [
          { id: "cat-electronics-computers-laptops", name: "Ноутбуки", slug: "laptops", fullSlug: "/electronics/computers/laptops", parentId: "cat-electronics-computers", icon: "LaptopIcon", isActive: true, sortOrder: 1, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-computers-desktops", name: "Настольные ПК", slug: "desktops", fullSlug: "/electronics/computers/desktops", parentId: "cat-electronics-computers", icon: "DesktopIcon", isActive: true, sortOrder: 2, createdAt: NOW, updatedAt: NOW },

          { id: "cat-electronics-computers-cpu", name: "Процессоры (CPU)", slug: "cpu", fullSlug: "/electronics/computers/cpu", parentId: "cat-electronics-computers", icon: "CpuIcon", isActive: true, sortOrder: 3, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-computers-gpu", name: "Видеокарты (GPU)", slug: "gpu", fullSlug: "/electronics/computers/gpu", parentId: "cat-electronics-computers", icon: "GpuIcon", isActive: true, sortOrder: 4, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-computers-motherboards", name: "Материнские платы", slug: "motherboards", fullSlug: "/electronics/computers/motherboards", parentId: "cat-electronics-computers", icon: "MotherboardIcon", isActive: true, sortOrder: 5, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-computers-ram", name: "Оперативная память (RAM)", slug: "ram", fullSlug: "/electronics/computers/ram", parentId: "cat-electronics-computers", icon: "RamIcon", isActive: true, sortOrder: 6, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-computers-storage", name: "Накопители (SSD/HDD)", slug: "storage", fullSlug: "/electronics/computers/storage", parentId: "cat-electronics-computers", icon: "StorageIcon", isActive: true, sortOrder: 7, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-computers-psu", name: "Блоки питания", slug: "psu", fullSlug: "/electronics/computers/psu", parentId: "cat-electronics-computers", icon: "PsuIcon", isActive: true, sortOrder: 8, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-computers-cases", name: "Корпуса", slug: "cases", fullSlug: "/electronics/computers/cases", parentId: "cat-electronics-computers", icon: "CaseIcon", isActive: true, sortOrder: 9, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-computers-cooling", name: "Охлаждение", slug: "cooling", fullSlug: "/electronics/computers/cooling", parentId: "cat-electronics-computers", icon: "CoolingIcon", isActive: true, sortOrder: 10, createdAt: NOW, updatedAt: NOW },

          { id: "cat-electronics-computers-monitors", name: "Мониторы", slug: "monitors", fullSlug: "/electronics/computers/monitors", parentId: "cat-electronics-computers", icon: "MonitorIcon", isActive: true, sortOrder: 11, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-computers-keyboards", name: "Клавиатуры", slug: "keyboards", fullSlug: "/electronics/computers/keyboards", parentId: "cat-electronics-computers", icon: "KeyboardIcon", isActive: true, sortOrder: 12, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-computers-mice", name: "Мыши", slug: "mice", fullSlug: "/electronics/computers/mice", parentId: "cat-electronics-computers", icon: "MouseIcon", isActive: true, sortOrder: 13, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-computers-headsets", name: "Наушники/Гарнитуры", slug: "headsets", fullSlug: "/electronics/computers/headsets", parentId: "cat-electronics-computers", icon: "HeadphonesIcon", isActive: true, sortOrder: 14, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-computers-webcams", name: "Веб-камеры", slug: "webcams", fullSlug: "/electronics/computers/webcams", parentId: "cat-electronics-computers", icon: "CameraIcon", isActive: true, sortOrder: 15, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-computers-microphones", name: "Микрофоны", slug: "microphones", fullSlug: "/electronics/computers/microphones", parentId: "cat-electronics-computers", icon: "MicIcon", isActive: true, sortOrder: 16, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-computers-ups", name: "ИБП (UPS)", slug: "ups", fullSlug: "/electronics/computers/ups", parentId: "cat-electronics-computers", icon: "UpsIcon", isActive: true, sortOrder: 17, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-computers-software", name: "ОС и ПО", slug: "software", fullSlug: "/electronics/computers/software", parentId: "cat-electronics-computers", icon: "SoftwareIcon", isActive: true, sortOrder: 18, createdAt: NOW, updatedAt: NOW }
        ]
      },

      {
        id: "cat-electronics-phones-tablets",
        name: "Смартфоны и планшеты",
        slug: "phones-tablets",
        fullSlug: "/electronics/phones-tablets",
        description: "Смартфоны, планшеты и аксессуары.",
        image: "/images/categories/phones.jpg",
        icon: "PhoneIcon",
        parentId: "cat-electronics",
        isActive: true,
        sortOrder: 2,
        createdAt: NOW,
        updatedAt: NOW,
        children: [
          { id: "cat-electronics-phones-smartphones", name: "Смартфоны", slug: "smartphones", fullSlug: "/electronics/phones-tablets/smartphones", parentId: "cat-electronics-phones-tablets", icon: "PhoneIcon", isActive: true, sortOrder: 1, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-phones-tablets-2", name: "Планшеты", slug: "tablets", fullSlug: "/electronics/phones-tablets/tablets", parentId: "cat-electronics-phones-tablets", icon: "TabletIcon", isActive: true, sortOrder: 2, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-phones-ereaders", name: "Электронные книги", slug: "e-readers", fullSlug: "/electronics/phones-tablets/e-readers", parentId: "cat-electronics-phones-tablets", icon: "EreaderIcon", isActive: true, sortOrder: 3, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-phones-power", name: "Power Bank и зарядки", slug: "power-banks-chargers", fullSlug: "/electronics/phones-tablets/power-banks-chargers", parentId: "cat-electronics-phones-tablets", icon: "ChargeIcon", isActive: true, sortOrder: 4, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-phones-cases", name: "Чехлы и стекла", slug: "cases-protectors", fullSlug: "/electronics/phones-tablets/cases-protectors", parentId: "cat-electronics-phones-tablets", icon: "CaseIcon", isActive: true, sortOrder: 5, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-phones-cables", name: "Кабели и адаптеры", slug: "cables-adapters", fullSlug: "/electronics/phones-tablets/cables-adapters", parentId: "cat-electronics-phones-tablets", icon: "CableIcon", isActive: true, sortOrder: 6, createdAt: NOW, updatedAt: NOW }
        ]
      },

      {
        id: "cat-electronics-tv-home-theater",
        name: "ТВ и мультимедиа",
        slug: "tv-home-theater",
        fullSlug: "/electronics/tv-home-theater",
        image: "/images/categories/tv.jpg",
        icon: "TvIcon",
        parentId: "cat-electronics",
        isActive: true,
        sortOrder: 3,
        createdAt: NOW,
        updatedAt: NOW,
        children: [
          { id: "cat-electronics-tv-televisions", name: "Телевизоры", slug: "tvs", fullSlug: "/electronics/tv-home-theater/tvs", parentId: "cat-electronics-tv-home-theater", icon: "TvIcon", isActive: true, sortOrder: 1, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-tv-projectors", name: "Проекторы", slug: "projectors", fullSlug: "/electronics/tv-home-theater/projectors", parentId: "cat-electronics-tv-home-theater", icon: "ProjectorIcon", isActive: true, sortOrder: 2, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-tv-streaming", name: "ТВ-приставки", slug: "streaming-devices", fullSlug: "/electronics/tv-home-theater/streaming-devices", parentId: "cat-electronics-tv-home-theater", icon: "StreamingIcon", isActive: true, sortOrder: 3, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-tv-soundbars", name: "Саундбары", slug: "soundbars", fullSlug: "/electronics/tv-home-theater/soundbars", parentId: "cat-electronics-tv-home-theater", icon: "SoundbarIcon", isActive: true, sortOrder: 4, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-tv-mounts", name: "Кронштейны и крепления", slug: "mounts", fullSlug: "/electronics/tv-home-theater/mounts", parentId: "cat-electronics-tv-home-theater", icon: "MountIcon", isActive: true, sortOrder: 5, createdAt: NOW, updatedAt: NOW }
        ]
      },

      {
        id: "cat-electronics-audio",
        name: "Аудио",
        slug: "audio",
        fullSlug: "/electronics/audio",
        icon: "AudioIcon",
        parentId: "cat-electronics",
        isActive: true,
        sortOrder: 4,
        createdAt: NOW,
        updatedAt: NOW,
        children: [
          { id: "cat-electronics-audio-headphones", name: "Наушники", slug: "headphones", fullSlug: "/electronics/audio/headphones", parentId: "cat-electronics-audio", icon: "HeadphonesIcon", isActive: true, sortOrder: 1, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-audio-speakers", name: "Колонки", slug: "speakers", fullSlug: "/electronics/audio/speakers", parentId: "cat-electronics-audio", icon: "SpeakerIcon", isActive: true, sortOrder: 2, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-audio-dac-amp", name: "ЦАП/усилители", slug: "dac-amp", fullSlug: "/electronics/audio/dac-amp", parentId: "cat-electronics-audio", icon: "AmpIcon", isActive: true, sortOrder: 3, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-audio-portable", name: "Портативное аудио", slug: "portable-audio", fullSlug: "/electronics/audio/portable-audio", parentId: "cat-electronics-audio", icon: "PortableIcon", isActive: true, sortOrder: 4, createdAt: NOW, updatedAt: NOW }
        ]
      },

      {
        id: "cat-electronics-gaming",
        name: "Игры и консоли",
        slug: "gaming",
        fullSlug: "/electronics/gaming",
        icon: "GamepadIcon",
        parentId: "cat-electronics",
        isActive: true,
        sortOrder: 5,
        createdAt: NOW,
        updatedAt: NOW,
        children: [
          { id: "cat-electronics-gaming-consoles", name: "Игровые приставки", slug: "consoles", fullSlug: "/electronics/gaming/consoles", parentId: "cat-electronics-gaming", icon: "ConsoleIcon", isActive: true, sortOrder: 1, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-gaming-games", name: "Игры", slug: "games", fullSlug: "/electronics/gaming/games", parentId: "cat-electronics-gaming", icon: "GameIcon", isActive: true, sortOrder: 2, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-gaming-controllers", name: "Геймпады и рули", slug: "controllers", fullSlug: "/electronics/gaming/controllers", parentId: "cat-electronics-gaming", icon: "ControllerIcon", isActive: true, sortOrder: 3, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-gaming-vr", name: "VR-шлемы", slug: "vr", fullSlug: "/electronics/gaming/vr", parentId: "cat-electronics-gaming", icon: "VrIcon", isActive: true, sortOrder: 4, createdAt: NOW, updatedAt: NOW }
        ]
      },

      {
        id: "cat-electronics-photo-video",
        name: "Фото и видео",
        slug: "photo-video",
        fullSlug: "/electronics/photo-video",
        icon: "CameraIcon",
        parentId: "cat-electronics",
        isActive: true,
        sortOrder: 6,
        createdAt: NOW,
        updatedAt: NOW,
        children: [
          { id: "cat-electronics-photo-cameras", name: "Фотоаппараты", slug: "cameras", fullSlug: "/electronics/photo-video/cameras", parentId: "cat-electronics-photo-video", icon: "CameraIcon", isActive: true, sortOrder: 1, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-photo-lenses", name: "Объективы", slug: "lenses", fullSlug: "/electronics/photo-video/lenses", parentId: "cat-electronics-photo-video", icon: "LensIcon", isActive: true, sortOrder: 2, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-photo-action", name: "Экшн-камеры", slug: "action-cameras", fullSlug: "/electronics/photo-video/action-cameras", parentId: "cat-electronics-photo-video", icon: "ActionCamIcon", isActive: true, sortOrder: 3, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-photo-drones", name: "Дроны", slug: "drones", fullSlug: "/electronics/photo-video/drones", parentId: "cat-electronics-photo-video", icon: "DroneIcon", isActive: true, sortOrder: 4, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-photo-lighting", name: "Свет и штативы", slug: "lighting-tripods", fullSlug: "/electronics/photo-video/lighting-tripods", parentId: "cat-electronics-photo-video", icon: "LightIcon", isActive: true, sortOrder: 5, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-photo-memory", name: "Карты памяти", slug: "memory-cards", fullSlug: "/electronics/photo-video/memory-cards", parentId: "cat-electronics-photo-video", icon: "SdCardIcon", isActive: true, sortOrder: 6, createdAt: NOW, updatedAt: NOW }
        ]
      },

      {
        id: "cat-electronics-wearables",
        name: "Носимая электроника",
        slug: "wearables",
        fullSlug: "/electronics/wearables",
        icon: "WatchIcon",
        parentId: "cat-electronics",
        isActive: true,
        sortOrder: 7,
        createdAt: NOW,
        updatedAt: NOW,
        children: [
          { id: "cat-electronics-wearables-watches", name: "Смарт-часы", slug: "smartwatches", fullSlug: "/electronics/wearables/smartwatches", parentId: "cat-electronics-wearables", icon: "WatchIcon", isActive: true, sortOrder: 1, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-wearables-bands", name: "Фитнес-браслеты", slug: "fitness-bands", fullSlug: "/electronics/wearables/fitness-bands", parentId: "cat-electronics-wearables", icon: "BandIcon", isActive: true, sortOrder: 2, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-wearables-accessories", name: "Ремешки и аксессуары", slug: "straps-accessories", fullSlug: "/electronics/wearables/straps-accessories", parentId: "cat-electronics-wearables", icon: "StrapIcon", isActive: true, sortOrder: 3, createdAt: NOW, updatedAt: NOW }
        ]
      },

      {
        id: "cat-electronics-smart-home",
        name: "Умный дом",
        slug: "smart-home",
        fullSlug: "/electronics/smart-home",
        icon: "HomeIcon",
        parentId: "cat-electronics",
        isActive: true,
        sortOrder: 8,
        createdAt: NOW,
        updatedAt: NOW,
        children: [
          { id: "cat-electronics-smart-bulbs", name: "Умные лампочки", slug: "smart-bulbs", fullSlug: "/electronics/smart-home/smart-bulbs", parentId: "cat-electronics-smart-home", icon: "BulbIcon", isActive: true, sortOrder: 1, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-smart-plugs", name: "Розетки и реле", slug: "smart-plugs", fullSlug: "/electronics/smart-home/smart-plugs", parentId: "cat-electronics-smart-home", icon: "PlugIcon", isActive: true, sortOrder: 2, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-smart-sensors", name: "Датчики", slug: "sensors", fullSlug: "/electronics/smart-home/sensors", parentId: "cat-electronics-smart-home", icon: "SensorIcon", isActive: true, sortOrder: 3, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-smart-cameras", name: "Камеры наблюдения", slug: "cameras", fullSlug: "/electronics/smart-home/cameras", parentId: "cat-electronics-smart-home", icon: "CctvIcon", isActive: true, sortOrder: 4, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-smart-hubs", name: "Хабы и шлюзы", slug: "hubs", fullSlug: "/electronics/smart-home/hubs", parentId: "cat-electronics-smart-home", icon: "HubIcon", isActive: true, sortOrder: 5, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-smart-thermostats", name: "Термостаты", slug: "thermostats", fullSlug: "/electronics/smart-home/thermostats", parentId: "cat-electronics-smart-home", icon: "ThermostatIcon", isActive: true, sortOrder: 6, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-smart-robots", name: "Роботы-пылесосы", slug: "robot-vacuums", fullSlug: "/electronics/smart-home/robot-vacuums", parentId: "cat-electronics-smart-home", icon: "RobotVacIcon", isActive: true, sortOrder: 7, createdAt: NOW, updatedAt: NOW }
        ]
      },

      {
        id: "cat-electronics-networking",
        name: "Сети и интернет",
        slug: "networking",
        fullSlug: "/electronics/networking",
        icon: "RouterIcon",
        parentId: "cat-electronics",
        isActive: true,
        sortOrder: 9,
        createdAt: NOW,
        updatedAt: NOW,
        children: [
          { id: "cat-electronics-net-routers", name: "Маршрутизаторы", slug: "routers", fullSlug: "/electronics/networking/routers", parentId: "cat-electronics-networking", icon: "RouterIcon", isActive: true, sortOrder: 1, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-net-mesh", name: "Mesh-системы", slug: "mesh", fullSlug: "/electronics/networking/mesh", parentId: "cat-electronics-networking", icon: "MeshIcon", isActive: true, sortOrder: 2, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-net-switches", name: "Коммутаторы", slug: "switches", fullSlug: "/electronics/networking/switches", parentId: "cat-electronics-networking", icon: "SwitchIcon", isActive: true, sortOrder: 3, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-net-access-points", name: "Точки доступа", slug: "access-points", fullSlug: "/electronics/networking/access-points", parentId: "cat-electronics-networking", icon: "ApsIcon", isActive: true, sortOrder: 4, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-net-adapters", name: "Сетевые адаптеры", slug: "adapters", fullSlug: "/electronics/networking/adapters", parentId: "cat-electronics-networking", icon: "NicIcon", isActive: true, sortOrder: 5, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-net-nas", name: "NAS-хранилища", slug: "nas", fullSlug: "/electronics/networking/nas", parentId: "cat-electronics-networking", icon: "NasIcon", isActive: true, sortOrder: 6, createdAt: NOW, updatedAt: NOW }
        ]
      },

      {
        id: "cat-electronics-print-scan",
        name: "Печать и сканирование",
        slug: "print-scan",
        fullSlug: "/electronics/print-scan",
        icon: "PrinterIcon",
        parentId: "cat-electronics",
        isActive: true,
        sortOrder: 10,
        createdAt: NOW,
        updatedAt: NOW,
        children: [
          { id: "cat-electronics-print-printers", name: "Принтеры", slug: "printers", fullSlug: "/electronics/print-scan/printers", parentId: "cat-electronics-print-scan", icon: "PrinterIcon", isActive: true, sortOrder: 1, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-print-toners", name: "Картриджи и тонеры", slug: "inks-toners", fullSlug: "/electronics/print-scan/inks-toners", parentId: "cat-electronics-print-scan", icon: "TonerIcon", isActive: true, sortOrder: 2, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-print-scanners", name: "Сканеры", slug: "scanners", fullSlug: "/electronics/print-scan/scanners", parentId: "cat-electronics-print-scan", icon: "ScannerIcon", isActive: true, sortOrder: 3, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-print-label", name: "Этикет-принтеры", slug: "label-printers", fullSlug: "/electronics/print-scan/label-printers", parentId: "cat-electronics-print-scan", icon: "LabelIcon", isActive: true, sortOrder: 4, createdAt: NOW, updatedAt: NOW }
        ]
      },

      {
        id: "cat-electronics-storage-media",
        name: "Накопители и носители",
        slug: "storage-media",
        fullSlug: "/electronics/storage-media",
        icon: "DriveIcon",
        parentId: "cat-electronics",
        isActive: true,
        sortOrder: 11,
        createdAt: NOW,
        updatedAt: NOW,
        children: [
          { id: "cat-electronics-storage-ext-ssd", name: "Внешние SSD", slug: "external-ssd", fullSlug: "/electronics/storage-media/external-ssd", parentId: "cat-electronics-storage-media", icon: "SsdIcon", isActive: true, sortOrder: 1, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-storage-ext-hdd", name: "Внешние HDD", slug: "external-hdd", fullSlug: "/electronics/storage-media/external-hdd", parentId: "cat-electronics-storage-media", icon: "HddIcon", isActive: true, sortOrder: 2, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-storage-usb", name: "USB-флешки", slug: "usb-flash", fullSlug: "/electronics/storage-media/usb-flash", parentId: "cat-electronics-storage-media", icon: "UsbIcon", isActive: true, sortOrder: 3, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-storage-sd", name: "Карты SD/microSD", slug: "sd-cards", fullSlug: "/electronics/storage-media/sd-cards", parentId: "cat-electronics-storage-media", icon: "SdCardIcon", isActive: true, sortOrder: 4, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-storage-enclosures", name: "Корпуса для дисков", slug: "drive-enclosures", fullSlug: "/electronics/storage-media/drive-enclosures", parentId: "cat-electronics-storage-media", icon: "EnclosureIcon", isActive: true, sortOrder: 5, createdAt: NOW, updatedAt: NOW }
        ]
      },

      {
        id: "cat-electronics-accessories",
        name: "Аксессуары",
        slug: "accessories",
        fullSlug: "/electronics/accessories",
        icon: "AccessoriesIcon",
        parentId: "cat-electronics",
        isActive: true,
        sortOrder: 12,
        createdAt: NOW,
        updatedAt: NOW,
        children: [
          { id: "cat-electronics-acc-cables", name: "Кабели", slug: "cables", fullSlug: "/electronics/accessories/cables", parentId: "cat-electronics-accessories", icon: "CableIcon", isActive: true, sortOrder: 1, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-acc-chargers", name: "Зарядные устройства", slug: "chargers", fullSlug: "/electronics/accessories/chargers", parentId: "cat-electronics-accessories", icon: "ChargerIcon", isActive: true, sortOrder: 2, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-acc-adapters", name: "Переходники и док-станции", slug: "adapters-docks", fullSlug: "/electronics/accessories/adapters-docks", parentId: "cat-electronics-accessories", icon: "AdapterIcon", isActive: true, sortOrder: 3, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-acc-power", name: "Сетевые фильтры/удлинители", slug: "power-strips", fullSlug: "/electronics/accessories/power-strips", parentId: "cat-electronics-accessories", icon: "PowerStripIcon", isActive: true, sortOrder: 4, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-acc-bags", name: "Рюкзаки и чехлы", slug: "bags-cases", fullSlug: "/electronics/accessories/bags-cases", parentId: "cat-electronics-accessories", icon: "BagIcon", isActive: true, sortOrder: 5, createdAt: NOW, updatedAt: NOW },
          { id: "cat-electronics-acc-cleaning", name: "Чистящие средства", slug: "cleaning", fullSlug: "/electronics/accessories/cleaning", parentId: "cat-electronics-accessories", icon: "CleanIcon", isActive: true, sortOrder: 6, createdAt: NOW, updatedAt: NOW }
        ]
      }
    ]
  }
];
