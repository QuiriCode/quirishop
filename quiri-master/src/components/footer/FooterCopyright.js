import PropTypes from "prop-types";
import clsx from "clsx";
import React from 'react';
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const FooterCopyright = ({ footerLogo, spaceBottomClass, colorClass }) => {
  const { t } = useTranslation();
  return (
    <div className={clsx("copyright", spaceBottomClass, colorClass)}>
      <div className="footer-logo">
        <Link to={process.env.PUBLIC_URL + "/"}>
          <img alt="" src={process.env.PUBLIC_URL + footerLogo} />
        </Link>
      </div>
      <p>
        &copy; {new Date().getFullYear()}{" "}
        <a
          href="https://hasthemes.com"
          rel="noopener noreferrer"
          target="_blank"
        >
          {t("company_name")}
        </a>
        .<br /> {t('allrightsreserved')}
      </p>
    </div>
  );
};

FooterCopyright.propTypes = {
  footerLogo: PropTypes.string,
  spaceBottomClass: PropTypes.string,
  colorClass: PropTypes.string
};

export default FooterCopyright;
