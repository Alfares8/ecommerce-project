import { createContext, useContext, useMemo, useState, useEffect } from 'react';

const CartCtx = createContext();
export const useCart = () => useContext(CartCtx);

export default function CartProvider({ children }) {
  const [items, setItems] = useState(()=> {
    try { return JSON.parse(localStorage.getItem('cart')||'[]'); }
    catch { return []; }
  });

  useEffect(()=>{ localStorage.setItem('cart', JSON.stringify(items)); }, [items]);

  const add = (product, quantity = 1) => {
    setItems(prev => {
      const id = product._id || product.id;
      const idx = prev.findIndex(i => i.productId === id);
      const q = Math.max(1, Number(quantity) || 1);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: (copy[idx].quantity || 1) + q };
        return copy;
      }
      return [
        ...prev,
        {
          productId: id,
          name: product.name || '',
          price: Number(product.price) || 0,
          image_url: product.image_url || product.imageUrl || '',
          quantity: q
        }
      ];
    });
  };
  const remove = (productId)=> setItems(prev=>prev.filter(i=>i.productId!==productId));
  const update = (productId, q)=> setItems(prev=>prev.map(i=>i.productId===productId? {...i, quantity:Math.max(1,+q||1)}:i));
  const clear = ()=> setItems([]);
  const subtotal = useMemo(()=> items.reduce((s,i)=> s+(+i.price||0)*(+i.quantity||0), 0), [items]);

  const value = useMemo(()=>({items, add, remove, update, clear, subtotal}), [items, subtotal]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}