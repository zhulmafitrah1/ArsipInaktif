const API_BASE_URL = "http://127.0.0.1:8000/api";

const getHeaders = () => ({
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
});

const handleResponse = async (res) => {
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    return;
  }

  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { error: "Invalid JSON response", raw: text };
  }
};

export const apiClient = {
  /**
   * GET request
   */
  async get(endpoint) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        credentials: "include",
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.error(`[GET] ${endpoint} failed:`, error);
      throw error;
    }
  },

  /**
   * POST request
   */
  async post(endpoint, data = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch (error) {
      console.error(`[POST] ${endpoint} failed:`, error);
      throw error;
    }
  },

  /**
   * POST request dengan FormData (untuk upload file)
   */
  async postForm(endpoint, formData) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
          // Jangan set Content-Type, biarkan browser set otomatis untuk FormData
        },
        body: formData,
      });
      return await handleResponse(res);
    } catch (error) {
      console.error(`[POST FORM] ${endpoint} failed:`, error);
      throw error;
    }
  },

  /**
   * PUT request
   */
  async put(endpoint, data = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        credentials: "include",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch (error) {
      console.error(`[PUT] ${endpoint} failed:`, error);
      throw error;
    }
  },

  /**
   * PUT request dengan FormData (untuk update file)
   */
  async putForm(endpoint, formData) {
    try {
      // Laravel tidak support PUT dengan FormData, gunakan POST + _method spoofing
      formData.append("_method", "PUT");
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: formData,
      });
      return await handleResponse(res);
    } catch (error) {
      console.error(`[PUT FORM] ${endpoint} failed:`, error);
      throw error;
    }
  },

  /**
   * DELETE request
   */
  async delete(endpoint) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "DELETE",
        credentials: "include",
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.error(`[DELETE] ${endpoint} failed:`, error);
      throw error;
    }
  },
};