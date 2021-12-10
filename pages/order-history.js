import axios from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { useEffect, useContext, useReducer } from 'react';
import { getError } from '../utils/error';
import { Store } from '../utils/Store';
import Layout from '../components/Layout';
import {
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, orders: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      state;
  }
}

const OrderHistory = () => {
  const { state } = useContext(Store);
  const router = useRouter();
  const { userInfo } = state;

  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    orders: [],
    error: '',
  });

  useEffect(() => {
    if (!userInfo) {
      router.push('/login');
    }
    const fetchOrders = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/history`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchOrders();
  }, []);

  return (
    <Layout title="Products">
      <div className="container mt-5">
        <div className="columns">
          <div className="column is-4">
            <div className="card">
              <List>
                <NextLink href="/profile" passHref>
                  <ListItem selected button component="a">
                    <ListItemText primary="User Profile"></ListItemText>
                  </ListItem>
                </NextLink>
                <NextLink href="/order-history" passHref>
                  <ListItem button component="a">
                    <ListItemText primary="Order History"></ListItemText>
                  </ListItem>
                </NextLink>
              </List>
            </div>
          </div>
          <div className="column is-8">
            {loading ? (
              <div>
                <CircularProgress />
              </div>
            ) : error ? (
              <h1>{error}</h1>
            ) : (
              <div className="columns">
                <div className="column is-12">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <div className="columns">
                          <div className="column is-8">
                            <h1 className="is-size-4  has-text-link title">
                              Products
                            </h1>
                          </div>
                        </div>
                        <div className="columns">
                          <div className="column is-12">
                            <table className="table is-fullwidth">
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>DATE</th>
                                  <th>TOTAL</th>
                                  <th>PAID</th>
                                  <th>DELIVERED</th>
                                  <th>ACTIONS</th>
                                </tr>
                              </thead>
                              <tbody>
                                {orders.map((order) => (
                                  <tr key={order._id}>
                                    <td>{order._id.substring(20, 24)}</td>
                                    <td>{order.createdAt}</td>
                                    <td>₹ {order.totalPrice}</td>
                                    <td>
                                      {order.isPaid
                                        ? `paid at ${order.paidAt}`
                                        : 'not paid'}
                                    </td>
                                    <td>
                                      {order.isDelivered
                                        ? `Delivered at ${order.deliveredAt}`
                                        : 'Not delivered'}
                                    </td>

                                    <td>
                                      <NextLink
                                        href={`/order/${order._id}`}
                                        passHref
                                      >
                                        <button className="button is-small is-link">
                                          Details
                                        </button>
                                      </NextLink>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(OrderHistory), { ssr: false });
