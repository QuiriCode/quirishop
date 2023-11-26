import React, { Fragment } from "react"; 
import { useSelector } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
import SEO from "../../components/seo";
import LayoutOne from "../../layouts/LayoutOne";
import Breadcrumb from "../../wrappers/breadcrumb/Breadcrumb";
import RelatedProductSlider from "../../wrappers/product/RelatedProductSlider";
import ProductDescriptionTab from "../../wrappers/product/ProductDescriptionTab";
import ProductImageDescription from "../../wrappers/product/ProductImageDescription";
import {t} from "i18next"
const Product = () => {
  let { pathname } = useLocation();
  let { id } = useParams();
  
  const { products } = useSelector((state) => state.product.products);
  const product = products.find(product => product.id==id);
  return (
    <Fragment>
      <SEO
        titleTemplate={product.name}
        description="Product Page of quiri react minimalist eCommerce template."
      />

      <LayoutOne headerTop="visible">
        {/* breadcrumb */}
        <Breadcrumb 
          pages={[
            {label: t("home"), path: process.env.PUBLIC_URL + "/" },
            {label: product.name, path: process.env.PUBLIC_URL + pathname }
          ]} 
        />

        {/* product description with image */}
        <ProductImageDescription
          spaceTopClass="pt-100"
          spaceBottomClass="pb-100"
          product={product}
        />

        {/* product description tab */}
        <ProductDescriptionTab
          spaceBottomClass="pb-90"
          productFullDesc={product.fullDescription}
        />

        {/* related product slider */}
        <RelatedProductSlider
        spaceBottomClass="pb-95"
        category={product.category[0].name}
      />
      </LayoutOne>
    </Fragment>
  );
};

export default Product;