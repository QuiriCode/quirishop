import PropTypes from "prop-types";
import React from "react";
import { Link } from "react-router-dom";
import { t } from "i18next";

const HeroSliderSingle = ({ data }) => {
  // Convert base64 content to a URL for the image source
  const imageUrl = data.mimetype && data.base64content
    ? `data:${data.mimetype};base64,${data.base64content}`
    : ''; // Provide a fallback URL or leave as an empty string

  return (
    <div className="single-slider single-slider-10 slider-height-8 bg-purple">
      <div className="container">
        <div className="row">
          <div className="col-12 col-sm-6 d-flex align-items-center">
            <div className="slider-content slider-content-10 slider-animated-2">
              <h3 className="animated">{data.subtitle}</h3>
              <h1 className="animated">{data.title}</h1>
              <div className="slider-btn btn-hover">
                <Link
                  className="animated"
                  to={data.url}
                >
                  {t("details")}
                </Link>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6">
            <div className="slider-singleimg-hm10 slider-animated-2 ml-40 mr-40">
              <img
                className="animated img-fluid"
                src={imageUrl} // Use the base64 URL for the image
                alt={data.title} // Use the title as the alt text for better accessibility
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

HeroSliderSingle.propTypes = {
  data: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    url: PropTypes.string,
    mimetype: PropTypes.string,
    base64content: PropTypes.string,
    sortnumber: PropTypes.number,
  })
};

export default HeroSliderSingle;
