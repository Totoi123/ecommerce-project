import Layout from '../components/Layout';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Store from '../utils/Store';
import CheckoutWizard from '../components/CheckoutWizard';
import Cookies from 'js-cookie';
import {
  FormControl,
  List,
  ListItem,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@material-ui/core';
import { useSnackbar } from 'notistack';

const Payment = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('');
  const { state, dispatch } = useContext(Store);

  const {
    cart: { shippingAddress },
  } = state;

  useEffect(() => {
    if (!shippingAddress.address) {
      router.push('/shipping');
    } else {
      setPaymentMethod(Cookies.get('paymentMethod') || '');
    }
  }, []);

  const submitHandler = (e) => {
    closeSnackbar();
    e.preventDefault();
    if (!paymentMethod) {
      enqueueSnackbar('Payment method is required', { variant: 'error' });
    } else {
      dispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethod });
      Cookies.set('paymentMethod', paymentMethod);
      router.push('/placeorder');
    }
  };

  return (
    <Layout title="Payment">
      <div className="container has-text-centered">
        <CheckoutWizard activeStep={2} />

        <form
          onSubmit={submitHandler}
          style={{ maxWidth: '1000px', margin: '0 auto' }}
        >
          <h1 className="is-size-2 has-text-link has-text-left mt-5">
            Payment Method
          </h1>
          <List>
            <ListItem>
              <FormControl component="fieldset">
                <RadioGroup
                  aria-label="Payment Method"
                  name="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <FormControlLabel
                    label="Paypal"
                    value="PayPal"
                    control={<Radio />}
                  ></FormControlLabel>
                  <FormControlLabel
                    label="Cash"
                    value="Cash"
                    control={<Radio />}
                  ></FormControlLabel>
                </RadioGroup>
              </FormControl>
            </ListItem>
            <ListItem>
              <button
                className="button is-link is-fullwidth is-outlined is-size-5"
                type="submit"
              >
                Continue
              </button>
            </ListItem>
            <ListItem>
              <button
                className="button is-link is-fullwidth is-outlined is-size-5"
                type="submit"
                onClick={() => router.push('/shipping')}
              >
                Back
              </button>
            </ListItem>
          </List>
        </form>
      </div>
    </Layout>
  );
};

export default Payment;
