import React from 'react';

function App() {
  const products = [
    {
      id: 1,
      name: "Sarah Name Bracelet",
      price: "Rs. 2,499",
      image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400"
    },
    {
      id: 2,
      name: "Butterfly Set", 
      price: "Rs. 3,999",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400"
    },
    {
      id: 3,
      name: "Chain Bracelet",
      price: "Rs. 1,899", 
      image: "https://images.unsplash.com/photo-1617038220319-276d3cf8f24e?w=400"
    }
  ];

  return (
    <div style={{fontFamily: 'Arial', background: '#fff8f0', minHeight: '100vh'}}>
      <header style={{textAlign: 'center', padding: '30px', background: '#d4af37', color: 'white'}}>
        <h1 style={{margin: 0}}>AK JEWELLERS</h1>
        <p>Premium Customized Jewelry</p>
      </header>
      
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', padding: '40px'}}>
        {products.map(p => (
          <div key={p.id} style={{border: '1px solid #ddd', borderRadius: '10px', padding: '15px', background: 'white', textAlign: 'center'}}>
            <img src={p.image} alt={p.name} style={{width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px'}} />
            <h3>{p.name}</h3>
            <p style={{color: '#d4af37', fontWeight: 'bold', fontSize: '18px'}}>{p.price}</p>
            <button style={{background: '#d4af37', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer'}}>Buy Now</button>
          </div>
        ))}
      </div>
      
      <footer style={{textAlign: 'center', padding: '20px', background: '#333', color: 'white'}}>
        <p>Based in Karachi, Pakistan | Nationwide Delivery</p>
      </footer>
    </div>
  );
}

export default App;
