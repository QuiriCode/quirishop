import { Fragment, React } from "react";
import SEO from "../../components/seo";
import Layout from "../../layouts/Layout";
import HeroSlider from "../../wrappers/hero-slider/HeroSlider";
import FeatureIcon from "../../wrappers/feature-icon/FeatureIcon";
import TabProduct from "../../wrappers/product/TabProduct";
import BlogFeatured from "../../wrappers/blog-featured/BlogFeatured";

const HomeFashion = () => {
  return (
    <Fragment>
      <SEO
        titleTemplate="Her alışveriş biraz daha mama!"
        description="Quiri ile yapacağınız her alışverişte patili dostlarımızın mama havuzunu biraz daha doldurun! Üstelik ücretsiz kargo ve esnek iade koşulları da sizi bekliyor!"
      />
      <Layout
      headerTop="visible"
        headerContainerClass="container-fluid"
        headerPaddingClass="header-padding-1"
      >
        {/* hero slider */}
        <HeroSlider />

        {/* featured icon */}
        <FeatureIcon spaceTopClass="pt-100" spaceBottomClass="pb-60" />

        {/* tab product */}
        <TabProduct spaceBottomClass="pb-60" category="fashion" />

        {/* blog featured */}
        <BlogFeatured spaceBottomClass="pb-55" />
      </Layout>
    </Fragment>
  );
};

export default HomeFashion;
