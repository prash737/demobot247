"use client"

import Image from "next/image"
import dynamic from 'next/dynamic';

const OwlCarousel = dynamic(() => {
  return Promise.resolve().then(async () => {
    // Only load on client side
    if (typeof window !== 'undefined') {
      try {
        await Promise.all([
          import('owl.carousel/dist/assets/owl.carousel.css'),
          import('owl.carousel/dist/assets/owl.theme.default.css')
        ]);
        const module = await import('react-owl-carousel');
        return module;
      } catch (error) {
        console.warn('Failed to load OwlCarousel:', error);
        // Return a fallback component
        return { default: ({ children }: any) => <div className="fallback-carousel">{children}</div> };
      }
    }
    return { default: () => null };
  });
}, {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />
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
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Client%201.jpg-qGhjSFqpkZOsu4SpSQ3OTBh4uSMJUA.jpeg",
    alt: "Evonix Logo",
  },
  {
    name: "QuickKart",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Client%203.jpg-LK7mmtOjwp93cdUw3znRgvNwP480KI.jpeg",
    alt: "QuickKart Logo",
  },
  {
    name: "The Kalyani School",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Client%204.jpg-r7mFCLHZX0Di4h6hAYXXX8WEAl2fpP.jpeg",
    alt: "The Kalyani School Logo",
  },
  {
    name: "Hyp Mobility",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Client%202.jpg-MEkWjv90KVWIPmWXMexx6i9jRO1yIi.jpeg",
    alt: "Hyp Mobility Logo",
  },
]

// OWL-Carousel-START
const options = {
  loop: true,
  autoplay: false,
  nav: false,
  responsive: {
    0: {
      items: 2,  // 👈 Show 2 items on small screens (e.g. mobile)
    },
    600: {
      items: 2,
    },
    1000: {
      items: 5,
    }
  }
};
// OWL-Carousel-END

export function OurClients() {
  return (
    <section className="mb-5 pt-5" id="our-clients">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 heading70 text-center mb-5">Our Clients</div>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <OwlCarousel className='owl-theme' loop items={5} {...options} autoplay>
              {clients.map((client, index) => (
                <div key={index} className="clientlogo_list">
                  <div className="clientlogo_list_inner">
                    <Image src={client.logo || "/placeholder.svg"} alt={client.alt} fill />
                  </div>
                </div>
              ))}
            </OwlCarousel>
          </div>
        </div>
      </div>
    </section>
    // <section id="our-clients" className="py-24 bg-white dark:bg-gray-900 w-full">
    //   <div className="container mx-auto px-4 md:px-6 lg:px-8">
    //     <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Our Clients</h2>

    //     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
    //       {clients.map((client, index) => (
    //         <div key={index} className="w-full flex items-center justify-center">
    //           <div className="relative w-full h-24 md:h-32">
    //             <Image src={client.logo || "/placeholder.svg"} alt={client.alt} fill />
    //           </div>
    //         </div>
    //       ))}
    //     </div>
    //   </div>
    // </section>
  )
}