import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:9000/api/v1",
  withCredentials: true,
  timeout: 30000,
});

// Track if we're currently refreshing the token
let isRefreshing = false;
let refreshSubscribers = [];

// Subscribe to token refresh completion
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Notify all subscribers when token is refreshed
const onTokenRefreshed = (newAccessToken) => {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
};

// List of URLs that don't need authentication
const publicUrls = ["/auth/", "/products"];

// Check if URL is public (doesn't need auth)
const isPublicUrl = (url) => {
  return publicUrls.some((publicUrl) => url.includes(publicUrl));
};

// Check if user has valid token
const hasValidToken = () => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return false;

  try {
    const user = JSON.parse(storedUser);
    return !!(user.accessToken && user.refreshToken);
  } catch (err) {
    return false;
  }
};

// Request Interceptor - Attach access token
apiClient.interceptors.request.use(
  (config) => {
    // Skip token for public routes
    if (isPublicUrl(config.url)) {
      return config;
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.accessToken) {
          config.headers.Authorization = `Bearer ${user.accessToken}`;
        }
      } catch (err) {
        console.error("Failed to parse user data:", err);
        localStorage.removeItem("user");
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if:
    // 1. No response (network error)
    // 2. Already retried
    // 3. Request is to public endpoints
    if (
      !error.response ||
      originalRequest._retry ||
      isPublicUrl(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    // Handle 401 errors (token expired)
    if (error.response.status === 401) {
      // Check if we have a refresh token
      if (!hasValidToken()) {
        // No valid tokens, just reject the error
        // Don't redirect - let the component handle it
        return Promise.reject(error);
      }

      const storedUser = localStorage.getItem("user");
      let user;
      try {
        user = JSON.parse(storedUser);
      } catch (err) {
        localStorage.removeItem("user");
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newAccessToken) => {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      // Mark as retried and start refreshing
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use plain axios to avoid interceptor loop
        const response = await axios.post(
          "http://localhost:9000/api/v1/auth/refresh-token",
          { refreshToken: user.refreshToken },
          { timeout: 30000 }
        );

        if (!response.data || !response.data.accessToken) {
          throw new Error("Invalid refresh response");
        }

        const { accessToken, refreshToken } = response.data;

        // Update stored tokens
        const updatedUser = {
          ...user,
          accessToken,
          refreshToken: refreshToken || user.refreshToken,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Update authorization header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Notify queued requests
        onTokenRefreshed(accessToken);

        isRefreshing = false;

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];

        console.error("Token refresh failed:", refreshError.message);

        // Clear user data
        localStorage.removeItem("user");

        // Don't redirect automatically - let the component handle it
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
