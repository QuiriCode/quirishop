import PropTypes from "prop-types";
import clsx from "clsx";
import React from "react";
const SectionTitleFour = ({ titleText, spaceBottomClass }) => {
  return (
    <div
      className={clsx("section-title-3", spaceBottomClass)}
    >
      <h4>{titleText}</h4>
    </div>
  );
};

SectionTitleFour.propTypes = {
  spaceBottomClass: PropTypes.string,
  titleText: PropTypes.string
};

export default SectionTitleFour;
