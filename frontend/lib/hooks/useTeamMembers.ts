/**
 * @fileoverview useTeamMembers Hook
 * Manages team members with CRUD operations (fetch, add, remove)
 */

import { useState, useEffect, useCallback } from "react";
import { getTeamById, addTeamMember, removeTeamMember } from "@/lib/services/teams/teamService";
import { Member } from "@/lib/types/teams";
import { transformMembers } from "@/lib/utils/teamTransformers";

interface UseTeamMembersResult {
  members: Member[];
  loading: boolean;
  error: string | null;
  addMembers: (memberIds: number[]) => Promise<void>;
  removeMember: (memberId: number) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage team members with CRUD operations
 * @param teamId - The ID of the team
 * @param managerId - The ID of the team manager
 * @param teamShift - The formatted shift string for members
 * @returns Members array with CRUD operations and state
 */
export function useTeamMembers(
  teamId: number,
  managerId: number | null,
  teamShift: string,
): UseTeamMembersResult {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!managerId) return;

    try {
      setLoading(true);
      setError(null);

      const teamData = await getTeamById(teamId);
      const transformedMembers = transformMembers(teamData.members, managerId, teamShift);
      setMembers(transformedMembers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Équipe introuvable");
    } finally {
      setLoading(false);
    }
  }, [teamId, managerId, teamShift]);

  useEffect(() => {
    if (teamId && managerId) {
      fetchMembers();
    }
  }, [teamId, managerId, teamShift, fetchMembers]);

  /**
   * Add multiple members to the team
   */
  const addMembers = async (memberIds: number[]): Promise<void> => {
    try {
      // Add each member to the team
      await Promise.all(memberIds.map((userId) => addTeamMember(teamId, userId)));

      // Refresh member list
      await fetchMembers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add members";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Remove a member from the team
   */
  const removeMember = async (memberId: number): Promise<void> => {
    try {
      await removeTeamMember(teamId, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to remove member";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    members,
    loading,
    error,
    addMembers,
    removeMember,
    refetch: fetchMembers,
  };
}
