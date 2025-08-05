const stats = [
  {
    value: "50+", // Updated from 150+
    label: "Languages Supported",
  },
  {
    value: "<3s", // Updated from <1s
    label: "Response Time",
  },
  {
    value: "1000+",
    label: "Connected Users",
  },
  {
    value: "24/7",
    label: "Availability",
  },
];

export function Stats() {
  return (
    <section className="system_section mb-5">
      <div className="container" style={{ position: "relative", zIndex: "5" }}>
        <div className="row">
          <div className="col-lg-12 heading70 text-center mb-5">
            System Overview at a Glance
          </div>
        </div>
        <div className="row">
          {stats.map((stat, index) => (
            <div key={index} className="col-lg-3 col-6 mb-4 text-center">
              <div className="system_count">{stat.value}</div>
              <div>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="system_globe">
        <img
          src="/images/system_globe_img.png"
          className="img-fluid"
          alt="System globe background"
        ></img>
      </div>
    </section>
    // <section className="py-20 w-full">
    //   <div className="container mx-auto px-4 md:px-6 lg:px-8">
    //     <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
    //       {stats.map((stat, index) => (
    //         <div key={index} className="text-center space-y-2">
    //           <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">{stat.value}</div>
    //           <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
    //         </div>
    //       ))}
    //     </div>
    //   </div>
    // </section>
  );
}

// Add default export for lazy loading
export default Stats;
