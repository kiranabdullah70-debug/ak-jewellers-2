import React from 'react';
import './App.css';

function App() {
  const products = [
    {name: "Sarah Name Bracelet", img: "/src/assets/images/bracelet_ring_set_17799.png", price: "Rs. 899"},
    {name: "Butterfly Set", img: "/src/assets/images/butterfly_jewelry_set_17.png", price: "Rs. 1299"},
    {name: "Chain Bracelet", img: "/src/assets/images/chain_bracelet_1779.png", price: "Rs. 599"},
  ];

  return (
    <div className="container">
      <h1>AK Jewellers</h1>
      <div className="product-grid">
        {products.map((p, i) => (
          <div key={i} className="product-card">
            <img src={p.img} alt={p.name} />
            <h3>{p.name}</h3>
            <p>{p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
export default App;
