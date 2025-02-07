import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination'; // Import pagination styles
import './styles/CustomSwiper.css';
import { Navigation, Pagination } from 'swiper/modules';

const CustomSwiper = ({ data, swiperKey, swiperInitialSlide }) => {
  const swiperContainerRef = useRef(null);
  const [paddingSet, setPaddingSet] = useState(false);

  const setPadding = useCallback(() => {
    // Get the right edge of the left navigation button and container left
    const swiperBtnRight = swiperContainerRef.current
      .querySelector('.swiper-button-prev')
      .getBoundingClientRect().right;
    const swiperContainerLeft = swiperContainerRef.current.getBoundingClientRect().left;
    const indentation = 5;

    const detailedInfoBlocks = swiperContainerRef.current.querySelectorAll('.detailed_info-block');

    const paddingValue = `${swiperBtnRight - swiperContainerLeft + indentation}px`;

    detailedInfoBlocks.forEach((block) => {
      block.style.padding = paddingValue;
    });
    setPaddingSet(true);
  }, []);

  useEffect(() => {
    setPadding();
    window.addEventListener('resize', setPadding);
    return () => {
      window.removeEventListener('resize', setPadding);
    };
  }, [setPadding]);

  return (
    <div ref={swiperContainerRef} className="swiper-container">
      <Swiper
        key={swiperKey}
        initialSlide={swiperInitialSlide}
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }} 
        spaceBetween={50}
        slidesPerView={1}
      >
        {data.map((slideContent, index) => (
          <SwiperSlide key={index}>
            <div className="detailed_info-block">{paddingSet && slideContent}</div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CustomSwiper;
