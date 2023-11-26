import PropTypes from "prop-types";
import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getProductCartQuantity } from "../../helpers/product";
import Rating from "./sub-components/ProductRating";
import { addToCart } from "../../store/slices/cart-slice";
import { addToWishlist } from "../../store/slices/wishlist-slice";
import { addToCompare } from "../../store/slices/compare-slice";

const ProductDescriptionInfo = ({
  product,
  currency,
  cartItems,
  wishlistItems,
  compareItems
}) => {
  console.log("product", product);
  const dispatch = useDispatch();
  const [selectedProductColor, setSelectedProductColor] = useState(
    product.variations ? product.variations[0].color : ""
  );
  const [selectedProductSize, setSelectedProductSize] = useState(
    product.variations ? product.variations[0].sizes[0].name : ""
  );
  const [productStock, setProductStock] = useState(
    product.variations ? product.variations[0].sizes[0].stock : product.stock
  );
  const [quantityCount, setQuantityCount] = useState(1);

  const productCartQty = getProductCartQuantity(
    cartItems,
    product,
    selectedProductColor,
    selectedProductSize
  );
  

  const addToCartHandler = () => {
    dispatch(
      addToCart({
        ...product,
        quantity: quantityCount,
        selectedProductColor: selectedProductColor || product.selectedProductColor,
        selectedProductSize: selectedProductSize || product.selectedProductSize
      })
    );
  };

  const addToWishlistHandler = () => {
    dispatch(addToWishlist(product));
  };

  const addToCompareHandler = () => {
    dispatch(addToCompare(product));
  };

  return (
    <div className="product-details-content ml-70">
      <h2>{product.name}</h2>
      <div className="product-details-price">
        {product.discount ? (
          <Fragment>
            <span>{currency.currencySymbol + product.discount}</span>{" "}
            <span className="old">
              {currency.currencySymbol + product.price}
            </span>
          </Fragment>
        ) : (
          <span>{currency.currencySymbol + product.price} </span>
        )}
      </div>
      {product.rating && product.rating > 0 ? (
        <div className="pro-details-rating-wrap">
          <div className="pro-details-rating">
            <Rating ratingValue={product.rating} />
          </div>
        </div>
      ) : null}
      <div className="pro-details-list">
        <p>{product.description}</p>
      </div>

      {product.variations ? (
        <div className="pro-details-size-color">
          <div className="pro-details-color-wrap">
            <span>Color</span>
            <div className="pro-details-color-content">
              {product.variations.map((variation, key) => (
                <label
                  className={`pro-details-color-content--single ${variation.color}`}
                  key={key}
                >
                  <input
                    type="radio"
                    value={variation.color}
                    name="product-color"
                    checked={variation.color === selectedProductColor}
                    onChange={() => {
                      setSelectedProductColor(variation.color);
                      setSelectedProductSize(variation.sizes[0].name);
                      setProductStock(variation.sizes[0].stock);
                      setQuantityCount(1);
                    }}
                  />
                  <span className="checkmark"></span>
                </label>
              ))}
            </div>
          </div>
          <div className="pro-details-size">
            <span>Size</span>
            <div className="pro-details-size-content">
              {product.variations.map((variation) =>
                variation.color === selectedProductColor
                  ? variation.sizes.map((size, key) => (
                      <label
                        className={`pro-details-size-content--single`}
                        key={key}
                      >
                        <input
                          type="radio"
                          value={size.name}
                          checked={size.name === selectedProductSize}
                          onChange={() => {
                            setSelectedProductSize(size.name);
                            setProductStock(size.stock);
                            setQuantityCount(1);
                          }}
                        />
                        <span className="size-name">{size.name}</span>
                      </label>
                    ))
                  : null
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="pro-details-quality">
        <div className="cart-plus-minus">
          <button
            onClick={() =>
              setQuantityCount((prevCount) => Math.max(prevCount - 1, 1))
            }
            className="dec qtybutton"
          >
            -
          </button>
          <input
            className="cart-plus-minus-box"
            type="text"
            value={quantityCount}
            readOnly
          />
          <button
            onClick={() =>
              setQuantityCount((prevCount) =>
                Math.min(prevCount + 1, productStock - productCartQty)
              )
            }
            className="inc qtybutton"
          >
            +
          </button>
        </div>
        <div className="pro-details-cart btn-hover">
          {productStock && productStock > 0 ? (
            <button
              onClick={addToCartHandler}
              disabled={productCartQty >= productStock}
            >
              {" "}
              Add To Cart{" "}
            </button>
          ) : (
            <button disabled>Out of Stock</button>
          )}
        </div>
        <div className="pro-details-wishlist">
          <button
            className={wishlistItems.some((item) => item.id == product.id) ? "active" : ""}
            disabled={wishlistItems.some((item) => item.id == product.id)}
            title={
              wishlistItems.some((item) => item.id == product.id)
                ? "Added to wishlist"
                : "Add to wishlist"
            }
            onClick={addToWishlistHandler}
          >
            <i className="pe-7s-like" />
          </button>
        </div>
        <div className="pro-details-compare">
          <button
            className={compareItems.some((item) => item.id == product.id) ? "active" : ""}
            disabled={compareItems.some((item) => item.id == product.id)}
            title={
              compareItems.some((item) => item.id == product.id)
                ? "Added to compare"
                : "Add to compare"
            }
            onClick={addToCompareHandler}
          >
            <i className="pe-7s-shuffle" />
          </button>
        </div>
      </div>

      {product.categories && product.categories.length > 0 ? (
        <div className="pro-details-meta">
          <span>Categories :</span>
          <ul>
            {product.categories.map((category, key) => (
              <li key={key}>
                <Link to={process.env.PUBLIC_URL + "/shop-grid-standard"}>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {product.tag && product.tag.length > 0 ? (
        <div className="pro-details-meta">
          <span>Tags :</span>
          <ul>
            {product.tag.map((tag, key) => (
              <li key={key}>
                <Link to={process.env.PUBLIC_URL + "/shop-grid-standard"}>
                  {tag.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="pro-details-social">
        <ul>
          <li>
            <a href="//facebook.com">
              <i className="fa fa-facebook" />
            </a>
          </li>
          <li>
            <a href="//dribbble.com">
              <i className="fa fa-dribbble" />
            </a>
          </li>
          <li>
            <a href="//pinterest.com">
              <i className="fa fa-pinterest-p" />
            </a>
          </li>
          <li>
            <a href="//twitter.com">
              <i className="fa fa-twitter" />
            </a>
          </li>
          <li>
            <a href="//linkedin.com">
              <i className="fa fa-linkedin" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};


ProductDescriptionInfo.propTypes = {
  cartItems: PropTypes.arrayOf(PropTypes.object),
  compareItems: PropTypes.arrayOf(PropTypes.object),
  currency: PropTypes.object,
  product: PropTypes.object,
  wishlistItems: PropTypes.arrayOf(PropTypes.object)
};

ProductDescriptionInfo.defaultProps = {
  wishlistItems: [], // Provide a default empty array for wishlistItems
  compareItems: [] // Provide a default empty array for compareItems
};

export default ProductDescriptionInfo;
