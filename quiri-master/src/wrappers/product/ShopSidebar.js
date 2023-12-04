import PropTypes from "prop-types";
import clsx from "clsx";
import React from 'react';
import {
  getIndividualCategories,
  getIndividualTags,
  getIndividualColors,
  getProductsIndividualSizes
} from "../../helpers/product";
import ShopSearch from "../../components/product/ShopSearch";
import ShopCategories from "../../components/product/ShopCategories";
import ShopColor from "../../components/product/ShopColor";
import ShopSize from "../../components/product/ShopSize";
import ShopTag from "../../components/product/ShopTag";
import { useAppSettings } from '../../data/AppSettingsContext';



const ShopSidebar = ({ products, getSortParams, sideSpaceClass }) => {
  const appSettings = useAppSettings();
  const uniqueCategories = appSettings.categories;
  const uniqueColors = getIndividualColors(products);
  const uniqueSizes = getProductsIndividualSizes(products);
  const uniqueTags = appSettings.tags;

  return (
    <div className={clsx("sidebar-style", sideSpaceClass)}>
      {/* shop search */}
      <ShopSearch />

      {/* filter by categories */}
      <ShopCategories
        categories={uniqueCategories}
        getSortParams={getSortParams}
      />

      {/* filter by color */}
      <ShopColor colors={uniqueColors} getSortParams={getSortParams} />

      {/* filter by size */}
      <ShopSize sizes={uniqueSizes} getSortParams={getSortParams} />

      {/* filter by tag */}
      <ShopTag tags={uniqueTags} getSortParams={getSortParams} />
    </div>
  );
};

ShopSidebar.propTypes = {
  getSortParams: PropTypes.func,
  products: PropTypes.array,
  sideSpaceClass: PropTypes.string
};

export default ShopSidebar;
