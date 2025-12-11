import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function testLogin() {
  try {
    console.log("Starting login test...");
    const response = await api.post("/admin/login", {
      username: "admin",
      password: "admin123",
    });
    console.log("Login response:", response);
    return response.data;
  } catch (error) {
    console.error("Login test failed:", error);
    if (error.response) {
      console.error(
        "Response error:",
        error.response.status,
        error.response.data
      );
    }
    if (error.request) {
      console.error("Request error - no response:", error.request);
    }
    throw error;
  }
}

// Run test
testLogin().catch(console.error);
