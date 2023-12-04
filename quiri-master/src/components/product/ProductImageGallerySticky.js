import PropTypes from "prop-types";
import React from "react";


const productImageGallerySticky = ({ product }) => {
  return (
    <div className="product-large-image-wrapper product-large-image-wrapper--sticky">
      {product.discountpercentage || product.newyn ? (
        <div className="product-img-badges">
          {product.discountpercentage ? (
            <span className="pink">-{product.discountpercentage}%</span>
          ) : (
            ""
          )}
          {product.newyn ? <span className="purple">New</span> : ""}
        </div>
      ) : (
        ""
      )}
      <div className="product-sticky-image mb--10">
        {product?.image?.map((single, key) => (
          <div className="product-sticky-image__single mb-10" key={key}>
            <img
              src={process.env.PUBLIC_URL + single}
              alt=""
              className="img-fluid"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

productImageGallerySticky.propTypes = {
  product: PropTypes.shape({})
};

export default productImageGallerySticky;
