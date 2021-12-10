import React, { useContext, useEffect, useReducer, useState } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../../components/Layout';
import { Store } from '../../utils/Store';
import NextLink from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { getError } from '../../utils/error';
import { CircularProgress } from '@material-ui/core';

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
    case 'DELIVER_REQUEST':
      return { ...state, loadingDeliver: true };
    case 'DELIVER_SUCCESS':
      return { ...state, loadingDeliver: false, successDeliver: true };
    case 'DELIVER_FAIL':
      return { ...state, loadingDeliver: false, errorDeliver: action.payload };
    case 'DELIVER_RESET':
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: false,
        errorDeliver: '',
      };
    default:
      state;
  }
}
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

const Order = ({ params }) => {
  const orderId = params.id;
  const router = useRouter();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [
    { loading, error, order, successPay, loadingDeliver, successDeliver },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
  });
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
    if (
      !order._id ||
      successPay ||
      successDeliver ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: 'PAY_RESET' });
      }
      if (successDeliver) {
        dispatch({ type: 'DELIVER_RESET' });
      }
    }
  }, [order, successPay, successDeliver]);
  const { closeSnackbar, enqueueSnackbar } = useSnackbar();

  async function displayRazorpay(order) {
    const res = await loadScript(
      'https://checkout.razorpay.com/v1/checkout.js'
    );

    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    const options = {
      key: 'rzp_test_SzmHg89AV5ifAN',
      currency: 'INR',
      amount: order.totalPrice.toString() * 100,
      order_id: { orderId },
      name: 'Ecommerce Ceckout',
      handler: async function (response) {
        const razorPayPaymentId = response.razorpay_payment_id;

        try {
          closeSnackbar();
          dispatch({ type: 'PAY_REQUEST' });
          const { data } = await axios.put(
            `/api/orders/${order._id}/pay`,
            razorPayPaymentId,
            { headers: { authorization: `Bearer ${userInfo.token}` } }
          );
          dispatch({ type: 'PAY_SUCCESS', payload: data });
          enqueueSnackbar('Payment Successful', { variant: 'success' });
        } catch (err) {
          dispatch({ type: 'PAY_FAIL', payload: getError(err) });
          enqueueSnackbar(getError(err), { variant: 'error' });
        }
      },
      prefill: {
        email: 'sdfdsjfh2@ndsfdf.com',
        phone_number: '9899999999',
      },
    };
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  }

  async function deliverOrderHandler() {
    try {
      dispatch({ type: 'DELIVER_REQUEST' });
      const { data } = await axios.put(
        `/api/orders/${order._id}/deliver`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'DELIVER_SUCCESS', payload: data });
      enqueueSnackbar('Order is delivered', { variant: 'success' });
    } catch (err) {
      dispatch({ type: 'DELIVER_FAIL', payload: getError(err) });
      enqueueSnackbar(getError(err), { variant: 'error' });
    }
  }

  return (
    <Layout title={`Order ${orderId}`}>
      <div className="container mt-6">
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
                      <button
                        className="button is-link is-fullwidth"
                        onClick={() => displayRazorpay(order)}
                      >
                        Pay Now
                      </button>
                    </div>
                  )}
                  {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                    <div className="mt-5">
                      {loadingDeliver && <CircularProgress />}
                      <button
                        className="button is-link is-fullwidth"
                        onClick={deliverOrderHandler}
                      >
                        Deliver Order
                      </button>
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
