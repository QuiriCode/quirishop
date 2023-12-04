import React, { Fragment, useState, useEffect } from "react"; 
import { useParams, useLocation } from "react-router-dom";
import SEO from "../../components/seo";
import LayoutOne from "../../layouts/LayoutOne";
import Breadcrumb from "../../wrappers/breadcrumb/Breadcrumb";
import RelatedProductSlider from "../../wrappers/product/RelatedProductSlider";
import ProductDescriptionTab from "../../wrappers/product/ProductDescriptionTab";
import ProductImageDescription from "../../wrappers/product/ProductImageDescription";
import {t} from "i18next"
import Api from '../../Api'; // Varsayılan API yapılandırmanız

const api = new Api();
const Product = () => {
  let { pathname } = useLocation();
  let { id } = useParams();
  const [product, setProduct] = useState(null);
  const firstCategoryName = product?.categories?.[0]?.name;


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.getProduct(id);
        if (response && response.products && response.products.length > 0) {
          setProduct(response.products[0]);
          console.log(response.products[0]);
        } else {
          console.log("Ürün bulunamadı");
        }
      } catch (error) {
        console.error("Ürün bilgisi alınırken hata oluştu", error);
      }
    };
    
    fetchProduct();
  }, [id]);
  

  // Ürün yüklenene kadar bir yükleme ekranı veya benzeri bir şey gösterilebilir
  if (!product) return <div>Loading...</div>;

  
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
          productFullDesc={product.fulldescription}
        />

        {/* related product slider */}
        <RelatedProductSlider
        spaceBottomClass="pb-95"
        firstCategoryName
        
      />
      </LayoutOne>
    </Fragment>
  );
};

export default Product;
