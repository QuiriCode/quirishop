import PropTypes from "prop-types";
import clsx from "clsx";
import React from 'react';

const FeatureIconThreeSingle = ({
  data,
  spaceBottomClass,
  featureShapeClass
}) => {
  return (
      <div className={clsx("support-wrap-2 support-padding-2 text-center", featureShapeClass, spaceBottomClass)}>
        <div className="support-content-2">
          <img
            className="animated"
            src={process.env.PUBLIC_URL + data.image}
            alt=""
          />
          <h5>{data.title}</h5>
          <p>{data.subtitle}</p>
        </div>
      </div>
  );
};

FeatureIconThreeSingle.propTypes = {
  data: PropTypes.shape({}),
  featureShapeClass: PropTypes.string,
  spaceBottomClass: PropTypes.string
};

export default FeatureIconThreeSingle;
