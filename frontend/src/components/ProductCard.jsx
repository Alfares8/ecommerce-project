import { Link } from "react-router-dom";
import { useCart } from "../context/Cartcontext.jsx";

export default function ProductCard({ product }) {
  const { add } = useCart();

  const handleAdd = () => {
    add(
      {
        productId: product._id,   // مهم عشان الـ backend يتعرف على الـ Product
        name: product.name,
        price: product.price,
        image_url: product.image_url,
      },
      1
    );
  };

  return (
    <div className="card border rounded-lg p-3 shadow-sm hover:shadow-md transition">
      <img
        src={product.image_url}
        alt={product.name}
        className="w-full h-48 object-cover rounded mb-3"
      />

      <h3 className="font-semibold text-lg">{product.name}</h3>
      <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>

      <div className="flex items-center justify-between mt-3">
        <span className="font-bold text-indigo-700">
          €{Number(product.price).toFixed(2)}
        </span>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-500"
            onClick={handleAdd}
          >
            أضف للسلة
          </button>
          <Link
            className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700"
            to={`/product/${product._id}`}
          >
            عرض
          </Link>
        </div>
      </div>
    </div>
  );
}