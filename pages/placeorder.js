import dynamic from 'next/dynamic';
import CheckoutWizard from '../components/CheckoutWizard';
import Layout from '../components/Layout';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../utils/Store';
import NextLink from 'next/link';
import Image from 'next/image';
import { useSnackbar } from 'notistack';
import { getError } from '../utils/error';
import axios from 'axios';
import Cookies from 'js-cookie';
import { CircularProgress } from '@material-ui/core';
import { useRouter } from 'next/router';

const PlaceOrder = () => {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const {
    userInfo,
    cart: { cartItems, shippingAddress, paymentMethod },
  } = state;
  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // 123.456 => 123.46
  const itemsPrice = round2(
    cartItems.reduce((a, c) => a + c.price * c.quantity, 0)
  );
  const shippingPrice = itemsPrice > 200 ? 0 : 15;
  const taxPrice = round2(itemsPrice * 0.15);
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);
  useEffect(() => {
    if (!paymentMethod) {
      router.push('/payment');
    }
    if (cartItems.length === 0) {
      router.push('/cart');
    }
  }, []);

  const { closeSnackbar, enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const placeOrderHandler = async () => {
    closeSnackbar();
    try {
      setLoading(true);
      const { data } = await axios.post(
        '/api/orders',
        {
          orderItems: cartItems,
          shippingAddress,
          paymentMethod,
          itemsPrice,
          shippingPrice,
          taxPrice,
          totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      dispatch({ type: 'CART_CLEAR' });
      Cookies.remove('cartItems');
      setLoading(false);
      router.push(`/order/${data._id}`);
    } catch (err) {
      setLoading(false);
      enqueueSnackbar(getError(err), { variant: 'error' });
    }
  };

  return (
    <Layout title="Place Order">
      <div className="container">
        <CheckoutWizard activeStep={3} />
        <div className="columns">
          <div className="column is-8">
            <div className="card">
              <div className="card-content">
                <h1 className="is-size-5 has-text-link">Shipping Address</h1>
                <p className="is-size-5 has-text-grey mt-3">
                  {shippingAddress.fullName} , {shippingAddress.address},{' '}
                  {shippingAddress.city} , {shippingAddress.postalCode},{' '}
                  {shippingAddress.country}
                </p>
              </div>
            </div>
            <div className="card mt-2">
              <div className="card-content">
                <h1 className="is-size-5 has-text-link">Payment Method</h1>
                <p className="is-size-5 has-text-grey mt-3">{paymentMethod}</p>
              </div>
            </div>
            <div className="card mt-2">
              <div className="card-content">
                <h1 className="is-size-5 has-text-link">Order Items</h1>
                <table className=" table is-fullwidth mt-5">
                  <thead>
                    <tr className="has-text-centered">
                      <th></th>
                      <th className="has-text-link is-size-5 subtitle has-text-left">
                        Name
                      </th>
                      <th className="has-text-link is-size-5 subtitle">
                        Quantity
                      </th>
                      <th className="has-text-link is-size-5 subtitle">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item._id} className="has-text-centered ">
                        <td>
                          <NextLink href={`/product/${item.slug}`} passHref>
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={100}
                              height={100}
                            ></Image>
                          </NextLink>
                        </td>
                        <td className="is-size-5 has-text-grey is-vcentered has-text-left ">
                          {item.name}
                        </td>
                        <td className="is-vcentered is-size-5 has-text-grey">
                          {item.quantity}
                        </td>

                        <td className="is-size-5 has-text-grey is-vcentered">
                          {item.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="column is-4">
            <div className="box">
              <h1 className="is-size-5 has-text-link">Order Summary</h1>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p className="is-size-5 mt-3">Items</p>
                </div>
                <div>
                  {' '}
                  <p className="is-size-5 mt-3"> Rs. {itemsPrice}</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p className="is-size-5 mt-3">Shipping</p>
                </div>
                <div>
                  {' '}
                  <p className="is-size-5 mt-3"> Rs. {shippingPrice}</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p className="is-size-5 mt-3">Tax</p>
                </div>
                <div>
                  {' '}
                  <p className="is-size-5 mt-3"> Rs. {taxPrice}</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p className="is-size-5 mt-3 title">Total</p>
                </div>
                <div>
                  {' '}
                  <p className="is-size-5 mt-3 title"> Rs. {totalPrice}</p>
                </div>
              </div>

              <button
                className="button is-link is-fullwidth is-size-5 mt-5"
                onClick={placeOrderHandler}
              >
                Place Order
              </button>
              {loading && (
                <div>
                  <CircularProgress />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(PlaceOrder), { ssr: false });
