import PropTypes from "prop-types";
import clsx from "clsx";
import React from 'react';
import blogFeaturedData from "../../data/blog-featured/blog-featured.json";
import BlogFeaturedSingle from "../../components/blog-featured/BlogFeaturedSingle";
import SectionTitle from "../../components/section-title/SectionTitle";
import { t } from "i18next";

const BlogFeatured = ({ spaceTopClass, spaceBottomClass }) => {
  return (
    <div className={clsx("blog-area", spaceTopClass, spaceBottomClass)}>
      <div className="container">
        <SectionTitle
          titleText={t("blog")}
          positionClass="text-center"
          spaceClass="mb-55"
        />
        <div className="row">
          {blogFeaturedData?.map(singlePost => (
            <div className="col-lg-4 col-sm-6" key={singlePost.id}>
              <BlogFeaturedSingle singlePost={singlePost} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

BlogFeatured.propTypes = {
  spaceBottomClass: PropTypes.string,
  spaceTopClass: PropTypes.string
};

export default BlogFeatured;
