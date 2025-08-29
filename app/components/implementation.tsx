import { Zap, Settings2, Scale, Gauge } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const steps = [
  {
    icon: Zap,
    title: "Quick Setup",
    description: "Get started in minutes with our guided setup process",
  },
  {
    icon: Settings2,
    title: "Customizable",
    description: "Easy integration with your institution's specific needs",
  },
  {
    icon: Scale,
    title: "Scalable",
    description: "Grows seamlessly with your institution's requirements",
  },
  {
    icon: Gauge,
    title: "Low Requirements",
    description: "Minimal hardware and software requirements for maximum efficiency",
  },
]

export function Implementation() {
  return (
    // <section
    //   id="implementation"
    //   className="py-20 bg-gradient-to-br from-blue-500/5 via-green-500/5 to-blue-500/5 w-full"
    // >
    //   <div className="container mx-auto px-4 md:px-6 lg:px-8 space-y-12">
    //     <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white">
    //       Simple Implementation Process
    //     </h2>
    //     <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
    //       {steps.map((step, index) => (
    //         <Card key={index} className="border-none shadow-sm bg-white dark:bg-gray-800">
    //           <CardContent className="flex flex-col items-center text-center space-y-4 p-6">
    //             <div className="p-3 bg-blue-500/10 rounded-full">
    //               <step.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
    //             </div>
    //             <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{step.title}</h3>
    //             <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
    //           </CardContent>
    //         </Card>
    //       ))}
    //     </div>
    //   </div>
    // </section>
    <section className="analytics_section mb-5">
    <div className="container text-center" style={{position:"relative", zIndex:"5"}}>
      <div className="row">
        <div className="col-lg-12 heading70 text-center" style={{color:"#fff"}}>Analytics Visualizations</div>
      </div>
      <div className="row">
        <div className="col-lg-2"></div>
        <div className="col-lg-8 text-center mb-5" style={{color:"#fff"}}>
          Our AI-powered chatbots are designed to adapt and excel across diverse business needs, driving efficiency and engagement.
        </div>
      </div>

      
      <div className="row text-center">
        {steps.map((step, index) => (
        <div className="col-lg-6 col-sm-6 pt-5 pb-4 analytis_rightboder analytis_bottomboder">
          <div className="row" style={{alignItems:"center"}}>
            <div className="col-lg-6">
              <img src="images/analytics_img.png" className="img-fluid"></img>
            </div>
            <div className="col-lg-6">
              <div className="row">
                <div className="col-lg-12 mb-3 analytis_heading mt-4">{step.title}</div>
                <div className="col-lg-12 mb-4">
                    {step.description}
                </div>
              </div>
            </div>
          </div>
        </div>
        ))}
        {/* <div className="col-lg-12">
          <div className="analytis_sept"><img src="images/analytis_sept.png" className="img-fluid"></img></div>
        </div> */}
      </div>
      
    </div>
    <div className="shape1_box"><img src="images/shape1.png" className="img-fluid"></img></div>
    <div className="purple_shape_btm"><img src="images/purple_shade.png" className="img-fluid"></img></div>
  </section>
  )
}
