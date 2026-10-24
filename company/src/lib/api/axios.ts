import axios, {
    AxiosError,
    type InternalAxiosRequestConfig,
} from "axios";

let getAccessToken: (() => Promise<string | null>) | null = null;

export function setAccessTokenGetter(
    getter: () => Promise<string | null>,
) {
    getAccessToken = getter;
}

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 15_000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach the current Clerk session token to each request.
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await getAccessToken?.();

        if (token) {
            config.headers.set("Authorization", `Bearer ${token}`);
        }

        return config;
    },
);

// Normalize errors so UI components can display consistent messages.
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string }>) => {
        if (error.response?.status === 401) {
            // Authentication/session handling belongs in the auth layer.
        }

        const message =
            error.response?.data?.message ??
            (error.code === "ECONNABORTED"
                ? "The request timed out. Please try again."
                : error.message === "Network Error"
                    ? "Unable to connect to the server."
                    : "Something went wrong. Please try again.");

        return Promise.reject(
            Object.assign(new Error(message), {
                status: error.response?.status,
                code: error.code,
            }),
        );
    },
);