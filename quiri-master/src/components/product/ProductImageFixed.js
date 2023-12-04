import PropTypes from "prop-types";
import React from "react";
import { useAppSettings } from '../../data/AppSettingsContext';

const ProductImageFixed = ({ product }) => {
  const appSettings = useAppSettings();
  
  return (
    <div className="product-large-image-wrapper">
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

      <div className="product-fixed-image">
        {product.images && product.images.length > 0 ? (
                         <img
                         className="img-fluid"
                         src={`data:${product.images[0].mimetype};base64,${product.images[0].base64content}`}
                         alt=""
                       />
        ) : (
          <img
          className="img-fluid"
          src={appSettings.defaultproductimagebase64}
          alt=""
        />
        )}
      </div>
    </div>
  );
};

ProductImageFixed.propTypes = {
  product: PropTypes.shape({})
};

export default ProductImageFixed;
