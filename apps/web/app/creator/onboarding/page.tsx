// "use client";

// import { useSession } from "next-auth/react";
// import axios from "axios";
// import { useState } from "react";

// export default function CreatorOnboarding() {
//   const { data: session } = useSession();

//   const [handle, setHandle] = useState("");
//   const [bio, setBio] = useState("");
//   const [priceCents, setPriceCents] = useState(500);

//   const submit = async () => {
//     const token = session?.accessToken;

//     if (!token) {
//       alert("You are not logged in.");
//       return;
//     }

//     try {
//       const res = await axios.post(
//         `${process.env.NEXT_PUBLIC_API_URL}/creator/onboarding`,
//         { handle, bio, priceCents },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       console.log("Onboarding success:", res.data);
//       window.location.href = "/dashboard";
//     } catch (err: any) {
//       console.error(err);
//       alert("Failed to onboard creator.");
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Creator Onboarding</h1>

//       <input
//         className="border p-2 mb-2 w-full"
//         placeholder="Handle"
//         value={handle}
//         onChange={(e) => setHandle(e.target.value)}
//       />

//       <textarea
//         className="border p-2 mb-2 w-full"
//         placeholder="Bio"
//         value={bio}
//         onChange={(e) => setBio(e.target.value)}
//       />

//       <input
//         className="border p-2 mb-4 w-full"
//         placeholder="Price in cents"
//         type="number"
//         value={priceCents}
//         onChange={(e) => setPriceCents(parseInt(e.target.value))}
//       />

//       <button
//         className="px-4 py-2 bg-blue-600 text-white rounded"
//         onClick={submit}
//       >
//         Submit
//       </button>
//     </div>
//   );
// }
