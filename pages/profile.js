import Layout from '../components/Layout';
import { Controller, useForm } from 'react-hook-form';
import { List, ListItem, TextField } from '@material-ui/core';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import NexLink from 'next/link';
import React, { useEffect, useContext } from 'react';
import { getError } from '../utils/error';
import { Store } from '../utils/Store';

import { useSnackbar } from 'notistack';
import Cookies from 'js-cookie';

const Profile = () => {
  const { state, dispatch } = useContext(Store);
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const router = useRouter();

  const { userInfo } = state;

  useEffect(() => {
    if (!userInfo) {
      return router.push('/login');
    }
    setValue('name', userInfo.name);
    setValue('email', userInfo.email);
  }, []);
  const submitHandler = async ({ name, email, password, confirmPassword }) => {
    closeSnackbar();
    if (password !== confirmPassword) {
      enqueueSnackbar("Passwords don't match", { variant: 'error' });
      return;
    }
    try {
      const { data } = await axios.put(
        '/api/users/profile',
        {
          name,
          email,
          password,
        },
        { headers: { authorization: `Bearer ${userInfo.token}` } }
      );
      dispatch({ type: 'USER_LOGIN', payload: data });
      Cookies.set('userInfo', data);

      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(getError(err), { variant: 'error' });
    }
  };
  return (
    <Layout title="Profile">
      <div className="container">
        <h1 className="is-size-5 has-text-link mt-5">User Profile</h1>
        <div className="columns">
          <div className="column is-4">
            <div className="card">
              <div className="card-content">
                <div className="content"></div>
              </div>
            </div>
          </div>
          <div className="column is-8">
            <div className="card">
              <div className="card-content">
                <div className="content">
                  <h1 className="is-size-4 has-text-link title has-text-centered">
                    Profile
                  </h1>

                  <form onSubmit={handleSubmit(submitHandler)}>
                    <List>
                      <ListItem>
                        <Controller
                          name="name"
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
                              id="name"
                              label="Name"
                              inputprops={{ type: 'name' }}
                              error={Boolean(errors.name)}
                              helperText={
                                errors.name
                                  ? errors.name.type === 'minLength'
                                    ? 'Name must be at least 2 characters long'
                                    : 'Name is required'
                                  : ''
                              }
                              {...field}
                            ></TextField>
                          )}
                        ></Controller>
                      </ListItem>
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
                              type="password"
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
                        <Controller
                          name="confirmPassword"
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
                              id="confirmPassword"
                              label="Confirm Password"
                              type="password"
                              error={Boolean(errors.password)}
                              helperText={
                                errors.password
                                  ? errors.password.type === 'minLength'
                                    ? 'Confirm Passowrd must be at least 6 characters long'
                                    : 'Confirm Password is required'
                                  : ''
                              }
                              {...field}
                            ></TextField>
                          )}
                        ></Controller>
                      </ListItem>
                      <ListItem>
                        <button className="button is-link is-fullwidth is-size-5">
                          Update
                        </button>
                      </ListItem>
                    </List>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(Profile), { ssr: false });
