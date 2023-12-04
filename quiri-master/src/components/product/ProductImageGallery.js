import React, { Fragment, useState } from "react";
import PropTypes from "prop-types";
import { EffectFade, Thumbs } from 'swiper';
import AnotherLightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Swiper, { SwiperSlide } from "../../components/swiper";
import { useAppSettings } from '../../data/AppSettingsContext';


const ProductImageGallery = ({ product }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [index, setIndex] = useState(-1);
  const slides = product?.images.map((img, i) => ({
    src: `data:${img.mimetype};base64,${img.base64content}`,
    key: i,
  }));
  // swiper slider settings
const appSettings = useAppSettings();
  const gallerySwiperParams = {
    spaceBetween: 10,
    loop: true,
    effect: "fade",
    fadeEffect: {
      crossFade: true
    },
    thumbs: { swiper: thumbsSwiper },
    modules: [EffectFade, Thumbs],
  };

  const thumbnailSwiperParams = {
    onSwiper: setThumbsSwiper,
    spaceBetween: 10,
    slidesPerView: 4,
    touchRatio: 0.2,
    freeMode: true,
    loop: true,
    slideToClickedSlide: true,
    navigation: true
  };

  return (
    <Fragment>
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
        {product?.images?.length ? (
          <Swiper options={gallerySwiperParams}>
            {product.images.map((single, key) => (
              <SwiperSlide key={key}>
                <button className="lightgallery-button" onClick={() => setIndex(key)}>
                  <i className="pe-7s-expand1"></i>
                </button>
                <div className="single-image">
                  <img
                    src={`data:${single.mimetype};base64,${single.base64content}`}
                    className="img-fluid"
                    alt=""
                  />
                </div>
              </SwiperSlide>
            ))}
            <AnotherLightbox
              open={index >= 0}
              index={index}
              close={() => setIndex(-1)}
              slides={slides}
              plugins={[Thumbnails, Zoom, Fullscreen]}
            />
          </Swiper>
        ) : (
                <div className="single-image">
                  <img
                    src={appSettings.defaultproductimagebase64}
                    className="img-fluid"
                    alt=""
                  />
                </div>
        )}

      </div>
      <div className="product-small-image-wrapper mt-15">
        {product?.images?.length ? (
          <Swiper options={thumbnailSwiperParams}>
            {product.images.map((single, key) => (
              <SwiperSlide key={key}>
                <div className="single-image">
                  <img
                    src={`data:${single.mimetype};base64,${single.base64content}`}
                    className="img-fluid"
                    alt=""
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : null}
      </div>
    </Fragment>
  );
};

ProductImageGallery.propTypes = {
  product: PropTypes.shape({}),
};

export default ProductImageGallery;
