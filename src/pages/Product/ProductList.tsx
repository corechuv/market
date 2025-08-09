import { useState } from "react"

import cls from './ProductList.module.scss'
import { useNavigate } from "react-router-dom"
import Modal from "../../components/Modal/Modal"
import React from "react"
import Button from "../../components/Buttons/Button"
import CheckboxGroup from "../../components/Product/CheckboxGroup"
import ToggleViewSwitch, { type ViewMode } from "../../components/Product/ToggleViewSwitch"
import PriceRangeDual from "../../components/Product/PriceRangeDual"
import Stars from "../../components/Product/Stars"
import Accordion from "../../components/Product/Accordion"
import SortSelectContainer from "../../components/Product/SortSelectContainer"

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

export default function ProductList() {
  const nav = useNavigate()

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const [view, setView] = useState<ViewMode>('grid');

  const [sort, setSort] = useState<string>('name');

  const openModal = () => {
    setIsModalOpen(true);
    console.log("Modal opened");
  }

  return (
    <div className={cls.productListPage}>
      <div className={cls.sidebar}>
        <Accordion title="PC Components" defaultOpen>
          <ul className={cls.sidebar__list}>
            <li className={cls.sidebar__item} onClick={() => nav('/product/cpu')}>CPU
              <ul className={cls.sidebar__sublist}>
                <li className={cls.sidebar__subitem} onClick={() => nav('/product/cpu/i9-14900ks')}>i9-14900KS</li>
                <li className={cls.sidebar__subitem} onClick={() => nav('/product/cpu/xeon-silver-4')}>Xeon Silver 4</li>
              </ul>
            </li>
            <li className={cls.sidebar__item} onClick={() => nav('/product/gpu')}>GPU</li>
            <li className={cls.sidebar__item} onClick={() => nav('/product/ram')}>RAM</li>
            <li className={cls.sidebar__item} onClick={() => nav('/product/storage')}>Storage</li>
            <li className={cls.sidebar__item} onClick={() => nav('/product/motherboard')}>Motherboard</li>
            <li className={cls.sidebar__item} onClick={() => nav('/product/power-supply')}>Power Supply</li>
            <li className={cls.sidebar__item} onClick={() => nav('/product/cooling')}>Cooling</li>
            <li className={cls.sidebar__item} onClick={() => nav('/product/cases')}>Cases</li>
            <li className={cls.sidebar__item} onClick={() => nav('/product/peripherals')}>Peripherals</li>
          </ul>
        </Accordion>
        <Accordion title="Price" defaultOpen>
          <PriceRangeDual
            min={0}
            max={5000000}
            step={1}
            defaultValue={[651650, 4493750]}
          />
        </Accordion>
        <Accordion title="Offer" defaultOpen>
          <CheckboxGroup
            options={offerings}
            defaultValue={[""]}
            onChange={(vals) => console.log("Selected:", vals)}
            direction="vertical"
          />
        </Accordion>
        <Accordion title="Rating" defaultOpen>
          <CheckboxGroup
            options={stars}
            defaultValue={[""]}
            onChange={(vals) => console.log("Selected:", vals)}
            direction="vertical"
            contentRenderer={(option) =>
              option.value === "6" ? null : <Stars size={16} value={Number(option.value)} />
            }
          />
        </Accordion>
        <Button className={cls.resetButton} size="small">Reset filters</Button>
      </div>
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
          <Button onClick={openModal} className={cls.sortButton} size="small">Filter</Button>
          <ToggleViewSwitch view={view} onChangeView={setView} />
        </div>
        <div className={cls.productList}>
          <div className={view === 'grid' ? cls.grid : cls.list}>
            {products.map(product => (
              <div key={product.id} className={`${cls.productItem} ${view === 'list' ? cls.itemList : cls.itemGrid}`} onClick={() => nav(`/product/${product.id}`)}>
                <img src={product.image} alt={product.name} className={cls.productImage} />
                <div className={cls.productDetails}>
                  <h2 className={cls.productName}>{product.name}</h2>
                  <div className={cls.productPrice}>{product.price}</div>
                  <div className={cls.available}>
                    <span className={product.available ? cls.inStock : cls.outOfStock}></span>
                    <span className={product.available ? cls.inStockText : cls.outOfStockText}>{product.available ? "In Stock" : "Out of Stock"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} variant="left" header="Sort & Filter">
          <div className={cls.filterContainer}>
            <div className={cls.sidebar}>
              <Accordion title="PC Components" defaultOpen>
                <ul className={cls.sidebar__list}>
                  <li className={cls.sidebar__item} onClick={() => nav('/product/cpu')}>CPU
                    <ul className={cls.sidebar__sublist}>
                      <li className={cls.sidebar__subitem} onClick={() => nav('/product/cpu/i9-14900ks')}>i9-14900KS</li>
                      <li className={cls.sidebar__subitem} onClick={() => nav('/product/cpu/xeon-silver-4')}>Xeon Silver 4</li>
                    </ul>
                  </li>
                  <li className={cls.sidebar__item} onClick={() => nav('/product/gpu')}>GPU</li>
                  <li className={cls.sidebar__item} onClick={() => nav('/product/ram')}>RAM</li>
                  <li className={cls.sidebar__item} onClick={() => nav('/product/storage')}>Storage</li>
                  <li className={cls.sidebar__item} onClick={() => nav('/product/motherboard')}>Motherboard</li>
                  <li className={cls.sidebar__item} onClick={() => nav('/product/power-supply')}>Power Supply</li>
                  <li className={cls.sidebar__item} onClick={() => nav('/product/cooling')}>Cooling</li>
                  <li className={cls.sidebar__item} onClick={() => nav('/product/cases')}>Cases</li>
                  <li className={cls.sidebar__item} onClick={() => nav('/product/peripherals')}>Peripherals</li>
                </ul>
              </Accordion>
              <Accordion title="Price" defaultOpen>
                <PriceRangeDual
                  min={0}
                  max={5000000}
                  step={50}
                  defaultValue={[651650, 4493750]}
                />
              </Accordion>
              <Accordion title="Offer" defaultOpen>
                <CheckboxGroup
                  options={offerings}
                  defaultValue={[""]}
                  onChange={(vals) => console.log("Selected:", vals)}
                  direction="vertical"
                />
              </Accordion>
              <Accordion title="Rating" defaultOpen>
                <CheckboxGroup
                  options={stars}
                  defaultValue={[""]}
                  onChange={(vals) => console.log("Selected:", vals)}
                  direction="vertical"
                  contentRenderer={(option) =>
                    option.value === "6" ? null : <Stars size={16} value={Number(option.value)} />
                  }
                />
              </Accordion>
            </div>
          </div>
        </Modal>
      </section>
    </div>
  )
}
