"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { User } from "@/interfaces/user.interface";
import { getUserData } from "@/lib/auth";

export function useUserData() {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  async function fetchUser() {
    setLoading(true);

    const data = await getUserData();

    if (!data.success) {
      toast.error(data.message);
    }

    if (data?.data) {
      setUser(data.data);
    }
    setLoading(false);
  }

  const refetchUser = () => {
    fetchUser();
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    loading,
    refetchUser,
  };
}
