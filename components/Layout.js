import Footer from './Footer';
import Navbar from './Navbar';
import Head from 'next/head';

const Layout = ({ children, title, description }) => {
  return (
    <>
      <Head>
        <title>{title ? `${title} | Ecommerce` : 'Ecommerce'}</title>
        {description && <meta name="description" content={description} />}
      </Head>
      <Navbar />
      <div className="container" style={{ minHeight: '80vh' }}>
        {children}
      </div>
      <Footer />
    </>
  );
};

export default Layout;
