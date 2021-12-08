import Layout from '../components/Layout';
import { List, ListItem, TextField } from '@material-ui/core';
import { useContext, useEffect } from 'react';
import { Store } from '../utils/Store';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { Controller, useForm } from 'react-hook-form';
import CheckoutWizard from '../components/CheckoutWizard';

const Shipping = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();

  const { state, dispatch } = useContext(Store);
  const router = useRouter();
  const { redirect } = router.query;
  const {
    userInfo,
    cart: { shippingAddress },
  } = state;
  useEffect(() => {
    if (!userInfo) {
      router.push('/login?redirect=/shipping');
    }
    setValue('fullName', shippingAddress.fullName);
    setValue('address', shippingAddress.address);
    setValue('city', shippingAddress.city);
    setValue('postalCode', shippingAddress.postalCode);
    setValue('country', shippingAddress.country);
  }, []);

  const submitHandler = ({ fullName, address, city, postalCode, country }) => {
    dispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: { fullName, address, city, postalCode, country },
    });
    Cookies.set('shippingAddress', {
      fullName,
      address,
      city,
      postalCode,
      country,
    });
    router.push('/payment');
  };
  return (
    <Layout title="Shipping">
      <section className="hero  is-fullheight-with-navbar">
        <div className="hero-body">
          <div className="container has-text-centered">
            <CheckoutWizard activeStep={1} />
            <h1 className="title has-text-link is-size-1">Shipping Address</h1>
            <form
              style={{ maxWidth: '800px', margin: '0 auto' }}
              onSubmit={handleSubmit(submitHandler)}
            >
              <List>
                <ListItem>
                  <Controller
                    name="fullName"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: true,
                      minLength: 4,
                    }}
                    render={({ field }) => (
                      <TextField
                        variant="outlined"
                        fullWidth
                        id="fullName"
                        label="Full Name"
                        error={Boolean(errors.fullName)}
                        helperText={
                          errors.fullName
                            ? errors.fullName.type === 'minLength'
                              ? 'Full Name must be at least 4 characters long'
                              : 'Full Name is required'
                            : ''
                        }
                        {...field}
                      ></TextField>
                    )}
                  ></Controller>
                </ListItem>

                <ListItem>
                  <Controller
                    name="address"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: true,
                      minLength: 4,
                    }}
                    render={({ field }) => (
                      <TextField
                        variant="outlined"
                        fullWidth
                        id="address"
                        label="Address"
                        error={Boolean(errors.address)}
                        helperText={
                          errors.address
                            ? errors.address.type === 'minLength'
                              ? 'Address must be at least 4 characters long'
                              : 'Address is required'
                            : ''
                        }
                        {...field}
                      ></TextField>
                    )}
                  ></Controller>
                </ListItem>

                <ListItem>
                  <Controller
                    name="city"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: true,
                      minLength: 2,
                    }}
                    render={({ field }) => (
                      <TextField
                        variant="outlined"
                        fullWidth
                        id="city"
                        label="City"
                        error={Boolean(errors.city)}
                        helperText={
                          errors.city
                            ? errors.city.type === 'minLength'
                              ? 'City must be at least 2 characters long'
                              : 'City is required'
                            : ''
                        }
                        {...field}
                      ></TextField>
                    )}
                  ></Controller>
                </ListItem>

                <ListItem>
                  <Controller
                    name="postalCode"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: true,
                      minLength: 6,
                    }}
                    render={({ field }) => (
                      <TextField
                        variant="outlined"
                        fullWidth
                        id="postalCode"
                        label="Postal Code"
                        error={Boolean(errors.postalCode)}
                        helperText={
                          errors.postalCode
                            ? errors.postalCode.type === 'minLength'
                              ? 'Postal Code must be 6 characters long'
                              : 'Postal Code is required'
                            : ''
                        }
                        {...field}
                      ></TextField>
                    )}
                  ></Controller>
                </ListItem>

                <ListItem>
                  <Controller
                    name="country"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: true,
                      minLength: 2,
                    }}
                    render={({ field }) => (
                      <TextField
                        variant="outlined"
                        fullWidth
                        id="country"
                        label="Country"
                        error={Boolean(errors.country)}
                        helperText={
                          errors.country
                            ? errors.country.type === 'minLength'
                              ? 'Country must be 2 characters long'
                              : 'Country is required'
                            : ''
                        }
                        {...field}
                      ></TextField>
                    )}
                  ></Controller>
                </ListItem>

                <ListItem>
                  <button className="button is-link is-fullwidth is-size-5">
                    Continue
                  </button>
                </ListItem>
              </List>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Shipping;
