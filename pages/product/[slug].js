import Layout from '../../components/Layout';
import Image from 'next/image';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Link from 'next/link';
import db from '../../utils/db';
import Product from '../../models/Product';
import axios from 'axios';
import { useContext } from 'react';
import { Store } from '../../utils/Store';
import { useRouter } from 'next/router';

const ProductScreen = ({ product }) => {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  if (!product) {
    return <div>Product not found</div>;
  }

  const addToCartHandler = async () => {
    const existItem = state.cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      window.alert('Sorry Product is out of stock');
      return;
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
    router.push('/cart');
  };

  return (
    <Layout title={product.name} description={product.description}>
      <Link href="/" passHref>
        <div className="mt-5">
          <a className="is-size-5  subtitle">
            <ArrowBackIosIcon fontSize="small" /> Back to products
          </a>
        </div>
      </Link>
      <div className="columns">
        <div className="column is-6">
          <figure className="image is-1by1">
            <Image src={product.image} alt={product.name} layout="fill" />
          </figure>
        </div>

        <div className="column" style={{ padding: '20px', marginTop: '65px' }}>
          <h1 className="is-size-4 title">{product.name}</h1>
          <p className="is-size-5 subtitle mt-5">{product.description}</p>
          <div className="content">
            <p className="is-size-5">
              <span className="title is-size-5">Category : </span>
              {product.category}
            </p>
            <p className="is-size-5">
              <span className="title is-size-5">Brand : </span>
              {product.brand}
            </p>
            <p className="is-size-5">
              <span className="title is-size-5">Rating : </span>
              {product.rating}
            </p>
            <p className="is-size-5">
              <span className="title is-size-5">Price : </span>₹ {product.price}
            </p>
            <p className="is-size-5">
              <span className="title is-size-5">Status : </span>
              {product.countInStock > 0
                ? `In Stock (${product.countInStock})`
                : 'Unavailable'}
            </p>
            <button
              className="button is-danger is-normal is-size-5 title is-outlined"
              style={{ width: '300px' }}
              onClick={addToCartHandler}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductScreen;

export async function getServerSideProps(context) {
  const { params } = context;
  const { slug } = params;

  await db.connect();
  const product = await Product.findOne({ slug }).lean();
  await db.disconnect();

  return {
    props: {
      product: db.convertDocToObj(product),
    },
  };
}
