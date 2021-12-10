import {
  Box,
  Button,
  Grid,
  List,
  ListItem,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
import CancelIcon from '@material-ui/icons/Cancel';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import Layout from '../components/Layout';
import db from '../utils/db';
import Product from '../models/Product';
import ProductItem from '../components/ProductItem';
import { Store } from '../utils/Store';
import axios from 'axios';
import Rating from '@material-ui/lab/Rating';
import { Pagination } from '@material-ui/lab';
// import useStyles from '../utils/styles';

const PAGE_SIZE = 3;

const prices = [
  {
    name: 'Rs.1000 to Rs.20000',
    value: '1000-20000',
  },
  {
    name: 'Rs.21000 to Rs.50000',
    value: '21000-50000',
  },
  {
    name: 'Rs.51000 to Rs.100000',
    value: '51000-100000',
  },
  {
    name: 'Rs.100000 and above',
    value: '100000-1000000',
  },
];

const ratings = [1, 2, 3, 4, 5];

const Search = (props) => {
  //   const classes = useStyles();
  const router = useRouter();
  const {
    query = 'all',
    category = 'all',
    brand = 'all',
    price = 'all',
    rating = 'all',
    sort = 'featured',
  } = router.query;
  const { products, countProducts, categories, brands, pages } = props;

  const filterSearch = ({
    page,
    category,
    brand,
    sort,
    min,
    max,
    searchQuery,
    price,
    rating,
  }) => {
    const path = router.pathname;
    const { query } = router;
    if (page) query.page = page;
    if (searchQuery) query.searchQuery = searchQuery;
    if (sort) query.sort = sort;
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (price) query.price = price;
    if (rating) query.rating = rating;
    if (min) query.min ? query.min : query.min === 0 ? 0 : min;
    if (max) query.max ? query.max : query.max === 0 ? 0 : max;

    router.push({
      pathname: path,
      query: query,
    });
  };
  const categoryHandler = (e) => {
    filterSearch({ category: e.target.value });
  };
  const pageHandler = (e, page) => {
    filterSearch({ page });
  };
  const brandHandler = (e) => {
    filterSearch({ brand: e.target.value });
  };
  const sortHandler = (e) => {
    filterSearch({ sort: e.target.value });
  };
  const priceHandler = (e) => {
    filterSearch({ price: e.target.value });
  };
  const ratingHandler = (e) => {
    filterSearch({ rating: e.target.value });
  };

  const { state, dispatch } = useContext(Store);
  const addToCartHandler = async (product) => {
    const existItem = state.cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
    router.push('/cart');
  };
  return (
    <Layout title="Search">
      <div className="container mt-5">
        <div className="columns">
          <div className="column is-3">
            <div className="card mt-5">
              <div className="card-content">
                <List>
                  <ListItem>
                    <Box>
                      <h1 className="is-size-5 has-text-link">Categories</h1>
                      <Select
                        fullWidth
                        value={category}
                        onChange={categoryHandler}
                      >
                        <MenuItem value="all">All</MenuItem>
                        {categories &&
                          categories.map((category) => (
                            <MenuItem key={category} value={category}>
                              {category}
                            </MenuItem>
                          ))}
                      </Select>
                    </Box>
                  </ListItem>
                  <ListItem>
                    <Box>
                      <h1 className="is-size-5 has-text-link">Brands</h1>
                      <Select value={brand} onChange={brandHandler} fullWidth>
                        <MenuItem value="all">All</MenuItem>
                        {brands &&
                          brands.map((brand) => (
                            <MenuItem key={brand} value={brand}>
                              {brand}
                            </MenuItem>
                          ))}
                      </Select>
                    </Box>
                  </ListItem>
                  <ListItem>
                    <Box>
                      <h1 className="is-size-5 has-text-link">Prices</h1>
                      <Select value={price} onChange={priceHandler} fullWidth>
                        <MenuItem value="all">All</MenuItem>
                        {prices.map((price) => (
                          <MenuItem key={price.value} value={price.value}>
                            {price.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>
                  </ListItem>
                  <ListItem>
                    <Box>
                      <h1 className="is-size-5 has-text-link">Ratings</h1>
                      <Select value={rating} onChange={ratingHandler} fullWidth>
                        <MenuItem value="all">All</MenuItem>
                        {ratings.map((rating) => (
                          <MenuItem dispaly="flex" key={rating} value={rating}>
                            <Rating value={rating} readOnly />
                            <Typography component="span">&amp; Up</Typography>
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>
                  </ListItem>
                </List>
              </div>
            </div>
          </div>
          <div className="column is-8 mt-5">
            <div className="columns">
              <div className="column is-8">
                <p className="is-size-6 has-text-link">
                  {products.length === 0 ? 'No' : countProducts} Results
                  {query !== 'all' && query !== '' && ' : ' + query}
                  {category !== 'all' && ' : ' + category}
                  {brand !== 'all' && ' : ' + brand}
                  {price !== 'all' && ' : Price ' + price}
                  {rating !== 'all' && ' : Rating ' + rating + ' & up'}
                  {(query !== 'all' && query !== '') ||
                  category !== 'all' ||
                  brand !== 'all' ||
                  rating !== 'all' ||
                  price !== 'all' ? (
                    <Button onClick={() => router.push('/search')}>
                      <CancelIcon />
                    </Button>
                  ) : null}
                </p>
              </div>
              <div className="column is-4 has-text-right">
                <Grid item>
                  <Typography component="span">Sort by </Typography>
                  <Select value={sort} onChange={sortHandler}>
                    <MenuItem value="featured">Featured</MenuItem>
                    <MenuItem value="lowest">Price: Low to High</MenuItem>
                    <MenuItem value="highest">Price: High to Low</MenuItem>
                    <MenuItem value="toprated">Customer Reviews</MenuItem>
                    <MenuItem value="newest">Newest Arrivals</MenuItem>
                  </Select>
                </Grid>
              </div>
            </div>
            <div className="columns is-multiline">
              {products.map((product) => (
                <div className="column is-4" key={product.name}>
                  <ProductItem
                    product={product}
                    addToCartHandler={addToCartHandler}
                  />
                </div>
              ))}
            </div>
            <Pagination
              defaultPage={parseInt(query.page || '1')}
              count={pages}
              onChange={pageHandler}
            ></Pagination>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export async function getServerSideProps({ query }) {
  await db.connect();
  const pageSize = query.pageSize || PAGE_SIZE;
  const page = query.page || 1;
  const category = query.category || '';
  const brand = query.brand || '';
  const price = query.price || '';
  const rating = query.rating || '';
  const sort = query.sort || '';
  const searchQuery = query.query || '';

  const queryFilter =
    searchQuery && searchQuery !== 'all'
      ? {
          name: {
            $regex: searchQuery,
            $options: 'i',
          },
        }
      : {};
  const categoryFilter = category && category !== 'all' ? { category } : {};
  const brandFilter = brand && brand !== 'all' ? { brand } : {};
  const ratingFilter =
    rating && rating !== 'all'
      ? {
          rating: {
            $gte: Number(rating),
          },
        }
      : {};
  // 10-50
  const priceFilter =
    price && price !== 'all'
      ? {
          price: {
            $gte: Number(price.split('-')[0]),
            $lte: Number(price.split('-')[1]),
          },
        }
      : {};

  const order =
    sort === 'featured'
      ? { featured: -1 }
      : sort === 'lowest'
      ? { price: 1 }
      : sort === 'highest'
      ? { price: -1 }
      : sort === 'toprated'
      ? { rating: -1 }
      : sort === 'newest'
      ? { createdAt: -1 }
      : { _id: -1 };

  const categories = await Product.find().distinct('category');
  const brands = await Product.find().distinct('brand');
  const productDocs = await Product.find(
    {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...brandFilter,
      ...ratingFilter,
    },
    '-reviews'
  )
    .sort(order)
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    .lean();

  const countProducts = await Product.countDocuments({
    ...queryFilter,
    ...categoryFilter,
    ...priceFilter,
    ...brandFilter,
    ...ratingFilter,
  });
  await db.disconnect();

  const products = productDocs.map(db.convertDocToObj);

  return {
    props: {
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
      categories,
      brands,
    },
  };
}

export default Search;
