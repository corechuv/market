import "react"

import cls from './Home.module.scss'
import stylesBanner from './Banner.module.scss'
import ProductCarousel from "../../components/Product/ProductCarousel"
import ChevronRightIcon from "../../components/Icons/ChevronLeftIcon"

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
        imageUrl: "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
        name: "Intel Core i9-14900KS",
        link: "#"
    },
    {
        id: "2",
        imageUrl: "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
        name: "Intel Core i9-14900KS",
        link: "#"
    },
    {
        id: "3",
        imageUrl: "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
        name: "Intel Core i9-14900KS",
        link: "#"
    },
    {
        id: "4",
        imageUrl: "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
        name: "Intel Core i9-14900KS",
        link: "#"
    },
    {
        id: "5",
        imageUrl: "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
        name: "Intel Core i9-14900KS",
        link: "#"
    },
    {
        id: "6",
        imageUrl: "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
        name: "Intel Core i9-14900KS",
        link: "#"
    },
];

export default function Home() {
    return (
        <div className="container">
            <div className={cls.homeContent}>
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