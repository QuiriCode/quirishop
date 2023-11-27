import { Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types";
import React from "react";
import { useSelector } from "react-redux";
import { getProducts } from "../../helpers/product";
import ProductGridSingle from "../../components/product/ProductGridSingle";
import Api from '../../Api';

const api = new Api();

const ProductGrid = ({
  spaceBottomClass,
  category,
  type,
  limit
}) => {
  const [products, setProducts] = useState([]);
  const currency = useSelector((state) => state.currency);
  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { compareItems } = useSelector((state) => state.compare);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.searchProducts("");
        setProducts(response.products);
      } catch (error) {
        console.error("Error fetching products", error);
      }
    };

    fetchProducts();
  }, []);

  const prods = getProducts(products, category, type, limit);
  console.log("prods",prods)
  console.log("products",products)
  
  return (
    <Fragment>
      {prods?.map(product => {
        return (
          <div className="col-xl-3 col-md-6 col-lg-4 col-sm-6" key={product.id}>
            <ProductGridSingle
              spaceBottomClass={spaceBottomClass}
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
          </div>
        );
      })}
    </Fragment>
  );
};

ProductGrid.propTypes = {
  spaceBottomClass: PropTypes.string,
  category: PropTypes.string,
  type: PropTypes.string,
  limit: PropTypes.number
};

export default ProductGrid;
