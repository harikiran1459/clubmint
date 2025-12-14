"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { BillingInterval } from "@prisma/client";

export default function ProductsPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.userId;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // new product form
  const [newProd, setNewProd] = useState({
    name: "",
    price: "",
    description: "",
  });

  useEffect(() => {
    if (!userId) return;
    loadProducts();
  }, [userId]);

  async function loadProducts() {
    try {
      if (!session?.accessToken) return;
      const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products`,
    {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    }
  );
      const json = await res.json();
      setProducts(json.products ?? []);
    } catch (err) {
      console.error("Product fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function createProduct() {
    if (!newProd.name || !newProd.price) return alert("Fill out all fields");
    if (!session?.accessToken) return;

    const priceCents = Math.round(Number(newProd.price) * 100);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.accessToken}`, },
          body: JSON.stringify({
            title: newProd.name,
            description: newProd.description,
            priceCents,
          }),
        }
      );

      const json = await res.json();

      if (!json.ok) return alert(json.error || "Failed to create product");

      setNewProd({ name: "", price: "", description: "" });
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Error creating product");
    }
  }

  return (
    <div>
      <h1 className="dashboard-title">Products</h1>

      {/* CREATE PRODUCT */}
      <div className="chart-card" style={{ marginTop: 20 }}>
        <h2 className="chart-title">Create New Product</h2>

        <div style={{ marginTop: 12 }}>
          <div className="muted">Product Name</div>
          <input
            className="auth-input"
            value={newProd.name}
            onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
            placeholder="VIP Telegram Access"
          />

          <div className="muted" style={{ marginTop: 12 }}>Price (USD)</div>
          <input
            className="auth-input"
            value={newProd.price}
            onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
            placeholder="9.99"
          />

          <div className="muted" style={{ marginTop: 12 }}>Description</div>
          <textarea
            className="auth-input"
            style={{ height: 80 }}
            value={newProd.description}
            onChange={(e) =>
              setNewProd({ ...newProd, description: e.target.value })
            }
            placeholder="Access to private group, signals, or coaching"
          />

          <button
            className="auth-btn"
            style={{ marginTop: 16, width: 180 }}
            onClick={createProduct}
          >
            Create Product
          </button>
        </div>
      </div>

      {/* LIST OF PRODUCTS */}
      <div className="chart-card" style={{ marginTop: 30 }}>
        <h2 className="chart-title">Your Products</h2>

        {loading ? (
          <div className="no-data">Loading products…</div>
        ) : products.length === 0 ? (
          <div className="no-data">No products created yet.</div>
        ) : (
          <div className="table" style={{ marginTop: 20 }}>
            <div className="table-header">
              <span>Name</span>
              <span>Price</span>
              <span>Status</span>
              {/* <span>Created</span> */}
            </div>

            {products.map((p) => (
              <div key={p.id} className="table-row">
                <span>{p.title}</span>
                <span>${(p.priceCents / 100).toFixed(2)}</span>
                <span>{p.active ? "Active" : "Inactive"}</span>
                {/* <span>{new Date(p.createdAt).toLocaleDateString()}</span> */}
                <button
  onClick={async () => {
    if (!confirm("Delete this product?")) return;

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${p.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }
    );

    loadProducts();
  }}
  className="text-m text-red-600 hover:underline"
>
  Delete
</button>



              </div>
              
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
