"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api/axios";
import type { CurrentUser } from "../types/user";

export function useCurrentUser(enabled = true) {
    return useQuery({
        queryKey: ["current-user"],
        queryFn: async () => {
            const response = await api.get<{
                success: boolean;
                data: CurrentUser;
            }>("/users/me");

            return response.data.data;
        },
        enabled,
    });
}