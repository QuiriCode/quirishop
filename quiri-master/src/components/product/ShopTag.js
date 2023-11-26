import PropTypes from "prop-types";

import { setActiveSort } from "../../helpers/product";
import {t} from "i18next"
const ShopTag = ({ tags, getSortParams }) => {
  return (
    <div className="sidebar-widget mt-50">
      <h4 className="pro-sidebar-title">{t("tag")}</h4>
      <div className="sidebar-widget-tag mt-25">
        {tags ? (
          <ul>
            {tags.map((tag, key) => {
              return (
                <li key={key}>
                  <button
                    onClick={e => {
                      getSortParams("tag", tag.name);
                      setActiveSort(e);
                    }}
                  >
                    {tag.name}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          t("no_tags_found")
        )}
      </div>
    </div>
  );
};

ShopTag.propTypes = {
  getSortParams: PropTypes.func,
  tags: PropTypes.array
};

export default ShopTag;
