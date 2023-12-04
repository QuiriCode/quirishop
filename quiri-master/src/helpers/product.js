import React from "react";
// get products
export const getProducts = (products, category, type, limit) => {
  if (!Array.isArray(products)) return [];

  const finalProducts = category
    ? products.filter(
        product => product.categories && product.categories.includes(category)
      )
    : products;
  if (type && type === "new") {
    const newProducts = finalProducts.filter(single => single.newyn);
    return newProducts.slice(0, limit ? limit : newProducts.length);
  }
  if (type && type === "bestSeller") {
    return finalProducts
      .sort((a, b) => {
        return b.saleCount - a.saleCount;
      })
      .slice(0, limit ? limit : finalProducts.length);
  }
  if (type && type === "saleItems") {
    const saleItems = finalProducts.filter(
      single => single.discountpercentage && single.discountpercentage > 0
    );
    return saleItems.slice(0, limit ? limit : saleItems.length);
  }
  return finalProducts.slice(0, limit ? limit : finalProducts.length);
};

// get product discountpercentage price
export const getDiscountPrice = (price, discountpercentage) => {
  return discountpercentage && discountpercentage > 0 ? price - price * (discountpercentage / 100) : null;
};

// get product cart quantity
export const getProductCartQuantity = (cartItems, product, color, size) => {
  let productInCart = cartItems.find(
    single =>
      single.id == product.id &&
      (single.selectedProductColor
        ? single.selectedProductColor === color
        : true) &&
      (single.selectedProductSize ? single.selectedProductSize === size : true)
  );
  if (cartItems.length >= 1 && productInCart) {
    if (product.variations) {
      return cartItems.find(
        single =>
          single.id == product.id &&
          single.selectedProductColor === color &&
          single.selectedProductSize === size
      ).quantity;
    } else {
      return cartItems.find(single => product.id == single.id).quantity;
    }
  } else {
    return 0;
  }
};

export const cartItemStock = (item, color, size) => {
  if (item.stock) {
    return item.stock;
  } else {
    return item.variations
      .filter(single => single.color === color)[0]
      .sizes.filter(single => single.name === size)[0].stock;
  }
};

//get products based on category
export const getSortedProducts = (products, sortType, sortValue) => {
  if (products && sortType && sortValue) {
    if (sortType === "category") {
      return products.filter(product =>
        product.category.find(single => single.name === sortValue)
      );
    }
    if (sortType === "tag") {
      return products.filter(product =>
        product.tag.find(single => single.name === sortValue)
      );
    }
    if (sortType === "color") {
      return products.filter(
        product =>
          product.variations &&
          product.variations.find(single => single.color === sortValue)
      );
    }
    if (sortType === "size") {
      return products.filter(
        product =>
          product.variations &&
          product.variations.find(single =>
            single.sizes.find(item => item.name === sortValue)
          )
      );
    }
    if (sortType === "filterSort") {
      let sortProducts = [...products];
      if (sortValue === "default") {
        return sortProducts;
      }
      if (sortValue === "priceHighToLow") {
        return sortProducts.sort((a, b) => b.price - a.price);
      }
      if (sortValue === "priceLowToHigh") {
        return sortProducts.sort((a, b) => a.price - b.price);
      }
    }
  }
  return products;
};


// get individual element
const getIndividualItemArray = array => {
  let individualItemArray = array.filter(function(v, i, self) {
    return i === self.indexOf(v);
  });
  return individualItemArray;
};
export const getIndividualCategories = products => {
  let productCategories = [];
  products.forEach(product => {
    if (product.categories) {
      product.categories.forEach(single => {
        productCategories.push(single);
      });
    }
  });
  return getIndividualItemArray(productCategories);
};

export const getIndividualTags = products => {
  let productTags = [];
  products.forEach(product => {
    if (product.tags) {
      product.tags.forEach(single => {
        productTags.push(single);
      });
    }
  });
  return getIndividualItemArray(productTags);
};

// get individual colors
export const getIndividualColors = products => {
  let productColors = [];
  products &&
    products.map(product => {
      return (
        product.variations &&
        product.variations.map(single => {
          return productColors.push(single.color);
        })
      );
    });
  const individualProductColors = getIndividualItemArray(productColors);
  return individualProductColors;
};

// get individual sizes
export const getProductsIndividualSizes = products => {
  let productSizes = [];
  products &&
    products.map(product => {
      return (
        product.variations &&
        product.variations.map(single => {
          return single.sizes.map(single => {
            return productSizes.push(single.name);
          });
        })
      );
    });
  const individualProductSizes = getIndividualItemArray(productSizes);
  return individualProductSizes;
};

// get product individual sizes
export const getIndividualSizes = product => {
  let productSizes = [];
  product.variations &&
    product.variations.map(singleVariation => {
      return (
        singleVariation.sizes &&
        singleVariation.sizes.map(singleSize => {
          return productSizes.push(singleSize.name);
        })
      );
    });
  const individualSizes = getIndividualItemArray(productSizes);
  return individualSizes;
};

export const setActiveSort = e => {
  const filterButtons = document.querySelectorAll(
    ".sidebar-widget-list-left button, .sidebar-widget-tag button, .product-filter button"
  );
  filterButtons.forEach(item => {
    item.classList.remove("active");
  });
  e.currentTarget.classList.add("active");
};

export const setActiveLayout = e => {
  const gridSwitchBtn = document.querySelectorAll(".shop-tab button");
  gridSwitchBtn.forEach(item => {
    item.classList.remove("active");
  });
  e.currentTarget.classList.add("active");
};

export const toggleShopTopFilter = e => {
  const shopTopFilterWrapper = document.querySelector(
    "#product-filter-wrapper"
  );
  shopTopFilterWrapper.classList.toggle("active");
  if (shopTopFilterWrapper.style.height) {
    shopTopFilterWrapper.style.height = null;
  } else {
    shopTopFilterWrapper.style.height =
      shopTopFilterWrapper.scrollHeight + "px";
  }
  e.currentTarget.classList.toggle("active");
};
