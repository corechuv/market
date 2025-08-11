import React from "react";
import { getProductById, getMoreProducts } from "../../services/productService";
import cls from './ProductPage.module.scss'

import ProductImages from "../../components/Product/ProductImages";
import Button from "../../components/Buttons/Button";
import Modal from "../../components/Modal/Modal";
import ReviewList from "../../components/Product/ReviewList";
import ReviewForm from "../../components/Product/ReviewForm";
import ProductCarousel from "../../components/Product/ProductCarousel";
import ChevronRightIcon from "../../components/Icons/ChevronLeftIcon";
import { useNavigate, useParams } from "react-router-dom";

const DEFAULT_IMAGES = [
    "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
    "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
    "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
    "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
    "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
];

const reviews = [
    {
        id: "1",
        reviewerName: "John Doe",
        reviewDate: "2023-10-01",
        rating: 5,
        text: "Amazing product! Highly recommend. 🚀🔥",
    },
    {
        id: "2",
        reviewerName: "Jane Smith",
        reviewDate: "2023-10-02",
        rating: 4,
        text: "Very good quality, but a bit expensive. 💸👍",
    },
    {
        id: "3",
        reviewerName: "Alice Johnson",
        reviewDate: "2023-10-03",
        rating: 3,
        text: "Average performance, expected more. 🤔",
    },
    {
        id: "4",
        reviewerName: "Bob Lee",
        reviewDate: "2023-10-04",
        rating: 5,
        text: "Super fast and reliable! Perfect for gaming. 🎮💯",
    },
    {
        id: "5",
        reviewerName: "Maria Garcia",
        reviewDate: "2023-10-05",
        rating: 4,
        text: "Works well for my needs, installation was easy. 🛠️😊",
    },
    {
        id: "6",
        reviewerName: "Chen Wei",
        reviewDate: "2023-10-06",
        rating: 2,
        text: "Had some issues with overheating. 😕🌡️",
    },
    {
        id: "7",
        reviewerName: "Elena Petrova",
        reviewDate: "2023-10-07",
        rating: 5,
        text: "Exceeded my expectations! Would buy again. ⭐⭐⭐⭐⭐",
    },
    {
        id: "8",
        reviewerName: "Liam O'Brien",
        reviewDate: "2023-10-08",
        rating: 4,
        text: "Solid processor, but fan gets noisy. 🌀🔊",
    },
    {
        id: "9",
        reviewerName: "Sofia Rossi",
        reviewDate: "2023-10-09",
        rating: 3,
        text: "Not bad, but not the best for the price. 💵🤷‍♀️",
    },
    {
        id: "10",
        reviewerName: "Akira Tanaka",
        reviewDate: "2023-10-10",
        rating: 5,
        text: "Handles multitasking like a champ! 🏆💻",
    },
    {
        id: "11",
        reviewerName: "Lucas Müller",
        reviewDate: "2023-10-11",
        rating: 4,
        text: "Good value, fast shipping. 🚚👍",
    },
    {
        id: "12",
        reviewerName: "Fatima Al-Farsi",
        reviewDate: "2023-10-12",
        rating: 5,
        text: "Perfect for my workstation. Highly satisfied! 😍🖥️",
    }
];

export default function ProductPage() {

    const { productId } = useParams<{ productId: string }>();

    const product = getProductById(String(productId));
    const moreProducts = getMoreProducts(product?.id);

    const nav = useNavigate();

    const [isOpen, setIsOpen] = React.useState(false);

    if (!product) {
        return (
            <div className="container">
                <div className={cls.product}>
                    <div className={cls.productCategory}>
                        <span className={cls.productCategory__link} onClick={() => nav('/')}>Home</span>
                        <ChevronRightIcon className={cls.productCategory__icon} />
                        <span className={cls.productCategory__link} onClick={() => nav(-1)}>PC Components</span>
                        <ChevronRightIcon className={cls.productCategory__icon} />
                        <span className={cls.productCategory__link} onClick={() => nav(-1)}>Processors</span>
                    </div>
                    <h2>Товар не найден</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className={cls.product}>
                <div className={cls.productCategory}>
                    <span className={cls.productCategory__link} onClick={() => nav('/')}>Home</span>
                    <ChevronRightIcon className={cls.productCategory__icon} />
                    <span className={cls.productCategory__link} onClick={() => nav(-1)}>PC Components</span>
                    <ChevronRightIcon className={cls.productCategory__icon} />
                    <span className={cls.productCategory__link} onClick={() => nav(-1)}>Processors</span>
                </div>
                <div className={cls.productDetails}>
                    <ProductImages images={DEFAULT_IMAGES} />
                    <div className={cls.productInfo}>
                        <div className={cls.productTitle}>
                            <h1 className={cls.productName}>{product.name}</h1>
                            <div className={cls.productPrice}>{product.price}
                                <div className={cls.available}>
                                    <span className={product.available ? cls.inStock : cls.outOfStock} />
                                    <span className={product.available ? cls.inStockText : cls.outOfStockText}>
                                        {product.available ? "In Stock" : "Out of Stock"}
                                    </span>
                                </div>
                            </div>
                            <div className={cls.productVat}>
                                <span>VAT included</span>
                            </div>
                            <div className={cls.productDelivery}>
                                <span>Delivery: <span className={cls.deliveryTime}>3-5</span> business days</span>
                            </div>
                        </div>
                        <div className={cls.productActions}>
                            <Button className={`${cls.addToCart}`} size="small">Add to Cart</Button>
                            <Button className={`${cls.buyNow}`} size="small">Buy Now</Button>
                        </div>
                    </div>
                    <div className={cls.productDescription}>
                        <h3 className={cls.descriptionTitle}>Description</h3>
                        <p>
                            The Intel Core Ultra 7 Desktop 265K LGA 1851 is a cutting-edge processor designed for enthusiasts and professionals. Featuring multiple high-efficiency cores, advanced AI acceleration, and support for the latest DDR5 memory, it delivers outstanding performance for gaming, content creation, and multitasking. With improved thermal management and integrated graphics, this processor ensures smooth operation even under heavy workloads.
                        </p>
                    </div>
                    <div className={cls.productReviews}>
                        <h3 className={cls.reviewsTitle}>Reviews</h3>
                        <div className={cls.reviewsHeader}>
                            <div>
                                <div className={cls.reviewCount}>4.5 <span className={cls.reviewCountText}>(120 reviews)</span></div>
                            </div>
                            <div className={cls.reviewActions}>
                                <Button className={cls.openReviewButton} onClick={() => setIsOpen(true)} size="small">Open Reviews</Button>
                            </div>
                        </div>
                    </div>
                    <ProductCarousel products={moreProducts} label="More Products" />
                </div>
            </div>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} variant="right" header="Reviews" headerBorder={false}>
                <div className={cls.reviewsContent}>
                    <ReviewForm />
                    <ReviewList reviews={reviews} className={cls.reviewList} />
                </div>
            </Modal>
        </div>
    )
}