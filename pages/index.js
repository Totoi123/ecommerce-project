import Layout from '../components/Layout';
import NextLink from 'next/link';
import db from '../utils/db';
import Product from '../models/Product';
import axios from 'axios';
import { useContext } from 'react';
import { Store } from '../utils/Store';
import ProductItem from '../components/ProductItem';
import Carousel from 'react-material-ui-carousel';
import { Link } from '@material-ui/core';
const Home = ({ topRatedProductsDocs, featuredProductsDocs }) => {
  const { state, dispatch } = useContext(Store);

  const addToCartHandler = async (product) => {
    const existItem = state.cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;

    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      window.alert('Sorry Product is out of stock');
      return;
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
  };
  return (
    <Layout title="Home">
      <section className="hero is-small">
        <Carousel animation="slide">
          {featuredProductsDocs.map((product) => (
            <NextLink
              key={product._id}
              href={`/product/${product.slug}`}
              passHref
            >
              <Link>
                <img
                  src={product.featuredImage}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '500px',
                  }}
                ></img>
              </Link>
            </NextLink>
          ))}
        </Carousel>
      </section>

      <h2 className="is-size-3 has-text-link-dark title mt-4">
        Popular Products
      </h2>
      <div className="columns is-multiline">
        {topRatedProductsDocs.map((product) => (
          <div className="column is-3" key={product.name}>
            <ProductItem
              product={product}
              addToCartHandler={addToCartHandler}
            />
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Home;

export async function getServerSideProps() {
  await db.connect();
  const featuredProductsDocs = await Product.find(
    { isFeatured: true },
    '-reviews'
  )
    .lean()
    .limit(3);
  const topRatedProductsDocs = await Product.find({}, '-reviews')
    .lean()
    .sort({
      rating: -1,
    })
    .limit(8);
  await db.disconnect();

  return {
    props: {
      featuredProductsDocs: featuredProductsDocs.map(db.convertDocToObj),
      topRatedProductsDocs: topRatedProductsDocs.map(db.convertDocToObj),
    },
  };
}
