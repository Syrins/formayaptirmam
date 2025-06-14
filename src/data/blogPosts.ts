
import { BlogCategory } from "@/types/blog";

// Sample blog categories with correct properties
export const sampleCategories: BlogCategory[] = [
  {
    category: "Football",
    count: 2
  },
  {
    category: "Basketball",
    count: 1
  },
  {
    category: "Volleyball",
    count: 1
  },
  {
    category: "Rugby",
    count: 1
  },
  {
    category: "Tennis",
    count: 1
  }
];

// Sample blog posts with string IDs (not number)
export const sampleBlogPosts = [
  {
    id: "1",
    title: "How to Choose the Right Fabric for Team Jerseys",
    slug: "how-to-choose-right-fabric-for-team-jerseys",
    cover_image: "/blog/fabric-choices.jpg",
    excerpt: "Exploring the best fabric options for different sports and activities to ensure comfort and performance.",
    content: `
      <h2 id="introduction">Introduction</h2>
      <p>When it comes to team sports, the jersey isn't just a uniform—it's equipment. The right fabric can enhance performance, while the wrong choice can hinder athletes. This guide will help you navigate fabric options for team jerseys.</p>
      
      <h2 id="polyester">Polyester: The Popular Choice</h2>
      <p>Polyester dominates the team jersey market, and for good reason. It's lightweight, breathable, and wicks moisture away from the body. Modern polyester blends offer excellent durability and color retention.</p>
      
      <h2 id="cotton-blends">Cotton Blends: Comfort Meets Performance</h2>
      <p>For teams that prioritize comfort, cotton-polyester blends offer the softness of cotton with the performance benefits of synthetic fibers. These blends are ideal for teams that don't face extreme weather conditions.</p>
      
      <h2 id="mesh-fabrics">Mesh Fabrics: Maximum Ventilation</h2>
      <p>Basketball and football teams often opt for mesh fabrics in areas that need maximum ventilation. The tiny holes allow air to circulate freely, keeping players cool during intense activity.</p>
      
      <h2 id="conclusion">Conclusion</h2>
      <p>The ideal fabric depends on your sport, climate, and team preferences. Consider factors like breathability, durability, and comfort when making your decision.</p>
    `,
    category: "Football",
    created_at: "2023-01-15T10:30:00Z",
    updated_at: "2023-01-16T14:45:00Z",
    published: true
  },
  {
    id: "2",
    title: "The History of Basketball Jerseys: From Cotton to High-Tech Fabrics",
    slug: "history-of-basketball-jerseys",
    cover_image: "/blog/basketball-jerseys-history.jpg",
    excerpt: "A fascinating journey through time exploring how basketball jerseys have evolved from simple cotton garments to today's advanced performance wear.",
    content: `
      <h2 id="early-days">The Early Days: Cotton and Simplicity</h2>
      <p>When basketball was first invented in 1891, players wore simple cotton jerseys that were heavy, especially when soaked with sweat. These early uniforms were functional but lacked the performance features we expect today.</p>
      
      <h2 id="mid-century">Mid-Century Developments</h2>
      <p>By the 1950s and 60s, teams began experimenting with synthetic fabrics like nylon and polyester. These materials offered better durability and began to introduce moisture management properties.</p>
      
      <h2 id="modern-era">The Modern Era: Performance Fabrics</h2>
      <p>Today's basketball jerseys use advanced fabrics with moisture-wicking technology, antimicrobial properties, and strategic ventilation zones. These high-tech materials help players perform at their best by regulating body temperature and reducing distractions.</p>
      
      <h2 id="future-trends">Future Trends</h2>
      <p>The future of basketball jerseys may include smart fabrics that monitor vital signs, adjust to temperature changes, or even change colors. As technology advances, we can expect basketball uniforms to continue evolving.</p>
      
      <h2 id="conclusion">Conclusion</h2>
      <p>From simple cotton to high-tech performance fabrics, basketball jerseys reflect the sport's evolution and the increasing focus on player performance and comfort.</p>
    `,
    category: "Basketball",
    created_at: "2023-02-20T09:15:00Z",
    updated_at: "2023-02-21T11:30:00Z",
    published: true
  },
  {
    id: "3",
    title: "Custom Jersey Design Tips for Volleyball Teams",
    slug: "volleyball-jersey-design-tips",
    cover_image: "/blog/volleyball-jerseys.jpg",
    excerpt: "Professional design advice for creating striking and functional volleyball team jerseys that stand out on the court.",
    content: `
      <h2 id="color-selection">Strategic Color Selection</h2>
      <p>Volleyball courts are often brightly lit, making color selection crucial. Opt for colors that complement each other and stand out against the court's background. Consider your team's identity and school or club colors.</p>
      
      <h2 id="number-placement">Number Placement and Size</h2>
      <p>In volleyball, number visibility is essential for officials. Numbers should be large and contrasting on both the front (at least 4 inches) and back (at least 6 inches). Consider how the numbers look when players are in action.</p>
      
      <h2 id="fabric-considerations">Fabric Considerations</h2>
      <p>Volleyball involves constant movement, jumping, and diving. Choose lightweight, stretchy fabrics that allow full range of motion. Moisture-wicking properties are essential to handle intense indoor conditions.</p>
      
      <h2 id="design-elements">Design Elements</h2>
      <p>Incorporate dynamic design elements that reflect the fast-paced nature of volleyball. Diagonal stripes, gradient effects, and asymmetrical patterns can create a sense of movement and energy.</p>
      
      <h2 id="conclusion">Bringing It All Together</h2>
      <p>A great volleyball jersey balances aesthetics with functionality. Work with experienced designers who understand the sport's unique requirements to create jerseys that enhance team identity and performance.</p>
    `,
    category: "Volleyball",
    created_at: "2023-03-05T14:45:00Z",
    updated_at: "2023-03-06T10:20:00Z",
    published: true
  },
  {
    id: "4",
    title: "Rugby Jersey Durability: Materials That Can Take a Tackle",
    slug: "rugby-jersey-durability",
    cover_image: "/blog/rugby-jerseys.jpg",
    excerpt: "Exploring the tough materials and construction techniques used in modern rugby jerseys to withstand the sport's physical demands.",
    content: `
      <h2 id="introduction">Built for Battle</h2>
      <p>Rugby is one of the most physically demanding sports, and jerseys must withstand grabbing, pulling, and constant contact. This article explores how rugby jerseys are designed to survive the rigors of the game.</p>
      
      <h2 id="cotton-polyester">Cotton-Polyester Blends: Traditional Toughness</h2>
      <p>Traditional rugby jerseys use heavy cotton-polyester blends that offer durability and grip resistance. These jerseys are harder to grab and maintain their structure even after multiple washes and matches.</p>
      
      <h2 id="reinforced-seams">Reinforced Seams and Bonding Techniques</h2>
      <p>Modern rugby jerseys employ reinforced seams and bonding techniques to prevent tearing during tackles and scrums. Double or triple-stitched seams create jerseys that can withstand extreme pulling forces.</p>
      
      <h2 id="collar-design">Collar Design and Importance</h2>
      <p>Rugby jersey collars are specifically designed to prevent grabbing and choking hazards. From traditional cotton stand-up collars to modern low-profile designs, collar construction is crucial for player safety.</p>
      
      <h2 id="testing-methods">How Jerseys Are Tested</h2>
      <p>Leading rugby jersey manufacturers put their products through rigorous testing, including abrasion resistance, seam strength, and grab tests. Some even use mechanical claws that simulate the grabbing that occurs during actual play.</p>
      
      <h2 id="conclusion">Conclusion</h2>
      <p>The ideal rugby jersey combines durability with performance features like moisture management. As materials science advances, rugby jerseys continue to evolve to meet the sport's unique demands.</p>
    `,
    category: "Rugby",
    created_at: "2023-04-12T08:30:00Z",
    updated_at: "2023-04-13T13:15:00Z",
    published: true
  },
  {
    id: "5",
    title: "The Science Behind Moisture-Wicking Fabrics in Tennis Apparel",
    slug: "moisture-wicking-fabrics-tennis",
    cover_image: "/blog/tennis-apparel.jpg",
    excerpt: "A deep dive into how advanced moisture-wicking technologies work to keep tennis players cool and dry during intense matches.",
    content: `
      <h2 id="introduction">Why Moisture Management Matters in Tennis</h2>
      <p>Tennis players can lose several liters of sweat during a competitive match. Effective moisture management isn't just about comfort—it's about performance. This article explores the science behind keeping players dry.</p>
      
      <h2 id="capillary-action">Capillary Action: The Core Principle</h2>
      <p>Moisture-wicking fabrics work through capillary action, drawing sweat away from the skin and through the fabric where it can evaporate. Advanced tennis apparel uses specially engineered fibers that enhance this natural physical process.</p>
      
      <h2 id="fiber-construction">Fiber Construction and Surface Area</h2>
      <p>The microscopic construction of performance fibers creates increased surface area for evaporation. Cross-sections of these fibers often reveal star-shaped or channeled structures that maximize moisture transport and evaporation rates.</p>
      
      <h2 id="treatments">Hydrophobic and Hydrophilic Treatments</h2>
      <p>Many tennis garments combine hydrophobic (water-repelling) outer layers with hydrophilic (water-attracting) inner layers to create a moisture gradient that pulls sweat outward, keeping the skin-facing side drier.</p>
      
      <h2 id="testing">How Effectiveness Is Measured</h2>
      <p>Manufacturers test moisture-wicking capabilities through standardized tests like vertical wicking tests, moisture management tests (MMT), and drying rate assessments. These provide quantifiable metrics for performance comparison.</p>
      
      <h2 id="conclusion">The Competitive Edge</h2>
      <p>For competitive tennis players, advanced moisture management can provide meaningful performance benefits by improving comfort, reducing weight gain from sweat absorption, and helping maintain optimal body temperature.</p>
    `,
    category: "Tennis",
    created_at: "2023-05-18T11:00:00Z",
    updated_at: "2023-05-19T09:45:00Z",
    published: true
  }
];
