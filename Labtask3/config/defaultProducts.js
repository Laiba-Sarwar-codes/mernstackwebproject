const defaultProducts = [
  { name: "TAMAR - L43041", oldPrice: 6999, price: 5599, category: "Sandals", rating: 4.6, stock: 14, image: "/images/image1.webp", colors: 3, discount: 20, newArrival: true },
  { name: "TAMAR - L43040", oldPrice: 6999, price: 5599, category: "Sandals", rating: 4.4, stock: 18, image: "/images/image2.webp", colors: 3, discount: 20, newArrival: true },
  { name: "TAMAR - L43039", oldPrice: 6999, price: 5599, category: "Sandals", rating: 4.5, stock: 9, image: "/images/image3.webp", colors: 3, discount: 20, newArrival: true },
  { name: "ALLEGRA - L43020", oldPrice: 8499, price: 6799, category: "Comfort", rating: 4.7, stock: 11, image: "/images/image4.webp", colors: 3, discount: 20, newArrival: true },
  { name: "ENOLA - L42990", oldPrice: 7999, price: 6399, category: "Courts", rating: 4.3, stock: 8, image: "/images/image5.webp", colors: 2, discount: 20, newArrival: true },
  { name: "ENOLA - L42991", oldPrice: 7999, price: 6399, category: "Courts", rating: 4.2, stock: 15, image: "/images/image6.webp", colors: 2, discount: 20, newArrival: true },
  { name: "SOFIA - L43110", oldPrice: 5999, price: 4799, category: "Slippers", rating: 4.1, stock: 22, image: "/images/image7.webp", colors: 4, discount: 20, newArrival: true },
  { name: "SOFIA - L43111", oldPrice: 5999, price: 4799, category: "Slippers", rating: 4.0, stock: 20, image: "/images/image8.webp", colors: 4, discount: 20, newArrival: true },
  { name: "MAYA - L43201", oldPrice: 7499, price: 5999, category: "Ballerinas", rating: 4.5, stock: 13, image: "/images/image9.webp", colors: 3, discount: 20, newArrival: true },
  { name: "MAYA - L43202", oldPrice: 7499, price: 5999, category: "Ballerinas", rating: 4.6, stock: 17, image: "/images/image10.webp", colors: 3, discount: 20, newArrival: true },
  { name: "ELIZA - L43314", oldPrice: 8999, price: 7199, category: "Moccasins", rating: 4.8, stock: 7, image: "/images/image11.webp", colors: 2, discount: 20, newArrival: true },
  { name: "ELIZA - L43315", oldPrice: 8999, price: 7199, category: "Moccasins", rating: 4.3, stock: 10, image: "/images/image12.webp", colors: 2, discount: 20, newArrival: true },
  { name: "NOOR - L43401", oldPrice: 6499, price: 5199, category: "Khussa", rating: 4.7, stock: 16, image: "/images/image13.webp", colors: 5, discount: 20, newArrival: true },
  { name: "NOOR - L43402", oldPrice: 6499, price: 5199, category: "Khussa", rating: 4.4, stock: 19, image: "/images/image14.webp", colors: 5, discount: 20, newArrival: true },
  { name: "ZARA - L43510", oldPrice: 9999, price: 7999, category: "Comfort", rating: 4.9, stock: 6, image: "/images/image15.webp", colors: 2, discount: 20, newArrival: true },
  { name: "ZARA - L43511", oldPrice: 9999, price: 7999, category: "Comfort", rating: 4.8, stock: 5, image: "/images/image16.webp", colors: 2, discount: 20, newArrival: true },
  { name: "AMARA - L43621", oldPrice: 6999, price: 5599, category: "Sandals", rating: 4.2, stock: 21, image: "/images/image17.webp", colors: 3, discount: 20, newArrival: true },
  { name: "AMARA - L43622", oldPrice: 6999, price: 5599, category: "Sandals", rating: 4.1, stock: 18, image: "/images/image18.webp", colors: 3, discount: 20, newArrival: true },
  { name: "RANIA - L43730", oldPrice: 5499, price: 4399, category: "Slippers", rating: 4.0, stock: 25, image: "/images/image19.webp", colors: 4, discount: 20, newArrival: true },
  { name: "RANIA - L43731", oldPrice: 5499, price: 4399, category: "Slippers", rating: 4.2, stock: 24, image: "/images/image20.webp", colors: 4, discount: 20, newArrival: true },
  { name: "NOVA - L43801", oldPrice: 8499, price: 6799, category: "Courts", rating: 4.6, stock: 12, image: "/images/image1.webp", colors: 3, discount: 20, newArrival: true },
  { name: "NOVA - L43802", oldPrice: 8499, price: 6799, category: "Courts", rating: 4.7, stock: 13, image: "/images/image2.webp", colors: 3, discount: 20, newArrival: true },
  { name: "ALINA - L43901", oldPrice: 7999, price: 6399, category: "Ballerinas", rating: 4.4, stock: 15, image: "/images/image3.webp", colors: 2, discount: 20, newArrival: true },
  { name: "ALINA - L43902", oldPrice: 7999, price: 6399, category: "Ballerinas", rating: 4.5, stock: 9, image: "/images/image4.webp", colors: 2, discount: 20, newArrival: true }
];

module.exports = defaultProducts;
