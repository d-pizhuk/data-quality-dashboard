import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

import './styles/Carousel.css';

import { EffectCoverflow, Pagination } from 'swiper/modules';

export default function Carousel({data}) {
    return (
        <>
            <Swiper
                effect={'coverflow'}
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={'auto'}
                initialSlide={1}
                nested={true}
                coverflowEffect={{
                    rotate: 50,
                    stretch: 0,
                    depth: 100,
                    modifier: 1,
                    slideShadows: true,
                }}
                pagination={true}
                modules={[EffectCoverflow, Pagination]}
                className="carousel"
            >
                {data.map((slideContent, index) => (
                    <SwiperSlide key={index}>
                        {slideContent}
                    </SwiperSlide>
                ))}
            </Swiper>
        </>
    );
}
