import NextLink from 'next/link';
import Rating from '@material-ui/lab/Rating';
import Image from 'next/image';

const ProductItem = ({ product, addToCartHandler }) => {
  return (
    <div className="card">
      <NextLink href={`/product/${product.slug}`} passHref>
        <div>
          <div className="card-image">
            <figure className="image is-1by1">
              <Image src={product.image} alt={product.name} layout="fill" />
            </figure>
          </div>
          <div className="card-content">
            <div className="content">
              <p className="is-size-4 title">{product.name}</p>
              <p className="is-size-4 subtitle">₹ {product.price}</p>
              <Rating value={product.rating} readOnly></Rating>
            </div>
          </div>
        </div>
      </NextLink>

      <footer className="card-footer p-2">
        <button
          className="button is-danger is-fullwidth is-size-5 title"
          onClick={() => addToCartHandler(product)}
        >
          Add to Cart
        </button>
      </footer>
    </div>
  );
};

export default ProductItem;
