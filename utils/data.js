import bcrypt from 'bcryptjs';

const data = {
  users: [
    {
      name: 'Naocha',
      email: 'admin@example.com',
      password: bcrypt.hashSync('autodesk'),
      isAdmin: true,
    },
    {
      name: 'Somojit',
      email: 'user@example.com',
      password: bcrypt.hashSync('autodesk'),
      isAdmin: false,
    },
  ],
  products: [
    {
      name: 'iPhone 13',
      slug: 'iphone_13',
      category: 'smartphone',
      image: '/images/iphone13.jpg',
      price: 89900,
      brand: 'iPhone',
      rating: 4.5,
      numReviewes: 20,
      countInStock: 30,
      description: 'Apple iPhone 13 (256GB)- Pink',
    },
    {
      name: 'iPhone 13 Mini',
      slug: 'iphone_13_mini',
      category: 'smartphone',
      image: '/images/iphone13Mini.jpg',
      price: 69900,
      brand: 'iPhone',
      rating: 4.5,
      numReviewes: 20,
      countInStock: 30,
      description: 'Apple iPhone 13 Mini (128GB)',
    },
    {
      name: 'iPhone 12 Pro',
      slug: 'iphone_12_pro',
      category: 'smartphone',
      image: '/images/iphone12.jpg',
      price: 69900,
      brand: 'iPhone',
      rating: 4.5,
      numReviewes: 20,
      countInStock: 30,
      description: 'Apple iPhone 12 (256GB)- Space Grey',
    },
    {
      name: 'Apple Watch SE',
      slug: 'iphone_watch_se',
      category: 'smartwatch',
      image: '/images/watchse.jpg',
      price: 32900,
      brand: 'iPhone',
      rating: 4.5,
      numReviewes: 20,
      countInStock: 30,
      description:
        'New Apple Watch SE (GPS, 44mm) - Space Grey Aluminium case with Black Sport Band',
    },
  ],
};

export default data;
