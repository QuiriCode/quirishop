import PropTypes from "prop-types";
import clsx from "clsx";
import React from "react";
const SectionTitleThree = ({
  titleText,
  positionClass,
  spaceClass,
  colorClass
}) => {
  return (
    <div className={clsx("section-title-5", positionClass, spaceClass)}>
      <h2 className={clsx(colorClass)}>{titleText}</h2>
    </div>
  );
};

SectionTitleThree.propTypes = {
  positionClass: PropTypes.string,
  spaceClass: PropTypes.string,
  titleText: PropTypes.string
};

export default SectionTitleThree;
