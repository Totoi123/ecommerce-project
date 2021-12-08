import Layout from '../components/Layout';
import Image from 'next/image';
import NextLink from 'next/link';
import db from '../utils/db';
import Product from '../models/Product';
import axios from 'axios';
import { useContext } from 'react';
import { Store } from '../utils/Store';

const Home = ({ products }) => {
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
      <h1 className="is-size-3 has-text-link-dark title mt-4">Products</h1>
      <div className="columns is-multiline">
        {products.map((product) => (
          <div className="column is-3" key={product.name}>
            <div className="card">
              <NextLink href={`/product/${product.slug}`} passHref>
                <div>
                  <div className="card-image">
                    <figure className="image is-1by1">
                      <Image
                        src={product.image}
                        alt={product.name}
                        layout="fill"
                      />
                    </figure>
                  </div>
                  <div className="card-content">
                    <div className="content">
                      <p className="is-size-4 title">{product.name}</p>
                      <p className="is-size-4 subtitle">₹ {product.price}</p>
                    </div>
                  </div>
                </div>
              </NextLink>

              <footer className="card-footer p-2">
                <button
                  className="button is-danger is-fullwidth is-size-5 title"
                  onClick={() => addToCartHandler(product)}
                >
                  Add to Cart
                </button>
              </footer>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Home;

export async function getServerSideProps() {
  await db.connect();
  const products = await Product.find({}).lean();
  await db.disconnect();

  return {
    props: {
      products: products.map(db.convertDocToObj),
    },
  };
}
