import React, { useContext, useEffect, useReducer, useState } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../../components/Layout';
import { Store } from '../../utils/Store';
import NextLink from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/router';
import CheckoutWizard from '../../components/CheckoutWizard';
import { useSnackbar } from 'notistack';
import { getError } from '../../utils/error';
import { CircularProgress } from '@material-ui/core';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PAY_REQUEST':
      return { ...state, loadingPay: true };
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true };
    case 'PAY_FAIL':
      return { ...state, loadingPay: false, errorPay: action.payload };
    case 'PAY_RESET':
      return { ...state, loadingPay: false, successPay: false, errorPay: '' };
    default:
      state;
  }
}

const Order = ({ params }) => {
  const orderId = params.id;
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
  const router = useRouter();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, error, order, successPay }, dispatch] = useReducer(
    reducer,
    {
      loading: true,
      order: {},
      error: '',
    }
  );
  const {
    shippingAddress,
    paymentMethod,
    orderItems,

    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
  } = order;

  useEffect(() => {
    if (!userInfo) {
      return router.push('/login');
    }
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    if (!order._id || successPay || (order._id && order._id !== orderId)) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: 'PAY_RESET' });
      }
    } else {
      const loadPaypalScript = async () => {
        const { data: clientId } = await axios.get('/api/keys/paypal', {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': clientId,
            currency: 'INR',
          },
        });
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      };
      loadPaypalScript();
    }
  }, [order, successPay]);
  const { closeSnackbar, enqueueSnackbar } = useSnackbar();

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: totalPrice },
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  }
  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: 'PAY_REQUEST' });
        const { data } = await axios.put(
          `/api/orders/${order._id}/pay`,
          details,
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: 'PAY_SUCCESS', payload: data });
        enqueueSnackbar('Order is paid', { variant: 'success' });
      } catch (err) {
        dispatch({ type: 'PAY_FAIL', payload: getError(err) });
        enqueueSnackbar(getError(err), { variant: 'error' });
      }
    });
  }

  function onError(err) {
    enqueueSnackbar(getError(err), { variant: 'error' });
  }
  return (
    <Layout title={`Order ${orderId}`}>
      <div className="container">
        <CheckoutWizard activeStep={3} />
        <h1 className="is-size-5 has-text-link title">Order {orderId}</h1>
        {loading ? (
          <div className="has-text-left">
            <CircularProgress />
          </div>
        ) : error ? (
          <h1 className="is-size-5">{error}</h1>
        ) : (
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
                  <p className="is-size-5 has-text-grey mt-3">
                    Status :{' '}
                    {isDelivered
                      ? `Delivered at ${deliveredAt}`
                      : 'not delivered'}
                  </p>
                </div>
              </div>
              <div className="card mt-2">
                <div className="card-content">
                  <h1 className="is-size-5 has-text-link">Payment Method</h1>
                  <p className="is-size-5 has-text-grey mt-3">
                    {paymentMethod}
                  </p>
                  <p className="is-size-5 has-text-grey mt-3">
                    Status : {isPaid ? `Paid at ${paidAt}` : 'not paid'}
                  </p>
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
                      {orderItems.map((item) => (
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
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <div>
                    <p className="is-size-5 mt-3">Items</p>
                  </div>
                  <div>
                    {' '}
                    <p className="is-size-5 mt-3"> Rs. {itemsPrice}</p>
                  </div>
                </div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <div>
                    <p className="is-size-5 mt-3">Shipping</p>
                  </div>
                  <div>
                    {' '}
                    <p className="is-size-5 mt-3"> Rs. {shippingPrice}</p>
                  </div>
                </div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <div>
                    <p className="is-size-5 mt-3">Tax</p>
                  </div>
                  <div>
                    {' '}
                    <p className="is-size-5 mt-3"> Rs. {taxPrice}</p>
                  </div>
                </div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <div>
                    <p className="is-size-5 mt-3 title">Total</p>
                  </div>
                  <div>
                    {' '}
                    <p className="is-size-5 mt-3 title"> Rs. {totalPrice}</p>
                  </div>
                </div>
                <div className="mt-5">
                  {!isPaid && (
                    <div>
                      {isPending ? (
                        <CircularProgress />
                      ) : (
                        <PayPalButtons
                          createOrder={createOrder}
                          onApprove={onApprove}
                          onError={onError}
                        ></PayPalButtons>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export async function getServerSideProps({ params }) {
  return { props: { params } };
}

export default dynamic(() => Promise.resolve(Order), { ssr: false });
