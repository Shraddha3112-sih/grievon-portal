import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  T as Grievance,
  GrievanceInput,
  GrievanceStats,
  Status,
  UserProfile,
  UserRole,
} from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useStats() {
  const { actor, isFetching } = useActor();
  return useQuery<GrievanceStats>({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyGrievances() {
  const { actor, isFetching } = useActor();
  return useQuery<Grievance[]>({
    queryKey: ["myGrievances"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyGrievances();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllGrievances() {
  const { actor, isFetching } = useActor();
  return useQuery<Grievance[]>({
    queryKey: ["allGrievances"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllGrievances();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<UserRole>({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSetupUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      principal,
      role,
      name,
    }: {
      principal: import("@icp-sdk/core/principal").Principal;
      role: UserRole;
      name: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.assignCallerUserRole(principal, role);
      const profile: UserProfile = { name };
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerRole"] });
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}

export function useSubmitGrievance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: GrievanceInput) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitGrievance(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myGrievances"] });
      queryClient.invalidateQueries({ queryKey: ["allGrievances"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdateGrievanceStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      remark,
    }: { id: string; status: Status; remark: string | null }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateGrievanceStatus(id, status, remark);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allGrievances"] });
      queryClient.invalidateQueries({ queryKey: ["myGrievances"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}
