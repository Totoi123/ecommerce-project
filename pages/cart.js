import Layout from '../components/Layout';
import dynamic from 'next/dynamic';
import { useContext } from 'react';
import { Store } from '../utils/Store';
import NextLink from 'next/link';
import EmptyCart from '../components/EmptyCart';
import Image from 'next/image';
import { MenuItem, Select } from '@material-ui/core';
import axios from 'axios';
import { useRouter } from 'next/router';

const CartScreen = () => {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);

  const {
    cart: { cartItems },
  } = state;

  const updateCartHandler = async (item, quantity) => {
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry Product is out of stock');
      return;
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...item, quantity } });
  };

  const removeItemHandler = (item) => {
    dispatch({ type: 'CART_REMOVE_ITEM', payload: item });
  };

  const checkoutHandler = () => {
    router.push('/shipping');
  };

  return (
    <Layout title={`Cart`}>
      {cartItems.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="container ">
          <h1 className="is-size-4 mt-5 has-text-left">{`Shopping cart (${cartItems.length} items)`}</h1>

          <table className="table is-fullwidth  mt-5">
            <thead>
              <tr className="has-text-centered">
                <th></th>
                <th className="has-text-link is-size-4 subtitle has-text-left">
                  Name
                </th>
                <th className="has-text-link is-size-4 subtitle">Quantity</th>
                <th className="has-text-link is-size-4 subtitle">Price</th>
                <th className="has-text-link is-size-4 subtitle ">Action</th>
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
                  <td className="is-size-4 has-text-grey is-vcentered has-text-left ">
                    {item.name}
                  </td>
                  <td className="is-vcentered">
                    <Select
                      value={item.quantity}
                      onChange={(e) => updateCartHandler(item, e.target.value)}
                    >
                      {[...Array(item.countInStock).keys()].map((x) => (
                        <MenuItem key={x + 1} value={x + 1}>
                          {x + 1}
                        </MenuItem>
                      ))}
                    </Select>
                  </td>

                  <td className="is-size-4 has-text-grey is-vcentered">
                    {item.price}
                  </td>
                  <td className="is-vcentered">
                    <button
                      className="button is-danger"
                      onClick={() => removeItemHandler(item)}
                    >
                      Delete Item
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="container mt-5 mb-6">
            <div
              className="columns"
              style={{ display: 'flex', justifyContent: 'right' }}
            >
              <div className="column is-4 p-5">
                <h1 className="has-text-link-dark is-size-4 p-4">
                  Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)}{' '}
                  items) : <br /> Rs.{' '}
                  {cartItems.reduce((a, c) => a + c.quantity * c.price, 0)}
                </h1>

                <button
                  className="button is-link title is-fullwidth is-size-5"
                  onClick={checkoutHandler}
                >
                  Check Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(CartScreen), { ssr: false });
