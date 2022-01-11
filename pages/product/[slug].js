import Layout from '../../components/Layout';
import Image from 'next/image';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Link from 'next/link';
import db from '../../utils/db';
import Product from '../../models/Product';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../../utils/Store';
import { useRouter } from 'next/router';
import { TextField, CircularProgress, ListItem, List } from '@material-ui/core';
import Rating from '@material-ui/lab/Rating';
import { getError } from '../../utils/error';
import { useSnackbar } from 'notistack';

const ProductScreen = ({ product }) => {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { userInfo } = state;
  const { enqueueSnackbar } = useSnackbar();

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `/api/products/${product._id}/reviews`,
        {
          rating,
          comment,
        },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      setLoading(false);
      enqueueSnackbar('Review submitted successfully', { variant: 'success' });
      fetchReviews();
    } catch (err) {
      setLoading(false);
      enqueueSnackbar(getError(err), { variant: 'error' });
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/products/${product._id}/reviews`);
      setReviews(data);
    } catch (err) {
      enqueueSnackbar(getError(err), { variant: 'error' });
    }
  };
  useEffect(() => {
    fetchReviews();
  }, []);

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
          <h1 className="is-size-4 title ">{product.name}</h1>
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
              <span className="title is-size-5">Price : </span>₹ {product.price}
            </p>
            <p className="is-size-5">
              <span className="title is-size-5">Status : </span>
              {product.countInStock > 0
                ? `In Stock (${product.countInStock})`
                : 'Unavailable'}
            </p>
            <p className="is-size-5">
              <Rating value={product.rating} readOnly></Rating>
              <Link href="#reviews">
                <a className="is-size-5 has-text-grey ml-2 mb-3">
                  ({product.numReviews} reviews)
                </a>
              </Link>
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
      <div className="columns">
        <div className="container">
          <div className="column">
            <h1 className="is-size-5 has-text-link title">Customer Reviews</h1>
            {reviews.length === 0 && <p className="is-size-5">No review</p>}
            {reviews.map((review) => (
              <div className="card" key={review._id}>
                <div className="card-content">
                  <div className="columns">
                    <div className="column is-4">
                      <p className="is-size-5">
                        <strong>{review.name}</strong>
                      </p>
                      <p className="is-size-5">
                        {review.createdAt.substring(0, 10)}
                      </p>
                    </div>
                    <div className="column is-8">
                      <Rating value={review.rating} readOnly></Rating>
                      <p className="is-size-5">{review.comment}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="columns">
        <div className="column">
          {userInfo ? (
            <form onSubmit={submitHandler}>
              <List>
                <ListItem>
                  <h1 className="is-size-5 has-text-link-title">
                    Leave your review
                  </h1>
                </ListItem>
                <ListItem>
                  <TextField
                    multiline
                    variant="outlined"
                    fullWidth
                    name="review"
                    label="Enter comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </ListItem>
                <ListItem>
                  <Rating
                    name="simple-controlled"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  />
                </ListItem>
                <ListItem>
                  <button type="submit" className="button is-size-5 is-link">
                    Submit
                  </button>

                  {loading && <CircularProgress></CircularProgress>}
                </ListItem>
              </List>
            </form>
          ) : (
            <h2 className="is-size-5">
              Please{' '}
              <Link href={`/login?redirect=/product/${product.slug}`}>
                <a className="is-size-5">Login</a>
              </Link>{' '}
              to write a review
            </h2>
          )}
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
  const product = await Product.findOne({ slug }, '-reviews').lean();
  await db.disconnect();

  return {
    props: {
      product: db.convertDocToObj(product),
    },
  };
}
