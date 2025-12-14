// "use client";

// import axios from "axios";
// import PageRenderer from "../../../components/PageRenderer";
// import { useEffect, useState } from "react";
// import { notFound } from "next/navigation";

// export default function PublicSalesPage({ params }) {
//   const { handle, slug } = params;
//   const dynamic = "force-static";
//   const BLOCKED = ["dashboard", "creator", "settings", "admin", "api"];

//   if (BLOCKED.includes(params.handle)) {
//     notFound(); // Next.js 404 page
//   }
//   const [loading, setLoading] = useState(true);
//   const [payload, setPayload] = useState<any>(null);

//   useEffect(() => {
//     async function load() {
//       try {
//         const res = await axios.get(
//           `${process.env.NEXT_PUBLIC_API_URL}/pages/${handle}/${slug}`
//         );

//         setPayload(res.data);
//       } catch (err) {
//         console.error("Public sales page error:", err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     load();
//   }, [handle, slug]);

//   if (loading) {
//     return <div className="no-data">Loading page…</div>;
//   }

//   if (!payload || !payload.page) {
//     return (
//       <div style={{ padding: 40 }}>
//         <h2>Page not found</h2>
//       </div>
//     );
//   }

//   return (
//     <PageRenderer
//       page={payload.page}
//     />
//   );
// }
