import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Store from '../utils/Store';
import { useContext } from 'react';

const Shipping = () => {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { userInfo } = state;

  if (!userInfo) {
    router.push('/login?redirect=/shipping');
  }

  return (
    <Layout title="Shipping">
      <h1>Shipping</h1>
    </Layout>
  );
};

export default Shipping;
