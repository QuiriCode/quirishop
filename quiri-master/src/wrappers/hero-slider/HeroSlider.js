import { EffectFade } from 'swiper';
import Swiper, { SwiperSlide } from "../../components/swiper";
import heroSliderData from "../../data/hero-sliders/hero-slider.json";
import HeroSliderSingle from "../../components/hero-slider/HeroSliderSingle.js";

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
