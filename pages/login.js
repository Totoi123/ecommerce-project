import Layout from '../components/Layout';
import { List, ListItem, TextField } from '@material-ui/core';
import Link from 'next/link';
import axios from 'axios';
import { useContext, useEffect } from 'react';
import { Store } from '../utils/Store';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { Controller, useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';

const Login = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const { state, dispatch } = useContext(Store);
  const router = useRouter();
  const { redirect } = router.query;
  const { userInfo } = state;

  useEffect(() => {
    if (userInfo) {
      router.push('/');
    }
  }, []);

  const submitHandler = async ({ email, password }) => {
    closeSnackbar();
    try {
      const { data } = await axios.post('/api/users/login', {
        email,
        password,
      });
      dispatch({ type: 'USER_LOGIN', payload: data });
      Cookies.set('userInfo', JSON.stringify(data));
      router.push(redirect || '/');
    } catch (err) {
      enqueueSnackbar(
        err.response.data ? err.response.data.message : err.message,
        { variant: 'error' }
      );
    }
  };
  return (
    <Layout title="Login">
      <section className="hero  is-fullheight-with-navbar">
        <div className="hero-body">
          <div className="container has-text-centered">
            <h1 className="title has-text-link is-size-1">Login</h1>
            <form
              style={{ maxWidth: '800px', margin: '0 auto' }}
              onSubmit={handleSubmit(submitHandler)}
            >
              <List>
                <ListItem>
                  <Controller
                    name="email"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: true,
                      pattern: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
                    }}
                    render={({ field }) => (
                      <TextField
                        variant="outlined"
                        fullWidth
                        id="email"
                        label="Email"
                        inputprops={{ type: 'email' }}
                        error={Boolean(errors.email)}
                        helperText={
                          errors.email
                            ? errors.email.type === 'pattern'
                              ? 'Email is not valid'
                              : 'Email is required'
                            : ''
                        }
                        {...field}
                      ></TextField>
                    )}
                  ></Controller>
                </ListItem>
                <ListItem>
                  <Controller
                    name="password"
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
                        id="password"
                        label="Password"
                        inputprops={{ type: 'password' }}
                        error={Boolean(errors.password)}
                        helperText={
                          errors.password
                            ? errors.password.type === 'minLength'
                              ? 'Passowrd must be at least 6 characters long'
                              : 'Password is required'
                            : ''
                        }
                        {...field}
                      ></TextField>
                    )}
                  ></Controller>
                </ListItem>
                <ListItem>
                  <button className="button is-link is-fullwidth is-size-5">
                    Login
                  </button>
                </ListItem>
              </List>
            </form>
            .
            <p className="is-size-4 has-text-grey mt-3">
              {`Don't have an account ?`}{' '}
              <Link href={`/register?redirect=${redirect || '/'}`}>
                <a className="is-size-4 has-text-link">Sign Up</a>
              </Link>{' '}
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Login;
