import Link from 'next/link';
import { useContext, useState } from 'react';
import Store from '../utils/Store';
import { Badge, Button, Menu, MenuItem } from '@material-ui/core';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

const Navbar = () => {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const [anchorEl, setAnchorEl] = useState(null);

  const loginClickHandler = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const loginMenuCloseHandler = () => {
    setAnchorEl(null);
  };

  const logoutClickHandler = () => {
    setAnchorEl(null);
    dispatch({ type: 'USER_LOGOUT' });
    Cookies.remove('userInfo');
    Cookies.remove('cartItems');
    router.push('/');
  };
  return (
    <nav className="navbar is-transparent is-fixed-top has-shadow">
      <div className="container">
        <div className="navbar-header">
          <div className="navbar-brand">
            <Link href="/">
              <a className="navbar-item is-size-4 title has-text-link-dark">
                Ecommerce
              </a>
            </Link>
          </div>
        </div>
        <div className="navbar-menu">
          <div className="navbar-end">
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
                  <MenuItem onClick={loginMenuCloseHandler}>Profile</MenuItem>
                  <MenuItem onClick={loginMenuCloseHandler}>
                    My Account
                  </MenuItem>
                  <MenuItem onClick={logoutClickHandler}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <Link href="/login">
                <a className="navbar-item is-size-5 has-text-grey">Login</a>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
