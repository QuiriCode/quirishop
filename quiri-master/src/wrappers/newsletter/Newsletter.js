import PropTypes from "prop-types";
import clsx from "clsx";
import React from 'react';
import SubscribeEmail from "../../components/newsletter/SubscribeEmail";

const Newsletter = ({
  bgColorClass,
  spaceBottomClass,
  spaceLeftClass,
  spaceRightClass
}) => {
  return (
    <div className={clsx("subscribe-area", bgColorClass, spaceBottomClass, spaceLeftClass, spaceRightClass)}>
      <div className="container">
        <div className="row">
          <div className="col-xl-8 col-lg-8 ms-auto me-auto">
            <div className="subscribe-style-2 text-center">
              <h2>Subscribe </h2>
              <p>Subscribe to our newsletter to receive news on update</p>
              {/* subscription form */}
              <SubscribeEmail mailchimpUrl="//devitems.us11.list-manage.com/subscribe/post?u=6bbb9b6f5827bd842d9640c82&amp;id=05d85f18ef" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Newsletter.propTypes = {
  bgColorClass: PropTypes.string,
  spaceBottomClass: PropTypes.string,
  spaceLeftClass: PropTypes.string,
  spaceRightClass: PropTypes.string
};

export default Newsletter;
