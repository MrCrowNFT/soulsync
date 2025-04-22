import axios from "axios";

export const refreshAccessTokenRequest = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    const urlApi =
      import.meta.env.VITE_API_URL || "https://soulsync-fxrq.onrender.com";
    const res = await axios.post(
      `${urlApi}/auth/refresh-token`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      }
    );

    if (res.data && res.data.accessToken) {
      localStorage.setItem("accessToken", res.data.accessToken);
      return res.data.accessToken;
    }

    return null;
  } catch (err) {
    console.error("Token refresh error:", err);
    throw err;
  }
};
