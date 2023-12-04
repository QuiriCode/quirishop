import { useEffect, useState } from 'react';
import { EffectFade } from 'swiper';
import Swiper, { SwiperSlide } from "../../components/swiper";
import HeroSliderSingle from "../../components/hero-slider/HeroSliderSingle.js";
import Api from '../../Api'

const api = new Api()

const params = {
  effect: "fade",
  fadeEffect: {
    crossFade: true
  },
  modules: [EffectFade],
  loop: true,
  speed: 1000,
  navigation: true,
  autoHeight: false
};

const HeroSlider = () => {
  const [heroSliderData, setHeroSliderData] = useState(null);

  useEffect(() => {
    const fetchHighlights = async () => {
      const response = await api.getHighlights();
      setHeroSliderData(response.highlights);
    };

    fetchHighlights();
  }, []);

  return (
    <div className="slider-area">
      <div className="slider-active nav-style-1">
        {heroSliderData && (
          <Swiper options={params}>
            {heroSliderData.map((single, key) => (
              <SwiperSlide key={key}>
                <HeroSliderSingle
                  data={single}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </div>
  );
};

export default HeroSlider;
