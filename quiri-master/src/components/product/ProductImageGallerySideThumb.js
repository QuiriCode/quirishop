import { Fragment, useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import React from 'react';
import { EffectFade, Thumbs } from "swiper";
import AnotherLightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Swiper, { SwiperSlide } from "../../components/swiper";
import { useAppSettings } from '../../data/AppSettingsContext';


const ProductImageGalleryLeftThumb = ({ product, thumbPosition }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [index, setIndex] = useState(-1);
  const slides = product?.images.map((img, i) => ({
    src: `data:${img.mimetype};base64,${img.base64content}`,
    key: i,
  }));
  const appSettings = useAppSettings();

  // swiper slider settings
  const gallerySwiperParams = {
    spaceBetween: 10,
    loop: true,
    effect: "fade",
    fadeEffect: {
      crossFade: true,
    },
    thumbs: { swiper: thumbsSwiper },
    modules: [EffectFade, Thumbs],
  };

  const thumbnailSwiperParams = {
    onSwiper: setThumbsSwiper,
    spaceBetween: 10,
    slidesPerView: 4,
    touchRatio: 0.2,
    loop: true,
    slideToClickedSlide: true,
    direction: "vertical",
    breakpoints: {
      320: {
        slidesPerView: 4,
        direction: "horizontal",
      },
      640: {
        slidesPerView: 4,
        direction: "horizontal",
      },
      768: {
        slidesPerView: 4,
        direction: "horizontal",
      },
      992: {
        slidesPerView: 4,
        direction: "horizontal",
      },
      1200: {
        slidesPerView: 4,
        direction: "vertical",
      },
    },
  };

  return (
    <Fragment>
      <div className="row row-5 test">
        <div
          className={clsx(
            thumbPosition && thumbPosition === "left"
              ? "col-xl-10 order-1 order-xl-2"
              : "col-xl-10"
          )}
        >
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
                {product?.images.map((single, key) => (
                  <SwiperSlide key={key}>
                    <button
                      className="lightgallery-button"
                      onClick={() => setIndex(key)}
                    >
                      <i className="pe-7s-expand1"></i>
                    </button>
                    <div className="single-image">
                      <img
                        src={`data:${single.mimetype};base64,${single.base64content}`}
                        className="img-fluid"
                        alt={single.name}
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
            ) :  (
              <div className="single-image">
                <img
                  src={appSettings.defaultproductimagebase64}
                  className="img-fluid"
                  alt=""
                />
              </div>
      )}
          </div>
        </div>
        <div
          className={clsx(
            thumbPosition && thumbPosition === "left"
              ? "col-xl-2 order-2 order-xl-1"
              : "col-xl-2"
          )}
        >
          <div className="product-small-image-wrapper product-small-image-wrapper--side-thumb">
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
        </div>
      </div>
    </Fragment>
  );
};

ProductImageGalleryLeftThumb.propTypes = {
  product: PropTypes.shape({}),
  thumbPosition: PropTypes.string,
};

export default ProductImageGalleryLeftThumb;
