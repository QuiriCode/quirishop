import PropTypes from "prop-types";
import React from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { setCurrency } from "../../../store/slices/currency-slice"


  const LanguageCurrencyChanger = ({ currency }) => {
    const { i18n , t} = useTranslation();
    const dispatch = useDispatch();
    const phoneNumber = "+90 552 097 8830"
  
    const setCurrencyTrigger = e => {
      const currencyName = e.target.value;
      dispatch(setCurrency(currencyName));
    };
    const changeLanguageTrigger = e => {
      const languageCode = e.target.value;
      i18n.changeLanguage(languageCode);
    };
  
    return (
      <div className="language-currency-wrap">
        <div className="same-language-currency language-style">
          <span>
            {i18n.resolvedLanguage === "en"
              ? "English"
              : i18n.resolvedLanguage === "tr"
              ? "Türkçe"
              : i18n.resolvedLanguage === "fn"
              ? "French"
              : i18n.resolvedLanguage === "de"
              ? "Germany"
              : ""}{" "}
            <i className="fa fa-angle-down" />
          </span>
          <div className="lang-car-dropdown">
            <ul>
              <li>
                <button value="tr" onClick={e => changeLanguageTrigger(e)}>
                  Türkçe
                </button>
              </li>
              <li>
                <button value="en" onClick={e => changeLanguageTrigger(e)}>
                  English
                </button>
              </li>
              {/*
              <li>
                <button value="fn" onClick={e => changeLanguageTrigger(e)}>
                  French
                </button>
              </li>
              <li>
                <button value="de" onClick={e => changeLanguageTrigger(e)}>
                  Germany
                </button>
              </li>
              */}
            </ul>
          </div>
        </div>
        <div className="same-language-currency use-style">
          <span>
            {currency.currencyName} <i className="fa fa-angle-down" />
          </span>
          <div className="lang-car-dropdown">
            <ul>
              {/*
              <li>
                <button value="USD" onClick={e => setCurrencyTrigger(e)}>
                  USD
                </button>
              </li>
              <li>
                <button value="EUR" onClick={e => setCurrencyTrigger(e)}>
                  EUR
                </button>
              </li>
              <li>
                <button value="GBP" onClick={e => setCurrencyTrigger(e)}>
                  GBP
                </button>
              </li>
              */}
              <li>
                <button value="TL" onClick={e => setCurrencyTrigger(e)}>
                  TL
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="same-language-currency">
          <p onClick={function makeCall() {
            window.open('tel:905520978830');
          }}
          >{t("contact_us")} {phoneNumber}</p>
        </div>
      </div>
    );
  };
  
  LanguageCurrencyChanger.propTypes = {
    currency: PropTypes.shape({}),
  };
  
  export default LanguageCurrencyChanger;

  