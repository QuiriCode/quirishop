import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import clsx from "clsx";
import Swiper, { SwiperSlide } from "../../components/swiper";
import SectionTitle from "../../components/section-title/SectionTitle";
import ProductGridSingle from "../../components/product/ProductGridSingle";
import { getProducts } from "../../helpers/product";
import Api from '../../Api'; 

const settings = {
  loop: false,
  slidesPerView: 4,
  grabCursor: true,
  spaceBetween: 30,
  breakpoints: {
    320: {
      slidesPerView: 1
    },
    576: {
      slidesPerView: 2
    },
    768: {
      slidesPerView: 3
    },
    1024: {
      slidesPerView: 4
    }
  }
};

const RelatedProductSlider = ({ spaceBottomClass, category }) => {
  const [products, setProducts] = useState([]);
  const api = new Api();
  const currency = useSelector((state) => state.currency);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
  const compareItems = useSelector((state) => state.compare.compareItems);
  const prods = getProducts(products.products, category, null, 6);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.getProductsByCategory(category);
        if (response && response.products) {
          setProducts(response.products);
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
      }
    };

    fetchProducts();
  }, [category]);

  // Assuming 'getProductsByCategory' is a method in your API class that fetches products based on category

  return (
    <div className={clsx("related-product-area", spaceBottomClass)}>
      <div className="container">
        <SectionTitle
          titleText="Related Products"
          positionClass="text-center"
          spaceClass="mb-50"
        />
        {products.length ? (
          <Swiper options={settings}>
              {products.map(product => (
                <SwiperSlide key={product.id}>
                  <ProductGridSingle
                    product={product}
                    currency={currency}
                    cartItem={
                      cartItems.find((cartItem) => cartItem.id == product.id)
                    }
                    wishlistItem={
                      wishlistItems.find(
                        (wishlistItem) => wishlistItem.id == product.id
                      )
                    }
                    compareItem={
                      compareItems.find(
                        (compareItem) => compareItem.id == product.id
                      )
                    }
                  />
                </SwiperSlide>
              ))}
          </Swiper>
        ) : null}
      </div>
    </div>
  );
};

RelatedProductSlider.propTypes = {
  category: PropTypes.string,
  spaceBottomClass: PropTypes.string
};

export default RelatedProductSlider;
