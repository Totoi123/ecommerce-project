import Image from 'next/image';
import emptycart from '../public/images/emptycart.png';
import Link from 'next/link';

const EmptyCart = () => {
  return (
    <div className="container has-text-centered">
      <figure className="image ">
        <Image src={emptycart} alt="empty Cart" width={600} height={500} />
      </figure>
      <p className="is-size-5 has-tex-grey">
        Cart is Empty.{' '}
        <Link href="/" className="has-text-link">
          Go shopping
        </Link>{' '}
      </p>
    </div>
  );
};

export default EmptyCart;
