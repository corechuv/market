import React, { useMemo, useState } from "react"

import cls from './ProductsMain.module.scss'

import { useNavigate } from "react-router-dom"
import Modal from "../../components/Modal/Modal"
import ToggleViewSwitch, { type ViewMode } from "../../components/Product/ToggleViewSwitch"
import SortSelectContainer from "../../components/Product/SortSelectContainer"
import ProductItemList from "../../components/Product/ProductItemList"
import SidebarItems from "../../components/Product/SidebarItems"

import { getProducts } from "../../services/productService";

type ProductsMainProps = {
  query?: string;
};

const offerings = [
    { value: "discounted", label: "Discounted" },
    { value: "In stock", label: "In stock" },
];

const stars = [
    { value: "6", label: "Select all" },
    { value: "5", label: "" },
    { value: "4", label: "" },
    { value: "3", label: "" },
    { value: "2", label: "" },
    { value: "1", label: "" },
];

const sortOptions = [
    { value: 'price', label: 'Price: Low to high' },
    { value: '-price', label: 'Price: High to low' },
    { value: 'new', label: 'Newest arrivals' },
    { value: '-best', label: 'Best sellers' },
    { value: '-popular', label: 'Most popular' },
];

export default function ProductMain({ query = "" }: ProductsMainProps) {
    const products = useMemo(() => getProducts({ q: query }), [query]);

    const nav = useNavigate()

    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const [view, setView] = useState<ViewMode>('grid');

    const [sort, setSort] = useState<string>('name');

    const openModal = () => {
        setIsModalOpen(true);
    }

    return (
        <div className={cls.productListPage}>
            <SidebarItems
                variant="desktop"
                showSort={false}
                sort={sort}
                sortOptions={sortOptions}
                onChangeSort={(v) => {
                    setSort(v);
                }}
                offerings={offerings}
                stars={stars}
                priceRange={{ min: 0, max: 5000000, step: 50, defaultValue: [651650, 4493750] }}
                onResetFilters={() => console.log("Reset filters")}
            />
            <section className={cls.productListContent}>
                <div className={cls.productsHeader}>
                    <h4 className={cls.title}>CPU</h4>
                    <div className={cls.sortWrap}>
                        <SortSelectContainer
                            sort={sort}
                            sortOptions={sortOptions}
                            onChangeSort={setSort}
                        />
                    </div>
                </div>
                <div className={cls.productListActions}>
                    <ToggleViewSwitch view={view} onChangeView={setView} openModal={openModal} />
                </div>
                <ProductItemList
                    products={products}
                    view={view}
                    onItemClick={(p) => nav(`/product/${p.id}`)}
                />
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} variant="left" header="Filter" headerBorder={false}>
                    <SidebarItems
                        variant="modal"
                        showSort={true}
                        sort={sort}
                        sortOptions={sortOptions}
                        onChangeSort={(v) => {
                            setSort(v);
                        }}
                        offerings={offerings}
                        stars={stars}
                        priceRange={{ min: 0, max: 5000000, step: 50, defaultValue: [651650, 4493750] }}
                        onResetFilters={() => console.log("Reset filters")}
                    />
                </Modal>
            </section>
        </div>
    )
}
