"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { color } from "framer-motion";

type BillingInterval = "month" | "year";

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
    billingInterval: "month" as BillingInterval,
  });

  useEffect(() => {
    if (!userId || !session?.user?.accessToken) return;
    loadProducts();
  }, [userId, session?.user?.accessToken]);

  async function loadProducts() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products`,
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
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
    if (!newProd.name || !newProd.price) {
      return alert("Fill out name and price");
    }
    if (newProd.description.trim().length === 0) {
      return alert("Please add a short description for the product");
    }

    const priceCents = Math.round(Number(newProd.price) * 100);
    if (isNaN(priceCents) || priceCents <= 0) {
      return alert("Invalid price");
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
          body: JSON.stringify({
            title: newProd.name,
            description: newProd.description,
            priceCents,
            billingInterval: newProd.billingInterval,
          }),
        }
      );

      const json = await res.json();
      if (!json.ok) {
        return alert(json.error || "Failed to create product");
      }

      setNewProd({
        name: "",
        price: "",
        description: "",
        billingInterval: "month",
      });

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
        <h2 className="chart-title">Create Product</h2>

        <div style={{ marginTop: 12 }}>
          <div className="muted">Product Name</div>
          <input
            className="auth-input"
            value={newProd.name}
            onChange={(e) =>
              setNewProd({ ...newProd, name: e.target.value })
            }
            placeholder="VIP Telegram Access"
          />

          <div className="muted" style={{ marginTop: 12 }}>
            Price (INR)
          </div>
          <input
            className="auth-input"
            value={newProd.price}
            onChange={(e) =>
              setNewProd({ ...newProd, price: e.target.value })
            }
            placeholder="9.99"
          />

          <div className="muted" style={{ marginTop: 12 }}>
            Billing Interval
          </div>
          <select
            className="auth-input"
            value={newProd.billingInterval}
            onChange={(e) =>
              setNewProd({
                ...newProd,
                billingInterval: e.target.value as BillingInterval,
              })
            }
          >
            <option style={{color: "black"}} value="month">Monthly</option>
            <option style={{color: "black"}} value="year">Yearly</option>
          </select>

          <div className="muted" style={{ marginTop: 12 }}>
            Description
          </div>
          <textarea
            className="auth-input"
            style={{ height: 80 }}
            value={newProd.description}
            onChange={(e) =>
              setNewProd({ ...newProd, description: e.target.value })
            }
            placeholder="What does this product unlock?"
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

      {/* PRODUCT LIST */}
      <div className="chart-card" style={{ marginTop: 30 }}>
  <h2 className="chart-title">Your Products</h2>

  {loading ? (
    <div className="no-data">Loading products…</div>
  ) : products.length === 0 ? (
    <div className="no-data">No products created yet.</div>
  ) : (
    <div style={{ marginTop: 20 }}>
      {/* HEADER */}
      <div
        className="grid items-center px-4 py-2 text-sm font-semibold text-gray-500"
        style={{ gridTemplateColumns: "3fr 2fr 2fr 2fr" }}
      >
        <span>Product</span>
        <span>Price</span>
        <span>Interval</span>
        <span className="text-right">Actions</span>
      </div>

      {/* ROWS */}
      <div className="space-y-2">
        {products.map((p) => (
          <div
            key={p.id}
            className="grid items-center p-4 border rounded-lg"
            style={{ gridTemplateColumns: "3fr 2fr 2fr 2fr" }}
          >
            {/* PRODUCT */}
            <div>
              <p className="font-semibold">{p.title}</p>
              {p.description && (
                <p className="text-sm text-gray-500 line-clamp-1">
                  {p.description}
                </p>
              )}
            </div>

            {/* PRICE */}
            <div>
              ₹{(p.priceCents / 100).toFixed(2)}
            </div>
              
            {/* INTERVAL */}
            <div className="capitalize">
              {p.billingInterval}
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() =>
                  window.location.assign(`/dashboard/products/${p.id}`)
                }
                className="text-sm underline"
              >
                Manage Access
              </button>

              <button
                onClick={async () => {
                  if (!confirm("Delete this product?")) return;

                  await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/products/${p.id}`,
                    {
                      method: "DELETE",
                      headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                      },
                    }
                  );

                  loadProducts();
                }}
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}
</div>

    </div>
  );
}
