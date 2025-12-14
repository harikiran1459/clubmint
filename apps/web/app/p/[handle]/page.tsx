// "use client";

// import axios from "axios";

// // Define safe response shapes
// type CreatorPublicResponse = {
//   creator: {
//     handle: string;
//     bio?: string;
//   };
//   product: {
//     id: string;
//     priceCents: number;
//     billingInterval: string;
//   };
// };

// export default async function CreatorPublicPage({ params }: any) {
//   const handle = params.handle as string;

//   let data: CreatorPublicResponse | null = null;

//   try {
//     const res = await axios.get(
//       `${process.env.NEXT_PUBLIC_API_URL}/creator/public/${handle}`
//     );

//     data = res.data as CreatorPublicResponse;
//   } catch (err) {
//     return (
//       <div style={{ padding: 40 }}>
//         <h2>Creator not found</h2>
//       </div>
//     );
//   }

//   if (!data) {
//     return (
//       <div style={{ padding: 40 }}>
//         <h2>Creator not found</h2>
//       </div>
//     );
//   }

//   const { creator, product } = data;


//   return (
//     <div style={{ padding: 40, maxWidth: 600 }}>
//       <h1>@{creator.handle}</h1>
//       <p>{creator.bio}</p>

//       <h3>Membership</h3>
//       <p>
//         <strong>${(product.priceCents / 100).toFixed(2)}</strong> /{" "}
//         {product.billingInterval}
//       </p>

//       <button
//         style={{ padding: 12, marginTop: 15 }}
//         onClick={() => {
//           window.location.href =
//             `/checkout?productId=${product.id}&creator=${creator.handle}`;
//         }}
//       >
//         Subscribe →
//       </button>
//     </div>
//   );
// }
