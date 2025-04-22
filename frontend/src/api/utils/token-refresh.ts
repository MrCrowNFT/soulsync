import axios from "axios";

export const refreshAccessTokenRequest = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    const urlApi = import.meta.env.API_URL;
    //todo fix this, to the deployed address
    const res = await axios.post(
      `${urlApi}/auth//refresh-token`,
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
