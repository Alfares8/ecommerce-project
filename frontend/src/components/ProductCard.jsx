import { Link } from 'react-router-dom';
import { useCart } from '../context/Cartcontext.jsx'

export default function ProductCard({ product }) {
  const { add } = useCart();

  return (
    <div className="card">
      <img
        src={product.image_url}
        alt={product.name}
        className="w-full h-48 object-cover rounded mb-3"
      />
      <h3 className="font-semibold">{product.name}</h3>
      <p className="text-sm text-gray-500 line-clamp-2">
        {product.description}
      </p>

      <div className="flex items-center justify-between mt-3">
        <span className="font-bold">€{Number(product.price).toFixed(2)}</span>
        <div className="flex gap-2">
          <button className="btn" onClick={() => add(product, 1)}>
            أضف للسلة
          </button>
          <Link className="btn bg-gray-800 hover:bg-gray-700" to={`/product/${product._id}`}>
            عرض
          </Link>
        </div>
      </div>
    </div>
  );
}