import axios from "axios";

export const AuthService = {
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(
        "https://asl-aviation-server.onrender.com/api/auth/login",
        {
          email,
          password,
        },
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};
