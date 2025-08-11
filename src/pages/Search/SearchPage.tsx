import React, { useState } from "react"

import cls from '../Product/ProductList.module.scss'
import { useNavigate } from "react-router-dom"
import Modal from "../../components/Modal/Modal"
import ToggleViewSwitch, { type ViewMode } from "../../components/Product/ToggleViewSwitch"
import SortSelectContainer from "../../components/Product/SortSelectContainer"
import ProductItemList from "../../components/Product/ProductItemList"

import s from './SearchPage.module.scss';
import SidebarItems from "../../components/Product/SidebarItems"

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

const products = [
  {
    id: 1,
    name: "Intel Core i9-14900KS",
    price: "691,89 €",
    image: "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
    available: true,
  },
  {
    id: 2,
    name: "Intel Core i9-14900KS",
    price: "691,89 €",
    image: "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
    available: true,
  },
  {
    id: 3,
    name: "Intel Xeon Silver 4",
    price: "1053,00 €",
    image: "https://hydraulic-cdn.com/productimages/8/9/7/1/5/1/6/8/1/6/6/4/1/0/8/3/5/7/7/0196b754-6cdd-729b-85bb-0359118bb75d_2880.avif",
    available: true,
  },
  {
    id: 4,
    name: "Intel Xeon Silver 4",
    price: "1053,00 €",
    image: "https://hydraulic-cdn.com/productimages/8/9/7/1/5/1/6/8/1/6/6/4/1/0/8/3/5/7/7/0196b754-6cdd-729b-85bb-0359118bb75d_2880.avif",
    available: false,
  },
  {
    id: 5,
    name: "Intel Core i9-14900KS",
    price: "691,89 €",
    image: "https://hydraulic-cdn.com/productimages/2/7/1/7/0/6/7/1/8/2/5/6/0/4/8/9/9/4/6/0196ba1d-2878-713f-bcc9-b8e945c7bca2_2880.avif",
    available: true,
  },
  {
    id: 6,
    name: "Intel Xeon Silver 4",
    price: "1053,00 €",
    image: "https://hydraulic-cdn.com/productimages/8/9/7/1/5/1/6/8/1/6/6/4/1/0/8/3/5/7/7/0196b754-6cdd-729b-85bb-0359118bb75d_2880.avif",
    available: true,
  },
];

const sortOptions = [
  { value: 'price', label: 'Price: Low to high' },
  { value: '-price', label: 'Price: High to low' },
  { value: 'new', label: 'Newest arrivals' },
  { value: '-best', label: 'Best sellers' },
  { value: '-popular', label: 'Most popular' },
];

export default function SearchPage() {
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
