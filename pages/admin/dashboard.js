import axios from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import NextLink from 'next/link';
import { useEffect, useContext, useReducer } from 'react';
// import { Bar } from 'react-chartjs-2';
import { getError } from '../../utils/error';
import { Store } from '../../utils/Store';
import {
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@material-ui/core';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, summary: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      state;
  }
}
const AdminDashboard = () => {
  const { state } = useContext(Store);
  const router = useRouter();
  const { userInfo } = state;

  const [{ loading, error, summary }, dispatch] = useReducer(reducer, {
    loading: true,
    summary: { salesData: [] },
    error: '',
  });
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  useEffect(() => {
    if (!userInfo) {
      router.push('/login');
    }
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/summary`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, []);
  return (
    <Layout title=" Admin Dashboard">
      <div className="container mt-5">
        <div className="columns">
          <div className="column is-4">
            <div className="card">
              <List>
                <NextLink href="/admin/dashboard" passHref>
                  <ListItem selected button component="a">
                    <ListItemText primary="Admin Dashboard"></ListItemText>
                  </ListItem>
                </NextLink>
                <NextLink href="/admin/orders" passHref>
                  <ListItem button component="a">
                    <ListItemText primary="Orders"></ListItemText>
                  </ListItem>
                </NextLink>
                <NextLink href="/admin/products" passHref>
                  <ListItem button component="a">
                    <ListItemText primary="Products"></ListItemText>
                  </ListItem>
                </NextLink>
                <NextLink href="/admin/users" passHref>
                  <ListItem button component="a">
                    <ListItemText primary="Users"></ListItemText>
                  </ListItem>
                </NextLink>
              </List>
            </div>
          </div>
          <div className="column is-8">
            {loading ? (
              <div>
                <CircularProgress />
              </div>
            ) : error ? (
              <h1>{error}</h1>
            ) : (
              <div className="columns">
                <div className="column is-3">
                  <div className="card has-text-centered">
                    <div className="card-content">
                      <div className="content">
                        <h1 className="is-size-5 has-text-link">
                          Rs . {summary.ordersPrice}
                        </h1>
                        <h1 className="is-size-5 mt-3">Sales</h1>
                      </div>
                    </div>
                    <footer className="card-footer">
                      <NextLink href="/admin/orders">
                        <a className="card-footer-item is-size-5 has-text-link">
                          View Sales
                        </a>
                      </NextLink>
                    </footer>
                  </div>
                </div>

                <div className="column is-3">
                  <div className="card has-text-centered">
                    <div className="card-content">
                      <div className="content">
                        <h1 className="is-size-5 has-text-link">
                          {summary.ordersCount}
                        </h1>
                        <h1 className="is-size-5 mt-3">Orders</h1>
                      </div>
                    </div>
                    <footer className="card-footer">
                      <NextLink href="/admin/orders">
                        <a className="card-footer-item is-size-5 has-text-link">
                          View Orders
                        </a>
                      </NextLink>
                    </footer>
                  </div>
                </div>

                <div className="column is-3">
                  <div className="card has-text-centered">
                    <div className="card-content">
                      <div className="content">
                        <h1 className="is-size-5 has-text-link">
                          {summary.productsCount}
                        </h1>
                        <h1 className="is-size-5 mt-3">Products</h1>
                      </div>
                    </div>
                    <footer className="card-footer">
                      <NextLink href="/admin/products">
                        <a className="card-footer-item is-size-5 has-text-link">
                          View Products
                        </a>
                      </NextLink>
                    </footer>
                  </div>
                </div>

                <div className="column is-3">
                  <div className="card has-text-centered">
                    <div className="card-content">
                      <div className="content">
                        <h1 className="is-size-5 has-text-link">
                          {summary.usersCount}
                        </h1>
                        <h1 className="is-size-5 mt-3">Users</h1>
                      </div>
                    </div>
                    <footer className="card-footer">
                      <NextLink href="/admin/users">
                        <a className="card-footer-item is-size-5 has-text-link">
                          View Users
                        </a>
                      </NextLink>
                    </footer>
                  </div>
                </div>
              </div>
            )}
            <div className="columns">
              <div className="column is-12">
                <div className="card">
                  <div className="card-content">
                    <h1 className="is-size-5 has-text-link title">
                      Sales Chart
                    </h1>
                    <List>
                      <ListItem>
                        <Line
                          data={{
                            labels: summary.salesData.map((x) => x._id),
                            datasets: [
                              {
                                label: 'Sales',
                                backgroundColor: 'rgba(162, 222, 208, 1)',
                                data: summary.salesData.map(
                                  (x) => x.totalSales
                                ),
                              },
                            ],
                          }}
                          options={{
                            legend: { display: true, position: 'right' },
                          }}
                        ></Line>
                      </ListItem>
                    </List>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(AdminDashboard), { ssr: false });
