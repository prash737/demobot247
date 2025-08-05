"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";

const OwlCarousel = dynamic(() => import("react-owl-carousel"), {
  ssr: false,
});

const clients = [
  {
    name: "SSCA",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-9F1EvwQ1BSTv4WE2Z32Z5IjRJ7Zr2s.png",
    alt: "SSCA Logo",
  },
  {
    name: "SSBS",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Y4RW6cdWANAk1lP4Q8hWgHETES4yf9.png",
    alt: "SSBS Logo",
  },
  {
    name: "SIBM BENGALURU",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ErLBJ4khHvcq8qwM3GD08JQ7gQCp2N.png",
    alt: "SIBM BENGALURU Logo",
  },
  {
    name: "SIMS",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-5XRe78uatw4VPZ0fv7eTUPFUOHdmmH.png",
    alt: "SIMS Logo",
  },
  {
    name: "SCMS-B",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-VfNtztAfBqtcREtqvJdxK5N4MvJqqo.png",
    alt: "SCMS-B Logo",
  },
  {
    name: "SSODL",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-xEODQ5swAHXCHUnlMknIcYFmdmQZFf.png",
    alt: "SSODL Logo",
  },
  {
    name: "Evonix",
    logo: "/images/evonix.png",
    alt: "Evonix Logo",
  },
  {
    name: "QuickKart",
    logo: "/images/quickart.png",
    alt: "QuickKart Logo",
  },
  {
    name: "The Kalyani School",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Client%204.jpg-r7mFCLHZX0Di4h6hAYXXX8WEAl2fpP.jpeg",
    alt: "The Kalyani School Logo",
  },
  {
    name: "Hyp Mobility",
    logo: "/images/hyp-mobility.png",
    alt: "Hyp Mobility Logo",
  },
];

// OWL-Carousel-START
const options = {
  loop: true,
  autoplay: false,
  nav: false,
  responsive: {
    0: {
      items: 2, // 👈 Show 2 items on small screens (e.g. mobile)
    },
    600: {
      items: 2,
    },
    1000: {
      items: 5,
    },
  },
};
// OWL-Carousel-END

export function OurClients() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <section className="mb-5 pt-5" id="our-clients">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 heading70 text-center mb-5">
              Our Clients
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-5 pt-5" id="our-clients">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 heading70 text-center mb-5">
            Our Clients
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <OwlCarousel
              className="owl-theme"
              loop
              items={5}
              {...options}
              autoplay
            >
              {clients.map((client, index) => (
                <div key={`client-${index}`} className="clientlogo_list">
                  <div className="clientlogo_list_inner relative">
                    <Image
                      src={client.logo || "/placeholder.svg"}
                      alt={client.alt}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                </div>
              ))}
            </OwlCarousel>
          </div>
        </div>
      </div>
    </section>
  );
}