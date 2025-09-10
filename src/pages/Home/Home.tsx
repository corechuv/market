import "react"

import cls from './Home.module.scss'
import stylesBanner from './Banner.module.scss'
import ProductCarousel from "../../components/Product/ProductCarousel"
import ChevronRightIcon from "../../components/Icons/ChevronLeftIcon"

// import previewBanner from "@/assets/banners/grid.svg"

import Banner from "../../components/Banner"
import CategoryGrid from "../../components/CategoryGrid/CategoryGrid"

const products = [
    {
        id: "1",
        name: "Intel Core i9-14900KS",
        price: "691,89 €",
        imageUrl: "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
        link: "#"
    },
    {
        id: "2",
        name: "Intel Core i9-14900KS",
        price: "691,89 €",
        imageUrl: "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
        link: "#"
    },
    {
        id: "3",
        name: "Intel Core i9-14900KS",
        price: "691,89 €",
        imageUrl: "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
        link: "#"
    },
    {
        id: "4",
        name: "Intel Core i9-14900KS",
        price: "691,89 €",
        imageUrl: "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
        link: "#"
    },
    {
        id: "5",
        name: "Intel Core i9-14900KS",
        price: "691,89 €",
        imageUrl: "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
        link: "#"
    },
]

const bannerList = [
    {
        id: "1",
        imageUrl: "https://www.apple.com/v/iphone-17-pro/a/images/overview/cameras/photo/photographic_styles__boatmzba74ty_medium_2x.jpg",
        name: "",
        link: "#"
    },
    {
        id: "2",
        imageUrl: "https://www.apple.com/v/iphone-17-pro/a/images/overview/cameras/photo/night_mode__dksu23l8q2eu_medium_2x.jpg",
        name: "",
        link: "#"
    },
    {
        id: "3",
        imageUrl: "https://www.apple.com/v/iphone-17-pro/a/images/overview/accessories/case_techwoven__dxrkavb48rgy_medium_2x.jpg",
        name: "",
        link: "#"
    },
    {
        id: "4",
        imageUrl: "https://www.apple.com/v/iphone/home/ce/images/overview/consider/privacy__dd7zepyil6gm_medium_2x.jpg",
        name: "",
        link: "#"
    },
    {
        id: "5",
        imageUrl: "https://www.apple.com/v/iphone/home/ce/images/overview/consider/ios__02vczxaa3siu_medium_2x.jpg",
        name: "",
        link: "#"
    },
    {
        id: "6",
        imageUrl: "https://www.apple.com/v/iphone/home/ce/images/overview/consider/chip__6hy1uruuluaa_medium_2x.jpg",
        name: "",
        link: "#"
    },
];

const demoImages = [
    {
        src: "https://www.apple.com/v/iphone-17-pro/a/images/overview/highlights/highlights_apple_intelligence__bs20h6298f36_medium_2x.jpg",
        alt: "1",
        caption: "",
    },
    {
        src: "https://www.apple.com/v/iphone-17-pro/a/images/overview/highlights/highlights_design_endframe__flnga0hibmeu_large_2x.jpg",
        alt: "2",
        caption: "",
    },
    {
        src: "https://www.apple.com/v/iphone-17-pro/a/images/overview/highlights/highlights_ios__empnwsdz698i_large_2x.jpg",
        alt: "3",
        caption: "",
    },
];

const demo = [
  { id: "1", title: "IPhone",  color: "#EC4899", image: "https://www.apple.com/v/iphone-17-pro/a/images/overview/accessories/case_techwoven__dxrkavb48rgy_medium_2x.jpg" },
  { id: "2", title: "CPU", color: "#22D3EE", image: "https://www.apple.com/v/iphone-17-pro/a/images/overview/accessories/case_techwoven__dxrkavb48rgy_medium_2x.jpg" },
  { id: "3", title: "GPU", color: "#10B981", image: "https://www.apple.com/v/iphone-17-pro/a/images/overview/accessories/case_techwoven__dxrkavb48rgy_medium_2x.jpg" },
  { id: "4", title: "MacBook", color: "#F59E0B", image: "https://www.apple.com/v/iphone-17-pro/a/images/overview/accessories/case_techwoven__dxrkavb48rgy_medium_2x.jpg" },
  { id: "5", title: "Case", color: "#8B5CF6", image: "https://www.apple.com/v/iphone-17-pro/a/images/overview/accessories/case_techwoven__dxrkavb48rgy_medium_2x.jpg" },
];

export default function Home() {
    return (
        <div className="container">
            <div className={cls.homeContent}>
                <Banner
                    images={demoImages}
                    aspectRatio="3 / 1"
                    interval={4500}
                    autoPlay
                    loop
                    pauseOnHover
                    showControls
                    showDots
                    rounded
                    overlay="gradient"
                />
                <CategoryGrid
                    title="Популярные категории"
                    categories={demo}
                    onSelect={(cat) => console.log("Выбрано:", cat)}
                />
                <div className={stylesBanner.bannerGrid}>
                    {bannerList.map((banner) => (
                        <div key={banner.id} className={stylesBanner.bannerCard}>
                            <img src={banner.imageUrl} alt={banner.name} className={stylesBanner.bannerImage} />
                            <div className={stylesBanner.bannerInfo}>
                                <div className={stylesBanner.bannerTitle}>{banner.name}</div>
                                <button className={stylesBanner.bannerButton}>
                                    <ChevronRightIcon className={stylesBanner.icon} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <ProductCarousel products={products} label="Featured Products" />
            </div>
        </div>
    )
}