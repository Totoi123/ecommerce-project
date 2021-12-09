import Link from 'next/link';
import { useContext, useState, useEffect } from 'react';
import { Store } from '../utils/Store';
import {
  Badge,
  Button,
  Menu,
  MenuItem,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  Divider,
  ListItemText,
  Toolbar,
  InputBase,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import MenuIcon from '@material-ui/icons/Menu';
import CancelIcon from '@material-ui/icons/Cancel';
import { getError } from '../utils/error';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const Navbar = () => {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const [anchorEl, setAnchorEl] = useState(null);

  const loginClickHandler = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const loginMenuCloseHandler = (e, redirect) => {
    setAnchorEl(null);
    if (redirect) {
      router.push(redirect);
    }
  };

  const logoutClickHandler = () => {
    setAnchorEl(null);
    dispatch({ type: 'USER_LOGOUT' });
    Cookies.remove('userInfo');
    Cookies.remove('cartItems');
    router.push('/');
  };

  const [sidbarVisible, setSidebarVisible] = useState(false);
  const sidebarOpenHandler = () => {
    setSidebarVisible(true);
  };
  const sidebarCloseHandler = () => {
    setSidebarVisible(false);
  };

  const [categories, setCategories] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`/api/products/categories`);
      setCategories(data);
    } catch (err) {
      enqueueSnackbar(getError(err), { variant: 'error' });
    }
  };

  const [query, setQuery] = useState('');
  const queryChangeHandler = (e) => {
    setQuery(e.target.value);
  };
  const submitHandler = (e) => {
    e.preventDefault();
    router.push(`/search?query=${query}`);
  };

  useEffect(() => {
    fetchCategories();
  }, []);
  return (
    <nav className="navbar is-transparent is-fixed-top has-shadow">
      <Toolbar>
        <Box display="flex" alignItems="center">
          <IconButton
            edge="start"
            aria-label="open drawer"
            onClick={sidebarOpenHandler}
          >
            <MenuIcon />
          </IconButton>
        </Box>
        <Drawer
          anchor="left"
          open={sidbarVisible}
          onClose={sidebarCloseHandler}
        >
          <List>
            <ListItem>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <h1 className="is-size-5 has-text-link">
                  Shopping by category
                </h1>
                <IconButton aria-label="close" onClick={sidebarCloseHandler}>
                  <CancelIcon />
                </IconButton>
              </Box>
            </ListItem>
            <Divider light />
            {categories.map((category) => (
              <Link
                key={category}
                href={`/search?category=${category}`}
                passHref
              >
                <ListItem button component="a" onClick={sidebarCloseHandler}>
                  <ListItemText primary={category}></ListItemText>
                </ListItem>
              </Link>
            ))}
          </List>
        </Drawer>
      </Toolbar>

      <div className="navbar-header">
        <div className="navbar-brand">
          <Link href="/">
            <a className="navbar-item is-size-4 title has-text-link-dark mt-2">
              Ecommerce
            </a>
          </Link>
        </div>
      </div>
      <div className="navbar-menu">
        <div className="navbar-end">
          <div className="navbar-items input is-link mt-3">
            <form onSubmit={submitHandler}>
              <InputBase
                name="query"
                placeholder="Search products"
                onChange={queryChangeHandler}
              />
              <IconButton type="submit" aria-label="search">
                <SearchIcon />
              </IconButton>
            </form>
          </div>
          <Link href="/cart">
            <a className="navbar-item is-size-5 has-text-grey">
              {cart.cartItems.length > 0 ? (
                <Badge color="secondary" badgeContent={cart.cartItems.length}>
                  Cart
                </Badge>
              ) : (
                'Cart'
              )}
            </a>
          </Link>
          {userInfo ? (
            <>
              <Button
                aria-controls="user-menu"
                aria-haspopup="true"
                className="navbar-item has-text-link is-capitalized is-size-5"
                onClick={loginClickHandler}
              >
                {userInfo.name}
              </Button>
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={loginMenuCloseHandler}
              >
                <MenuItem onClick={(e) => loginMenuCloseHandler(e, '/profile')}>
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={(e) => loginMenuCloseHandler(e, '/order-history')}
                >
                  Order History
                </MenuItem>
                {userInfo.isAdmin && (
                  <MenuItem
                    onClick={(e) =>
                      loginMenuCloseHandler(e, '/admin/dashboard')
                    }
                  >
                    Admin Dashboard
                  </MenuItem>
                )}
                <MenuItem onClick={logoutClickHandler}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Link href="/login">
              <a className="navbar-item is-size-5 has-text-grey mr-5">Login</a>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
